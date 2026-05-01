import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/firebase/config"
import { collection, addDoc, Timestamp } from "firebase/firestore"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { transaction_id, reason } = body

  if (!transaction_id || !reason) {
    return NextResponse.json({ error: "Transaction ID and reason required" }, { status: 400 })
  }

  try {
    const disputeRef = collection(db, "disputes")
    const docRef = await addDoc(disputeRef, {
      transaction_id,
      raised_by: session.user.id,
      reason,
      status: "open",
      created_at: Timestamp.now(),
    })

    return NextResponse.json({ success: true, dispute_id: docRef.id })
  } catch (error) {
    console.error("Create dispute error:", error)
    return NextResponse.json({ error: "Failed to create dispute" }, { status: 500 })
  }
}
