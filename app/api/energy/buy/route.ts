import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, updateDoc, addDoc, collection, Timestamp, runTransaction } from "firebase/firestore"

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
    // Use transaction for atomic operation
    const result = await runTransaction(db, async (transaction) => {
      // Get listing
      const listingRef = doc(db, "energy_listings", listing_id)
      const listingSnap = await transaction.get(listingRef)
      
      if (!listingSnap.exists()) {
        throw new Error("Listing not found")
      }
      
      const listing = listingSnap.data()
      
      if (listing.listing_status !== "available") {
        throw new Error("Listing not available")
      }
      
      // Get buyer's wallet
      const walletRef = doc(db, "wallets", session.user.id)
      const walletSnap = await transaction.get(walletRef)
      
      let buyerCredits = 5000 // default demo credits
      if (walletSnap.exists()) {
        buyerCredits = walletSnap.data().demo_credits || 5000
      }
      
      const totalPrice = listing.amount_kwh * listing.price_per_kwh_ngn
      
      if (buyerCredits < totalPrice) {
        throw new Error("Insufficient funds")
      }
      
      // Calculate fee (2%)
      const fee = totalPrice * 0.02
      
      // Update buyer's wallet
      if (walletSnap.exists()) {
        transaction.update(walletRef, {
          demo_credits: buyerCredits - totalPrice,
          updatedAt: Timestamp.now()
        })
      } else {
        transaction.set(walletRef, {
          user_id: session.user.id,
          demo_credits: 5000 - totalPrice,
          balance_ngn: 0,
          createdAt: Timestamp.now()
        })
      }
      
      // Update seller's wallet
      const sellerWalletRef = doc(db, "wallets", listing.seller_id)
      const sellerWalletSnap = await transaction.get(sellerWalletRef)
      let sellerCredits = 0
      if (sellerWalletSnap.exists()) {
        sellerCredits = sellerWalletSnap.data().demo_credits || 0
      }
      
      if (sellerWalletSnap.exists()) {
        transaction.update(sellerWalletRef, {
          demo_credits: sellerCredits + (totalPrice - fee),
          updatedAt: Timestamp.now()
        })
      } else {
        transaction.set(sellerWalletRef, {
          user_id: listing.seller_id,
          demo_credits: totalPrice - fee,
          balance_ngn: 0,
          createdAt: Timestamp.now()
        })
      }
      
      // Create transaction record
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
        createdAt: Timestamp.now()
      })
      
      // Mark listing as sold
      transaction.update(listingRef, {
        listing_status: "sold",
        updatedAt: Timestamp.now()
      })
      
      return {
        success: true,
        transaction_id: txRef.id,
        amount: listing.amount_kwh,
        total: totalPrice,
        fee: fee
      }
    })
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Buy error:", error)
    return NextResponse.json({ error: error.message || "Purchase failed" }, { status: 500 })
  }
}
