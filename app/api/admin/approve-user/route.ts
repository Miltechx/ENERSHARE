import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/firebase/config"
import { doc, updateDoc } from "firebase/firestore"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { user_id } = body

  if (!user_id) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  try {
    const userRef = doc(db, "profiles", user_id)
    await updateDoc(userRef, { is_approved: true })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Approve user error:", error)
    return NextResponse.json({ error: "Failed to approve user" }, { status: 500 })
  }
}
