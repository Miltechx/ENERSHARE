import { sendEmail, getSaleEmailTemplate, getPurchaseEmailTemplate } from "@/lib/email"

// After successful transaction, add:
const { data: buyerProfile } = await supabase
  .from("profiles")
  .select("email, full_name")
  .eq("id", session.user.id)
  .single()

const { data: sellerProfile } = await supabase
  .from("profiles")
  .select("email, full_name")
  .eq("id", listing.seller_id)
  .single()

// Send email to buyer
await sendEmail({
  to: buyerProfile.email,
  subject: "Energy Purchase Confirmed - EnerShare",
  html: getPurchaseEmailTemplate(sellerProfile.full_name, listing.amount_kwh, listing.price_per_kwh_ngn, listing.total_price),
})

// Send email to seller
await sendEmail({
  to: sellerProfile.email,
  subject: "Energy Sold - EnerShare",
  html: getSaleEmailTemplate(buyerProfile.full_name, listing.amount_kwh, listing.price_per_kwh_ngn, listing.total_price),
})
