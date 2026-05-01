import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXTAUTH_URL}/auth/reset-password`,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: "Password reset email sent" })
}
