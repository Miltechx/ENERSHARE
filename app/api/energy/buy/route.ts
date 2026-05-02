import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { adminDb } from "@/lib/firebase/admin"
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const result = await adminDb.runTransaction(async (transaction) => {
      // Get listing
      const listingRef = adminDb.collection("energy_listings").doc(listing_id)
      const listingDoc = await transaction.get(listingRef)

      if (!listingDoc.exists) {
        throw new Error("Listing not found")
      }

      const listing = listingDoc.data()

      if (listing.listing_status !== "available") {
        throw new Error("Listing not available")
      }

      // Get buyer's wallet
      const buyerWalletRef = adminDb.collection("wallets").doc(session.user.id)
      const buyerWalletDoc = await transaction.get(buyerWalletRef)
      const buyerBalance = buyerWalletDoc.exists ? (buyerWalletDoc.data()?.balance_ngn || 0) : 0

      const totalPrice = listing.amount_kwh * listing.price_per_kwh_ngn

      if (buyerBalance < totalPrice) {
        throw new Error("Insufficient funds")
      }

      const fee = totalPrice * 0.02

      // Update buyer wallet
      transaction.update(buyerWalletRef, {
        balance_ngn: buyerBalance - totalPrice,
        updatedAt: new Date().toISOString(),
      })

      // Update seller wallet
      const sellerWalletRef = adminDb.collection("wallets").doc(listing.seller_id)
      const sellerWalletDoc = await transaction.get(sellerWalletRef)
      const sellerBalance = sellerWalletDoc.exists ? (sellerWalletDoc.data()?.balance_ngn || 0) : 0

      transaction.update(sellerWalletRef, {
        balance_ngn: sellerBalance + (totalPrice - fee),
        updatedAt: new Date().toISOString(),
      })

      // Create transaction record
      const transactionRef = adminDb.collection("transactions").doc()
      transaction.set(transactionRef, {
        buyer_id: session.user.id,
        seller_id: listing.seller_id,
        listing_id: listing_id,
        source_type: listing.source_type,
        amount_kwh: listing.amount_kwh,
        price_per_kwh_ngn: listing.price_per_kwh_ngn,
        total_amount: totalPrice,
        fee_ngn: fee,
        tx_status: "completed",
        createdAt: new Date().toISOString(),
      })

      // Mark listing as sold
      transaction.update(listingRef, {
        listing_status: "sold",
        sold_to: session.user.id,
        sold_at: new Date().toISOString(),
      })

      return {
        transaction_id: transactionRef.id,
        amount: listing.amount_kwh,
        total: totalPrice,
        fee: fee,
        seller_id: listing.seller_id,
        seller_name: listing.seller_name,
        buyer_name: session.user.email,
      }
    })

    // Send email notifications
    try {
      // Get buyer email
      const buyerUser = await adminDb.collection("profiles").doc(session.user.id).get()
      const buyerEmail = buyerUser.data()?.email || session.user.email

      // Get seller email
      const sellerUser = await adminDb.collection("profiles").doc(result.seller_id).get()
      const sellerEmail = sellerUser.data()?.email

      // Email to buyer
      await resend.emails.send({
        from: 'EnerShare <noreply@enershare.com>',
        to: buyerEmail,
        subject: 'Energy Purchase Confirmed - EnerShare',
        html: `
          <h1>Purchase Confirmed ✅</h1>
          <p>You purchased ${result.amount} kWh of energy.</p>
          <p>Total: ₦${result.total.toLocaleString()}</p>
          <p>Fee: ₦${result.fee.toLocaleString()}</p>
          <a href="${process.env.NEXTAUTH_URL}/dashboard">View Dashboard</a>
        `,
      })

      // Email to seller
      if (sellerEmail) {
        await resend.emails.send({
          from: 'EnerShare <noreply@enershare.com>',
          to: sellerEmail,
          subject: 'Energy Sold - EnerShare',
          html: `
            <h1>Energy Sold! ⚡</h1>
            <p>${result.buyer_name} purchased ${result.amount} kWh from you.</p>
            <p>Total: ₦${result.total.toLocaleString()}</p>
            <p>After fee: ₦{(result.total - result.fee).toLocaleString()}</p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard">View Dashboard</a>
          `,
        })
      }
    } catch (emailError) {
      console.error("Email send failed:", emailError)
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error("Buy error:", error)
    return NextResponse.json({ error: error.message || "Purchase failed" }, { status: 500 })
  }
}