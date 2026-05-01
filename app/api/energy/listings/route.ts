import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function GET() {
  const session = await getServerSession()
  
  const supabase = createClient()
  const { data: listings, error } = await supabase
    .from("energy_listings")
    .select(`
      *,
      profiles:seller_id (full_name)
    `)
    .eq("listing_status", "available")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(listings || [])
}
