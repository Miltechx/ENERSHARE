import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { adminDb } from "@/lib/firebase/admin"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { amount, email } = body

  if (!amount || amount < 100) {
    return NextResponse.json({ error: "Minimum amount is ₦100" }, { status: 400 })
  }

  const reference = `ENERSHARE_${Date.now()}_${session.user.id.slice(0, 8)}`

  try {
    // Initialize Paystack transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email || session.user.email,
        amount: amount * 100,
        reference: reference,
        callback_url: `${process.env.NEXTAUTH_URL}/dashboard?payment_success=true`,
        metadata: {
          user_id: session.user.id,
          amount: amount,
        },
      }),
    })

    const data = await response.json()

    if (!data.status) {
      console.error("Paystack error:", data.message)
      return NextResponse.json({ error: data.message }, { status: 500 })
    }

    // Store pending transaction in Firestore
    await adminDb.collection("pending_payments").doc(reference).set({
      user_id: session.user.id,
      amount: amount,
      reference: reference,
      status: "pending",
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: reference,
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}