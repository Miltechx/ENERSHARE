import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { amount } = body

  if (!amount || amount < 100) {
    return NextResponse.json({ error: "Minimum amount is ₦100" }, { status: 400 })
  }

  // For MVP, return demo mode response
  // Real Paystack integration will be added in Phase 2
  return NextResponse.json({
    demo_mode: true,
    message: "Payment integration coming soon. Using demo credits.",
    authorization_url: null,
  })
}
