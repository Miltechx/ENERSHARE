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

  // Get stats
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { data: transactions } = await supabase
    .from("transactions")
    .select("total_amount, fee_ngn")

  const totalVolume = transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0
  const totalFees = transactions?.reduce((sum, t) => sum + (t.fee_ngn || 0), 0) || 0

  const { count: activeListings } = await supabase
    .from("energy_listings")
    .select("*", { count: "exact", head: true })
    .eq("listing_status", "available")

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    totalTransactions: transactions?.length || 0,
    totalVolume,
    totalFees,
    activeListings: activeListings || 0,
    pendingKyc: 0,
  })
}
