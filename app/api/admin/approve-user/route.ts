import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@/lib/supabase/server"

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

  const supabase = createClient()

  // Check if the current user is admin
  const { data: adminCheck } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single()

  if (!adminCheck?.is_admin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
  }

  // Approve the user
  const { error } = await supabase
    .from("profiles")
    .update({ is_approved: true })
    .eq("id", user_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
