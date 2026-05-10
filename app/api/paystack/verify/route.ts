import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let userId: string
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    userId = decoded.uid
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { reference } = await request.json()
  if (!reference) {
    return NextResponse.json({ error: 'Reference required' }, { status: 400 })
  }

  try {
    // ── 1. Check pending_payments (matches what initialize creates) ──────────────
    const pendingRef = adminDb.collection('pending_payments').doc(reference)
    const pendingDoc = await pendingRef.get()

    if (!pendingDoc.exists) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const pending = pendingDoc.data()!

    // ── 2. Guard: already processed (webhook may have fired first) ───────────────
    if (pending.status === 'completed') {
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // ── 3. Confirm this reference belongs to the requesting user ─────────────────
    if (pending.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // ── 4. Verify with Paystack ──────────────────────────────────────────────────
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    )
    const paystackData = await paystackRes.json()

    if (!paystackData.status || paystackData.data?.status !== 'success') {
      await pendingRef.update({
        status:   'failed',
        failedAt: new Date().toISOString(),
        error:    paystackData.message || 'Paystack verification failed',
      })
      return NextResponse.json({ error: 'Payment not confirmed by Paystack' }, { status: 400 })
    }

    const amountInNaira = paystackData.data.amount / 100

    // ── 5. Credit wallet — nairaBalance (consistent with entire app) ─────────────
    const walletRef = adminDb.collection('wallets').doc(userId)
    const walletDoc = await walletRef.get()

    if (walletDoc.exists) {
      await walletRef.update({
        nairaBalance: (walletDoc.data()?.nairaBalance || 0) + amountInNaira,
        updatedAt:    new Date().toISOString(),
      })
    } else {
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

    // ── 6. Mark pending payment as completed ─────────────────────────────────────
    await pendingRef.update({
      status:      'completed',
      completedAt: new Date().toISOString(),
    })

    // ── 7. Record deposit ────────────────────────────────────────────────────────
    await adminDb.collection('deposits').doc(reference).set({
      userId,
      reference,
      amountNaira:   amountInNaira,
      status:        'completed',
      paymentMethod: 'paystack',
      completedAt:   new Date().toISOString(),
    }, { merge: true }) // merge: true prevents error if webhook already created this

    // ── 8. Notification ──────────────────────────────────────────────────────────
    await adminDb.collection('notifications').add({
      userId,
      title:     'Wallet Funded',
      message:   `₦${amountInNaira.toLocaleString()} has been added to your wallet.`,
      type:      'payment',
      read:      false,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, amountNaira: amountInNaira })

  } catch (error) {
    console.error('Verify route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}