import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient()

  // Check if user is admin (you can hardcode your email or add admin check)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get total users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // Get total transactions
  const { data: transactions, count: totalTransactions } = await supabase
    .from("transactions")
    .select("total_amount, fee_ngn", { count: "exact" })

  const totalVolume = transactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0
  const totalFees = transactions?.reduce((sum, t) => sum + t.fee_ngn, 0) || 0

  // Get active listings
  const { count: activeListings } = await supabase
    .from("energy_listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "available")

  // Get pending KYC
  const { count: pendingKyc } = await supabase
    .from("kyc_submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    totalTransactions: totalTransactions || 0,
    totalVolume,
    totalFees,
    activeListings: activeListings || 0,
    pendingKyc: pendingKyc || 0,
  })
}
