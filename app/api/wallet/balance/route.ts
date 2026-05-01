import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient()
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance_ngn, demo_credits")
    .eq("user_id", session.user.id)
    .single()

  return NextResponse.json({
    balance_ngn: wallet?.balance_ngn || 0,
    demo_credits: wallet?.demo_credits || 0,
    total: (wallet?.balance_ngn || 0) + (wallet?.demo_credits || 0),
  })
}
