import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, query, where } from "firebase/firestore"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get total users
    const usersSnapshot = await getDocs(collection(db, "profiles"))
    const totalUsers = usersSnapshot.size

    // Get transactions
    const transactionsSnapshot = await getDocs(collection(db, "transactions"))
    const transactions = transactionsSnapshot.docs.map(doc => doc.data())
    const totalTransactions = transactions.length
    const totalVolume = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0)
    const totalFees = transactions.reduce((sum, t) => sum + (t.fee_ngn || 0), 0)

    // Get active listings
    const listingsQuery = query(collection(db, "energy_listings"), where("listing_status", "==", "available"))
    const listingsSnapshot = await getDocs(listingsQuery)
    const activeListings = listingsSnapshot.size

    return NextResponse.json({
      totalUsers,
      totalTransactions,
      totalVolume,
      totalFees,
      activeListings,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
