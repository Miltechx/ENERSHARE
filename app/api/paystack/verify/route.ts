import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const userId = decoded.uid

    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    // Check idempotency
    const paymentLog = await adminDb.collection('paymentLogs').doc(reference).get()
    if (!paymentLog.exists) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const paymentData = paymentLog.data()
    if (paymentData?.status === 'success') {
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // Verify with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await paystackResponse.json()

    if (!data.status || data.data.status !== 'success') {
      await adminDb.collection('paymentLogs').doc(reference).update({
        status: 'failed',
        error: data.message,
      })
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    const { metadata, amount } = data.data
    const amountNaira = amount / 100

    // Use writeBatch for atomic updates
    const batch = adminDb.batch()

    // Update payment log
    const paymentLogRef = adminDb.collection('paymentLogs').doc(reference)
    batch.update(paymentLogRef, { status: 'success', verifiedAt: new Date().toISOString() })

    if (metadata.type === 'purchase') {
      // Handle energy purchase
      const listingRef = adminDb.collection('listings').doc(metadata.listingId)
      const listingDoc = await listingRef.get()

      if (!listingDoc.exists) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }

      const listing = listingDoc.data()
      const kwhAmount = metadata.kwhAmount
      const totalPrice = kwhAmount * metadata.pricePerKwh
      const fee = totalPrice * 0.02
      const sellerPayout = totalPrice - fee

      // Update listing kWh available
      batch.update(listingRef, {
        kwhAvailable: listing.kwhAvailable - kwhAmount,
        kwhSold: (listing.kwhSold || 0) + kwhAmount,
        updatedAt: new Date().toISOString(),
      })

      // Update buyer's wallet kWh balance
      const buyerWalletRef = adminDb.collection('wallets').doc(userId)
      const buyerWalletDoc = await buyerWalletRef.get()
      const buyerCurrentKwh = buyerWalletDoc.exists ? buyerWalletDoc.data()?.kwhBalance || 0 : 0
      batch.set(buyerWalletRef, {
        kwhBalance: buyerCurrentKwh + kwhAmount,
        nairaBalance: buyerWalletDoc.exists ? buyerWalletDoc.data()?.nairaBalance || 0 : 0,
        totalSpent: (buyerWalletDoc.exists ? buyerWalletDoc.data()?.totalSpent || 0 : 0) + totalPrice,
        updatedAt: new Date().toISOString(),
      }, { merge: true })

      // Update seller's wallet naira balance
      const sellerWalletRef = adminDb.collection('wallets').doc(metadata.sellerId)
      const sellerWalletDoc = await sellerWalletRef.get()
      const sellerCurrentNaira = sellerWalletDoc.exists ? sellerWalletDoc.data()?.nairaBalance || 0 : 0
      batch.set(sellerWalletRef, {
        nairaBalance: sellerCurrentNaira + sellerPayout,
        totalEarned: (sellerWalletDoc.exists ? sellerWalletDoc.data()?.totalEarned || 0 : 0) + sellerPayout,
        updatedAt: new Date().toISOString(),
      }, { merge: true })

      // Create transaction record
      const transactionRef = adminDb.collection('transactions').doc()
      batch.set(transactionRef, {
        buyerId: userId,
        sellerId: metadata.sellerId,
        listingId: metadata.listingId,
        kwhAmount: kwhAmount,
        pricePerKwh: metadata.pricePerKwh,
        totalNaira: totalPrice,
        platformFee: fee,
        sellerPayout: sellerPayout,
        status: 'completed',
        type: 'purchase',
        paystackReference: reference,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Create notification for buyer
      const buyerNotifRef = adminDb.collection('notifications').doc()
      batch.set(buyerNotifRef, {
        userId: userId,
        title: 'Purchase Successful',
        message: `You purchased ${kwhAmount} kWh of energy for ₦${totalPrice.toLocaleString()}`,
        type: 'transaction',
        isRead: false,
        link: '/wallet',
        createdAt: new Date().toISOString(),
      })

      // Create notification for seller
      const sellerNotifRef = adminDb.collection('notifications').doc()
      batch.set(sellerNotifRef, {
        userId: metadata.sellerId,
        title: 'Energy Sold',
        message: `Your energy listing sold ${kwhAmount} kWh for ₦${sellerPayout.toLocaleString()}`,
        type: 'transaction',
        isRead: false,
        link: '/wallet',
        createdAt: new Date().toISOString(),
      })
    }

    await batch.commit()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Paystack verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}