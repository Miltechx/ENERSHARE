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

  const supabase = createClient()

  const { error } = await supabase
    .from("profiles")
    .update({ is_approved: true })
    .eq("id", user_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
