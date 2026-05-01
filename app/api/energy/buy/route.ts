import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { sendEmail, getSaleEmailTemplate, getPurchaseEmailTemplate } from "@/lib/email"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { listing_id } = body

  if (!listing_id) {
    return NextResponse.json({ error: "Listing ID required" }, { status: 400 })
  }

  const supabase = createClient()

  // Call the database function
  const { data, error } = await supabase.rpc("process_energy_purchase", {
    p_listing_id: listing_id,
    p_buyer_id: session.user.id,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If purchase succeeded, send email notifications
  if (data?.success) {
    try {
      // Get buyer profile
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", session.user.id)
        .single()

      // Get listing details to find seller
      const { data: listing } = await supabase
        .from("energy_listings")
        .select("seller_id, amount_kwh, price_per_kwh_ngn, total_price")
        .eq("id", listing_id)
        .single()

      if (listing) {
        // Get seller profile
        const { data: sellerProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", listing.seller_id)
          .single()

        // Send email to buyer
        if (buyerProfile?.email) {
          await sendEmail({
            to: buyerProfile.email,
            subject: "Energy Purchase Confirmed - EnerShare",
            html: getPurchaseEmailTemplate(
              sellerProfile?.full_name || "Seller",
              listing.amount_kwh,
              listing.price_per_kwh_ngn,
              listing.total_price
            ),
          })
        }

        // Send email to seller
        if (sellerProfile?.email) {
          await sendEmail({
            to: sellerProfile.email,
            subject: "Energy Sold - EnerShare",
            html: getSaleEmailTemplate(
              buyerProfile?.full_name || "Buyer",
              listing.amount_kwh,
              listing.price_per_kwh_ngn,
              listing.total_price
            ),
          })
        }
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // Don't fail the transaction if email fails
    }
  }

  return NextResponse.json(data)
}
