import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, updateDoc, setDoc, increment, Timestamp } from "firebase/firestore"

// Verify Paystack webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex")
  return hash === signature
}

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get("x-paystack-signature") || ""

  // Verify webhook is from Paystack
  if (!verifyWebhookSignature(payload, signature, process.env.PAYSTACK_SECRET_KEY!)) {
    console.error("Invalid webhook signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(payload)
  console.log("Paystack webhook received:", event.event)

  // Handle successful charge
  if (event.event === "charge.success") {
    const { reference, metadata, amount } = event.data
    const userId = metadata.user_id
    const amountInNaira = amount / 100 // Convert from kobo to naira

    try {
      // Get or create user wallet
      const walletRef = doc(db, "wallets", userId)
      const walletSnap = await getDoc(walletRef)

      if (walletSnap.exists()) {
        // Update existing wallet
        await updateDoc(walletRef, {
          balance_ngn: increment(amountInNaira),
          updatedAt: Timestamp.now(),
        })
      } else {
        // Create new wallet
        await setDoc(walletRef, {
          user_id: userId,
          balance_ngn: amountInNaira,
          demo_credits: 5000,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      }

      // Record the deposit
      const depositRef = doc(db, "deposits", reference)
      await setDoc(depositRef, {
        user_id: userId,
        amount: amountInNaira,
        reference: reference,
        status: "completed",
        payment_method: "paystack",
        completedAt: Timestamp.now(),
        metadata: metadata,
      })

      console.log(`Successfully credited ₦${amountInNaira} to user ${userId}`)

      // Create notification for user
      const notificationRef = doc(db, "notifications", `${userId}_${Date.now()}`)
      await setDoc(notificationRef, {
        user_id: userId,
        title: "Deposit Successful",
        message: `₦${amountInNaira.toLocaleString()} has been added to your wallet.`,
        type: "payment",
        read: false,
        createdAt: Timestamp.now(),
      })

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error("Error processing webhook:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  // Handle transfer success (withdrawals)
  if (event.event === "transfer.success") {
    const { reference, amount, recipient } = event.data
    const amountInNaira = amount / 100

    try {
      // Update withdrawal record
      const withdrawalRef = doc(db, "withdrawals", reference)
      await updateDoc(withdrawalRef, {
        status: "completed",
        processedAt: Timestamp.now(),
      })

      console.log(`Withdrawal of ₦${amountInNaira} to ${recipient.account_number} completed`)

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error("Error processing transfer webhook:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  // Handle transfer failed
  if (event.event === "transfer.failed") {
    const { reference, reason } = event.data

    try {
      const withdrawalRef = doc(db, "withdrawals", reference)
      await updateDoc(withdrawalRef, {
        status: "failed",
        error_message: reason,
        processedAt: Timestamp.now(),
      })

      console.log(`Withdrawal ${reference} failed: ${reason}`)

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error("Error processing failed transfer:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  // Acknowledge other events
  return NextResponse.json({ received: true })
}
