import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

const PLATFORM_FEE_PERCENT = 0.025 // 2.5% — EnerShare's cut

export async function POST(request: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let buyerUid: string
  try {
    const token = authHeader.split('Bearer ')[1]
    const decoded = await adminAuth.verifyIdToken(token)
    buyerUid = decoded.uid
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // ─── Payload ─────────────────────────────────────────────────────────────────
  const { listingId, kwhAmount } = await request.json()

  if (!listingId || !kwhAmount || kwhAmount <= 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    // ─── Run everything in a Firestore transaction ──────────────────────────────
    const result = await adminDb.runTransaction(async (tx) => {

      // 1. Get listing
      const listingRef = adminDb.collection('listings').doc(listingId)
      const listingSnap = await tx.get(listingRef)
      if (!listingSnap.exists) throw new Error('Listing not found')

      const listing = listingSnap.data()!
      if (listing.status !== 'active') throw new Error('Listing is no longer active')

      const availableKwh = listing.kwhAvailable - (listing.kwhSold || 0)
      if (kwhAmount > availableKwh) throw new Error(`Only ${availableKwh} kWh available`)

      const sellerId: string = listing.sellerId
      if (sellerId === buyerUid) throw new Error('You cannot buy your own listing')

      // 2. Calculate amounts
      const totalNaira      = parseFloat((kwhAmount * listing.pricePerKwh).toFixed(2))
      const platformFee     = parseFloat((totalNaira * PLATFORM_FEE_PERCENT).toFixed(2))
      const sellerEarns     = parseFloat((totalNaira - platformFee).toFixed(2))

      // 3. Get buyer wallet
      const buyerWalletRef  = adminDb.collection('wallets').doc(buyerUid)
      const buyerSnap       = await tx.get(buyerWalletRef)
      if (!buyerSnap.exists) throw new Error('Buyer wallet not found')

      const buyerWallet     = buyerSnap.data()!
      if ((buyerWallet.nairaBalance || 0) < totalNaira) {
        throw new Error(`Insufficient balance. Need ₦${totalNaira.toLocaleString()}, have ₦${(buyerWallet.nairaBalance || 0).toLocaleString()}`)
      }

      // 4. Get seller wallet
      const sellerWalletRef = adminDb.collection('wallets').doc(sellerId)
      const sellerSnap      = await tx.get(sellerWalletRef)

      // 5. Deduct from buyer
      tx.update(buyerWalletRef, {
        nairaBalance: (buyerWallet.nairaBalance || 0) - totalNaira,
        kwhBalance:   (buyerWallet.kwhBalance   || 0) + kwhAmount,
        totalSpent:   (buyerWallet.totalSpent   || 0) + totalNaira,
        updatedAt:    new Date().toISOString(),
      })

      // 6. Credit seller (97.5% of transaction)
      if (sellerSnap.exists) {
        const sellerWallet = sellerSnap.data()!
        tx.update(sellerWalletRef, {
          nairaBalance: (sellerWallet.nairaBalance || 0) + sellerEarns,
          totalEarned:  (sellerWallet.totalEarned  || 0) + sellerEarns,
          updatedAt:    new Date().toISOString(),
        })
      } else {
        tx.set(sellerWalletRef, {
          userId:       sellerId,
          nairaBalance: sellerEarns,
          kwhBalance:   0,
          totalEarned:  sellerEarns,
          totalSpent:   0,
          createdAt:    new Date().toISOString(),
          updatedAt:    new Date().toISOString(),
        })
      }

      // 7. Update listing sold kWh
      const newKwhSold = (listing.kwhSold || 0) + kwhAmount
      const newStatus  = newKwhSold >= listing.kwhAvailable ? 'completed' : 'active'
      tx.update(listingRef, {
        kwhSold:   newKwhSold,
        status:    newStatus,
        updatedAt: new Date().toISOString(),
      })

      // 8. Record transaction
      const txRef = adminDb.collection('transactions').doc()
      tx.set(txRef, {
        id:            txRef.id,
        listingId,
        buyerId:       buyerUid,
        sellerId,
        kwhAmount,
        pricePerKwh:   listing.pricePerKwh,
        totalNaira,
        platformFee,
        sellerEarns,
        type:          'purchase',
        status:        'completed',
        createdAt:     new Date().toISOString(),
      })

      // 9. Track platform revenue
      const revenueRef = adminDb.collection('platform_revenue').doc()
      tx.set(revenueRef, {
        transactionId: txRef.id,
        amount:        platformFee,
        type:          'trading_fee',
        buyerId:       buyerUid,
        sellerId,
        createdAt:     new Date().toISOString(),
      })

      return {
        transactionId: txRef.id,
        totalNaira,
        platformFee,
        sellerEarns,
        kwhAmount,
        listingTitle: listing.title,
      }
    })

    // 10. Create notifications (outside transaction — non-critical)
    try {
      await Promise.all([
        adminDb.collection('notifications').add({
          userId:    buyerUid,
          title:     'Purchase Successful',
          message:   `You bought ${result.kwhAmount} kWh for ₦${result.totalNaira.toLocaleString()}`,
          type:      'purchase',
          read:      false,
          createdAt: new Date().toISOString(),
        }),
        adminDb.collection('notifications').add({
          userId:    (await adminDb.collection('listings').doc(listingId).get()).data()?.sellerId,
          title:     'Energy Sold!',
          message:   `You sold ${result.kwhAmount} kWh. ₦${result.sellerEarns.toLocaleString()} added to your wallet.`,
          type:      'sale',
          read:      false,
          createdAt: new Date().toISOString(),
        }),
      ])
    } catch (notifErr) {
      console.error('Notification error (non-critical):', notifErr)
    }

    return NextResponse.json({ success: true, ...result })

  } catch (err: any) {
    console.error('Purchase error:', err)
    return NextResponse.json({ error: err.message || 'Purchase failed' }, { status: 400 })
  }
}