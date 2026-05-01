import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { auth } from "@/lib/firebase/config"
import { updatePassword } from "firebase/auth"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { password } = body

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  try {
    const user = auth.currentUser
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    await updatePassword(user, password)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: error.message || "Failed to reset password" }, { status: 500 })
  }
}
