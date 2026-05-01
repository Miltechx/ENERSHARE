import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/firebase/config"
import { doc, getDoc } from "firebase/firestore"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const walletRef = doc(db, "wallets", session.user.id)
    const walletSnap = await getDoc(walletRef)

    if (walletSnap.exists()) {
      const data = walletSnap.data()
      return NextResponse.json({
        balance_ngn: data.balance_ngn || 0,
        demo_credits: data.demo_credits || 5000,
        total: (data.balance_ngn || 0) + (data.demo_credits || 5000),
      })
    } else {
      return NextResponse.json({
        balance_ngn: 0,
        demo_credits: 5000,
        total: 5000,
      })
    }
  } catch (error) {
    console.error("Wallet balance error:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
