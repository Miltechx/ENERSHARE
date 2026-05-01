import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient()

  // Generate unique referral code
  const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase()

  const { error } = await supabase
    .from("referrals")
    .upsert({
      user_id: session.user.id,
      referral_code: referralCode,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ referral_code: referralCode })
}
