import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

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
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(payload)
  const supabase = createClient()

  if (event.event === "charge.success") {
    const { reference, metadata, amount } = event.data

    // Get pending payment
    const { data: pending } = await supabase
      .from("pending_payments")
      .select("*")
      .eq("reference", reference)
      .single()

    if (!pending) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Update user's wallet
    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", metadata.user_id)
      .single()

    const newBalance = (wallet?.balance_ngn || 0) + amount / 100

    await supabase.from("wallets").upsert({
      user_id: metadata.user_id,
      balance_ngn: newBalance,
      updated_at: new Date().toISOString(),
    })

    // Mark payment as completed
    await supabase
      .from("pending_payments")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("reference", reference)

    // Record transaction
    await supabase.from("deposits").insert({
      user_id: metadata.user_id,
      amount: amount / 100,
      reference: reference,
      status: "completed",
    })
  }

  return NextResponse.json({ received: true })
}
