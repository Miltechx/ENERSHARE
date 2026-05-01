import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { amount } = body

  if (!amount || amount < 1000) {
    return NextResponse.json({ error: "Minimum withdrawal is ₦1,000" }, { status: 400 })
  }

  // For MVP, return demo mode response
  // Real withdrawal will be added in Phase 2
  return NextResponse.json({
    demo_mode: true,
    message: "Withdrawal feature coming soon. Demo mode active.",
    success: false,
  })
}
