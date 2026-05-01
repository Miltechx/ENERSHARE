import { z } from "zod"

// Input validation schemas
export const ListingSchema = z.object({
  amount_kwh: z.number().min(0.1, "Minimum 0.1 kWh").max(1000, "Maximum 1000 kWh"),
  price_per_kwh_ngn: z.number().min(50, "Minimum ₦50").max(500, "Maximum ₦500"),
  source_type: z.enum(["solar", "generator", "grid", "battery", "other"]),
  location: z.string().optional(),
})

export const BuySchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
})

export const PaymentSchema = z.object({
  amount: z.number().min(100, "Minimum ₦100").max(500000, "Maximum ₦500,000"),
})

export const WithdrawSchema = z.object({
  amount: z.number().min(1000, "Minimum ₦1,000").max(1000000, "Maximum ₦1,000,000"),
  bank_code: z.string().min(3),
  account_number: z.string().min(10).max(10),
})

// Sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim()
    .slice(0, 1000) // Limit length
}

// SQL injection prevention is handled by Supabase's parameterized queries
