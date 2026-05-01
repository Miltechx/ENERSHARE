import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient()

  // Check admin
  const { data: adminCheck } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single()

  if (!adminCheck?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: users } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      is_approved,
      created_at,
      wallets (balance_ngn, demo_credits)
    `)
    .order("created_at", { ascending: false })

  // Get emails from auth.users (requires service role)
  const { data: authUsers } = await supabase.auth.admin.listUsers()

  const emailMap = new Map()
  authUsers?.users.forEach((user: any) => {
    emailMap.set(user.id, user.email)
  })

  const transformed = users?.map((user: any) => ({
    id: user.id,
    full_name: user.full_name,
    email: emailMap.get(user.id) || "Unknown",
    is_approved: user.is_approved,
    created_at: user.created_at,
    wallet_balance: user.wallets?.[0]?.balance_ngn || 0,
    demo_credits: user.wallets?.[0]?.demo_credits || 0,
  })) || []

  return NextResponse.json(transformed)
}
