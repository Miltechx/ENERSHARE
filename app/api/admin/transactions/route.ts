import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient()

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      buyer:profiles!buyer_id (full_name),
      seller:profiles!seller_id (full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  const transformed = transactions?.map((t: any) => ({
    id: t.id,
    buyer_name: t.buyer?.full_name || "Unknown",
    seller_name: t.seller?.full_name || "Unknown",
    amount_kwh: t.amount_kwh,
    total_amount: t.total_amount,
    status: t.status,
    created_at: t.created_at,
  })) || []

  return NextResponse.json(transformed)
}
