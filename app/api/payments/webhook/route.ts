import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { adminDb } from "@/lib/firebase/admin"

const verifyWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
  const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex")
  return hash === signature
}

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get("x-paystack-signature") || ""

  if (!verifyWebhookSignature(payload, signature, process.env.PAYSTACK_SECRET_KEY!)) {
    console.error("Invalid webhook signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(payload)

  if (event.event === "charge.success") {
    const { reference, metadata, amount } = event.data
    const userId = metadata.user_id
    const amountInNaira = amount / 100

    try {
      // Update pending payment
      const pendingRef = adminDb.collection("pending_payments").doc(reference)
      const pendingDoc = await pendingRef.get()

      if (!pendingDoc.exists) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
      }

      await pendingRef.update({
        status: "completed",
        completedAt: new Date().toISOString(),
      })

      // Update user's wallet using transaction
      const walletRef = adminDb.collection("wallets").doc(userId)
      await adminDb.runTransaction(async (transaction) => {
        const walletDoc = await transaction.get(walletRef)
        const currentBalance = walletDoc.exists ? walletDoc.data()?.balance_ngn || 0 : 0
        
        if (walletDoc.exists) {
          transaction.update(walletRef, {
            balance_ngn: currentBalance + amountInNaira,
            updatedAt: new Date().toISOString(),
          })
        } else {
          transaction.set(walletRef, {
            user_id: userId,
            balance_ngn: amountInNaira,
            demo_credits: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      })

      // Record deposit
      await adminDb.collection("deposits").doc(reference).set({
        user_id: userId,
        amount: amountInNaira,
        reference: reference,
        status: "completed",
        payment_method: "paystack",
        completedAt: new Date().toISOString(),
      })

      // Create notification
      await adminDb.collection("notifications").add({
        user_id: userId,
        title: "Deposit Successful",
        message: `₦${amountInNaira.toLocaleString()} has been added to your wallet.`,
        type: "payment",
        read: false,
        createdAt: new Date().toISOString(),
      })

      console.log(`✅ Credited ₦${amountInNaira} to user ${userId}`)
      return NextResponse.json({ received: true })
    } catch (error) {
      console.error("Webhook error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}