import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient()

  const { data: users } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      is_approved,
      created_at,
      wallets (balance_ngn)
    `)
    .order("created_at", { ascending: false })

  const transformed = users?.map((user: any) => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    is_approved: user.is_approved,
    created_at: user.created_at,
    wallet_balance: user.wallets?.[0]?.balance_ngn || 0,
  })) || []

  return NextResponse.json(transformed)
}
