import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { adminDb } from "@/lib/firebase/admin"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin
  const userDoc = await adminDb.collection("profiles").doc(session.user.id).get()
  if (!userDoc.exists || !userDoc.data()?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const usersSnapshot = await adminDb.collection("profiles").get()
  const users = await Promise.all(
    usersSnapshot.docs.map(async (doc) => {
      const walletDoc = await adminDb.collection("wallets").doc(doc.id).get()
      return {
        id: doc.id,
        email: doc.data().email,
        full_name: doc.data().full_name || '',
        balance_ngn: walletDoc.exists ? walletDoc.data()?.balance_ngn || 0 : 0,
        is_verified: doc.data().is_verified || false,
        is_admin: doc.data().is_admin || false,
        created_at: doc.data().created_at || new Date().toISOString(),
      }
    })
  )

  return NextResponse.json(users)
}