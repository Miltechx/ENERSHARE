import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { amount, bank_code, account_number } = body

  if (!amount || amount < 1000) {
    return NextResponse.json({ error: "Minimum withdrawal is ₦1,000" }, { status: 400 })
  }

  const supabase = createClient()

  // Check balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance_ngn")
    .eq("user_id", session.user.id)
    .single()

  if (!wallet || wallet.balance_ngn < amount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
  }

  // Initiate transfer via Paystack
  const response = await fetch("https://api.paystack.co/transfer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      amount: amount * 100,
      recipient: bank_code,
      reason: "EnerShare withdrawal",
    }),
  })

  const data = await response.json()

  if (!data.status) {
    return NextResponse.json({ error: data.message }, { status: 500 })
  }

  // Deduct from wallet
  await supabase
    .from("wallets")
    .update({ balance_ngn: wallet.balance_ngn - amount })
    .eq("user_id", session.user.id)

  // Record withdrawal
  await supabase.from("withdrawals").insert({
    user_id: session.user.id,
    amount: amount,
    reference: data.data.reference,
    status: "processed",
  })

  return NextResponse.json({ success: true, reference: data.data.reference })
}
