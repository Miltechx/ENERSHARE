import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { adminDb } from '@/lib/firebase/admin'

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex')
  return hash === signature
}

export async function POST(request: NextRequest) {
  const payload   = await request.text()
  const signature = request.headers.get('x-paystack-signature') || ''

  if (!verifyWebhookSignature(payload, signature, process.env.PAYSTACK_SECRET_KEY!)) {
    console.error('❌ Invalid webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(payload)

  // ─── charge.success — wallet top-up ─────────────────────────────────────────
  if (event.event === 'charge.success') {
    const { reference, metadata, amount } = event.data
    const userId       = metadata.userId          // ← matches initialize metadata.userId
    const amountInNaira = amount / 100

    if (!userId) {
      console.error('❌ No userId in webhook metadata', metadata)
      return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 })
    }

    try {
      // 1. Verify pending_payments doc exists
      const pendingRef = adminDb.collection('pending_payments').doc(reference)
      const pendingDoc = await pendingRef.get()

      if (!pendingDoc.exists) {
        // Could be a duplicate webhook call — safe to ignore
        console.warn(`⚠️ pending_payments/${reference} not found — may be duplicate`)
        return NextResponse.json({ received: true })
      }

      // 2. Guard against double-processing
      if (pendingDoc.data()?.status === 'completed') {
        console.warn(`⚠️ ${reference} already processed`)
        return NextResponse.json({ received: true })
      }

      // 3. Mark pending payment as completed
      await pendingRef.update({
        status:      'completed',
        completedAt: new Date().toISOString(),
      })

      // 4. Credit user's wallet — nairaBalance (consistent with entire app)
      const walletRef = adminDb.collection('wallets').doc(userId)
      const walletDoc = await walletRef.get()

      if (walletDoc.exists) {
        await walletRef.update({
          nairaBalance: (walletDoc.data()?.nairaBalance || 0) + amountInNaira,
          updatedAt:    new Date().toISOString(),
        })
      } else {
        // Create wallet if it somehow doesn't exist
        await walletRef.set({
          userId,
          nairaBalance: amountInNaira,
          kwhBalance:   0,
          totalEarned:  0,
          totalSpent:   0,
          createdAt:    new Date().toISOString(),
          updatedAt:    new Date().toISOString(),
        })
      }

      // 5. Record deposit transaction
      await adminDb.collection('deposits').doc(reference).set({
        userId,
        reference,
        amountNaira:   amountInNaira,
        status:        'completed',
        paymentMethod: 'paystack',
        completedAt:   new Date().toISOString(),
      })

      // 6. Notification
      await adminDb.collection('notifications').add({
        userId,                                  // ← consistent with rest of app
        title:     'Deposit Successful',
        message:   `₦${amountInNaira.toLocaleString()} has been added to your wallet.`,
        type:      'payment',
        read:      false,
        createdAt: new Date().toISOString(),
      })

      console.log(`✅ Credited ₦${amountInNaira} to wallet of user ${userId}`)
      return NextResponse.json({ received: true })

    } catch (error) {
      console.error('❌ Webhook charge.success error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // ─── transfer.success — withdrawal completed ─────────────────────────────────
  if (event.event === 'transfer.success') {
    const { reference, amount, recipient } = event.data
    const amountInNaira = amount / 100

    try {
      const withdrawalRef = adminDb.collection('withdrawals').doc(reference)
      const withdrawalDoc = await withdrawalRef.get()

      if (!withdrawalDoc.exists) {
        console.warn(`⚠️ withdrawal/${reference} not found`)
        return NextResponse.json({ received: true })
      }

      await withdrawalRef.update({
        status:      'completed',
        processedAt: new Date().toISOString(),
      })

      // Notify the user their withdrawal landed
      const userId = withdrawalDoc.data()?.userId
      if (userId) {
        await adminDb.collection('notifications').add({
          userId,
          title:     'Withdrawal Successful',
          message:   `₦${amountInNaira.toLocaleString()} has been sent to ${recipient.details?.account_number || 'your bank'}.`,
          type:      'withdrawal',
          read:      false,
          createdAt: new Date().toISOString(),
        })
      }

      console.log(`✅ Transfer completed: ₦${amountInNaira} to ${recipient?.details?.account_number}`)
      return NextResponse.json({ received: true })

    } catch (error) {
      console.error('❌ Webhook transfer.success error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // ─── transfer.failed — withdrawal failed ─────────────────────────────────────
  if (event.event === 'transfer.failed') {
    const { reference, amount } = event.data
    const amountInNaira = amount / 100

    try {
      const withdrawalDoc = await adminDb.collection('withdrawals').doc(reference).get()
      if (!withdrawalDoc.exists) return NextResponse.json({ received: true })

      const { userId } = withdrawalDoc.data()!

      // Refund the amount back to their wallet
      const walletRef = adminDb.collection('wallets').doc(userId)
      const walletDoc = await walletRef.get()
      if (walletDoc.exists) {
        await walletRef.update({
          nairaBalance: (walletDoc.data()?.nairaBalance || 0) + amountInNaira,
          updatedAt:    new Date().toISOString(),
        })
      }

      await adminDb.collection('withdrawals').doc(reference).update({
        status:    'failed',
        failedAt:  new Date().toISOString(),
      })

      await adminDb.collection('notifications').add({
        userId,
        title:     'Withdrawal Failed',
        message:   `Your withdrawal of ₦${amountInNaira.toLocaleString()} failed. The amount has been returned to your wallet.`,
        type:      'withdrawal_failed',
        read:      false,
        createdAt: new Date().toISOString(),
      })

      console.log(`⚠️ Transfer failed — refunded ₦${amountInNaira} to user ${userId}`)
      return NextResponse.json({ received: true })

    } catch (error) {
      console.error('❌ Webhook transfer.failed error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // All other events — acknowledge receipt
  return NextResponse.json({ received: true })
}