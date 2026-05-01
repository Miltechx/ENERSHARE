import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "all"

  try {
    const transactionsRef = collection(db, "transactions")
    let q
    
    if (type === "bought") {
      q = query(transactionsRef, where("buyer_id", "==", session.user.id), orderBy("createdAt", "desc"))
    } else if (type === "sold") {
      q = query(transactionsRef, where("seller_id", "==", session.user.id), orderBy("createdAt", "desc"))
    } else {
      q = query(transactionsRef, orderBy("createdAt", "desc"))
    }
    
    const snapshot = await getDocs(q)
    const transactions = snapshot.docs
      .filter(doc => {
        const data = doc.data()
        return type === "all" || 
               (type === "bought" && data.buyer_id === session.user.id) ||
               (type === "sold" && data.seller_id === session.user.id)
      })
      .map(doc => ({ id: doc.id, ...doc.data() }))
    
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Transactions error:", error)
    return NextResponse.json([])
  }
}
