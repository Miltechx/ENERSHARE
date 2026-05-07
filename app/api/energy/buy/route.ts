import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, updateDoc, addDoc, collection, runTransaction, Timestamp } from "firebase/firestore"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { listing_id } = body

  if (!listing_id) {
    return NextResponse.json({ error: "Listing ID required" }, { status: 400 })
  }

  try {
    const result = await runTransaction(db, async (transaction) => {
      const listingRef = doc(db, "energy_listings", listing_id)
      const listingSnap = await transaction.get(listingRef)

      if (!listingSnap.exists()) {
        throw new Error("Listing not found")
      }

      const listing = listingSnap.data()

      if (listing.listing_status !== "available") {
        throw new Error("Listing not available")
      }

      const buyerWalletRef = doc(db, "wallets", session.user.id)
      const buyerWalletSnap = await transaction.get(buyerWalletRef)
      const buyerBalance = buyerWalletSnap.exists() ? (buyerWalletSnap.data().balance_ngn || 0) : 5000

      const totalPrice = listing.amount_kwh * listing.price_per_kwh_ngn

      if (buyerBalance < totalPrice) {
        throw new Error("Insufficient funds")
      }

      const fee = totalPrice * 0.02

      if (buyerWalletSnap.exists()) {
        transaction.update(buyerWalletRef, { balance_ngn: buyerBalance - totalPrice, updatedAt: Timestamp.now() })
      } else {
        transaction.set(buyerWalletRef, { user_id: session.user.id, balance_ngn: 5000 - totalPrice, createdAt: Timestamp.now() })
      }

      const sellerWalletRef = doc(db, "wallets", listing.seller_id)
      const sellerWalletSnap = await transaction.get(sellerWalletRef)
      const sellerBalance = sellerWalletSnap.exists() ? (sellerWalletSnap.data().balance_ngn || 0) : 0

      if (sellerWalletSnap.exists()) {
        transaction.update(sellerWalletRef, { balance_ngn: sellerBalance + (totalPrice - fee), updatedAt: Timestamp.now() })
      } else {
        transaction.set(sellerWalletRef, { user_id: listing.seller_id, balance_ngn: totalPrice - fee, createdAt: Timestamp.now() })
      }

      const transactionsRef = collection(db, "transactions")
      const txRef = doc(transactionsRef)
      transaction.set(txRef, {
        buyer_id: session.user.id,
        seller_id: listing.seller_id,
        listing_id: listing_id,
        source_type: listing.source_type,
        amount_kwh: listing.amount_kwh,
        price_per_kwh_ngn: listing.price_per_kwh_ngn,
        total_amount: totalPrice,
        fee_ngn: fee,
        tx_status: "completed",
        createdAt: Timestamp.now(),
      })

      transaction.update(listingRef, { listing_status: "sold", sold_to: session.user.id, sold_at: Timestamp.now() })

      return { success: true, transaction_id: txRef.id, amount: listing.amount_kwh, total: totalPrice, fee: fee }
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Buy error:", error)
    return NextResponse.json({ error: error.message || "Purchase failed" }, { status: 500 })
  }
}