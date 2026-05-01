import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Return empty array for now (Firebase migration in progress)
  return NextResponse.json([])
}
