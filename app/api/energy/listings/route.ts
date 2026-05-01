import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

// GET - Fetch available listings
export async function GET() {
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

  const transformed = listings?.map((l: any) => ({
    ...l,
    seller_name: l.profiles?.full_name || "Unknown",
  })) || []

  return NextResponse.json(transformed)
}

// POST - Create new listing
export async function POST(request: NextRequest) {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { amount_kwh, price_per_kwh_ngn, source_type, location } = body

  if (!amount_kwh || !price_per_kwh_ngn || !source_type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = createClient()
  const total_price = amount_kwh * price_per_kwh_ngn

  const { data, error } = await supabase
    .from("energy_listings")
    .insert({
      seller_id: session.user.id,
      source_type,
      amount_kwh,
      price_per_kwh_ngn,
      total_price,
      location: location || null,
      listing_status: "available",
    })
    .select()
    .single()

  if (error) {
    console.error("Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
