import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const walletRef = doc(db, "wallets", session.user.id)
    const walletSnap = await getDoc(walletRef)

    if (walletSnap.exists()) {
      return NextResponse.json(walletSnap.data())
    } else {
      const defaultWallet = {
        user_id: session.user.id,
        balance_ngn: 5000,
        createdAt: new Date().toISOString(),
      }
      await setDoc(walletRef, defaultWallet)
      return NextResponse.json(defaultWallet)
    }
  } catch (error) {
    console.error("Wallet error:", error)
    return NextResponse.json({ balance_ngn: 5000 })
  }
}