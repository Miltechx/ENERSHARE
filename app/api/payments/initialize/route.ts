import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/lib/supabase/server"

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

  // Call Paystack API
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email || session.user.email,
      amount: amount * 100, // Paystack uses kobo (multiply by 100)
      callback_url: `${process.env.NEXTAUTH_URL}/dashboard?payment_success=true`,
      metadata: {
        user_id: session.user.id,
      },
    }),
  })

  const data = await response.json()

  if (!data.status) {
    return NextResponse.json({ error: data.message }, { status: 500 })
  }

  // Store pending transaction in database
  const supabase = createClient()
  await supabase.from("pending_payments").insert({
    user_id: session.user.id,
    amount: amount,
    reference: data.data.reference,
    status: "pending",
  })

  return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data.reference })
}
