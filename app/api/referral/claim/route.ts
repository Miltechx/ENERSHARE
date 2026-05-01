import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { referral_code } = body

  const supabase = createClient()

  // Find the referrer
  const { data: referrer } = await supabase
    .from("referrals")
    .select("user_id")
    .eq("referral_code", referral_code)
    .single()

  if (!referrer) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
  }

  // Don't let users refer themselves
  if (referrer.user_id === session.user.id) {
    return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 })
  }

  // Check if user already used a referral
  const { data: existing } = await supabase
    .from("referral_uses")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: "Referral already used" }, { status: 400 })
  }

  // Record the referral use
  await supabase.from("referral_uses").insert({
    user_id: session.user.id,
    referrer_id: referrer.user_id,
  })

  // Give bonus to both users (₦1,000 each)
  await supabase.rpc("add_referral_bonus", { user_id: session.user.id, amount: 1000 })
  await supabase.rpc("add_referral_bonus", { user_id: referrer.user_id, amount: 1000 })

  return NextResponse.json({ success: true, bonus: 1000 })
}
