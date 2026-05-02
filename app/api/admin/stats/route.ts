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

  const usersSnapshot = await adminDb.collection("profiles").count().get()
  const transactionsSnapshot = await adminDb.collection("transactions").get()
  const listingsSnapshot = await adminDb.collection("energy_listings").where("listing_status", "==", "available").get()
  const withdrawalsSnapshot = await adminDb.collection("withdrawals").where("status", "==", "pending").get()

  const transactions = transactionsSnapshot.docs.map(doc => doc.data())
  const totalVolume = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0)
  const totalFees = transactions.reduce((sum, t) => sum + (t.fee_ngn || 0), 0)

  return NextResponse.json({
    totalUsers: usersSnapshot.data().count,
    totalTransactions: transactionsSnapshot.size,
    totalVolume,
    totalFees,
    activeListings: listingsSnapshot.size,
    pendingWithdrawals: withdrawalsSnapshot.size,
  })
}