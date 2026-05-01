import { NextRequest, NextResponse } from "next/server"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase/config"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${process.env.NEXTAUTH_URL}/auth/signin`,
    })
    return NextResponse.json({ success: true, message: "Password reset email sent" })
  } catch (error: any) {
    console.error("Forgot password error:", error)
    // Don't reveal if email exists or not for security
    return NextResponse.json({ success: true, message: "If an account exists, a reset link was sent" })
  }
}
