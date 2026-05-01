import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, addDoc, query, where, orderBy, Timestamp } from "firebase/firestore"

export async function GET() {
  try {
    const listingsRef = collection(db, "energy_listings")
    const q = query(listingsRef, where("listing_status", "==", "available"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    const listings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(listings)
  } catch (error) {
    console.error("GET listings error:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { amount_kwh, price_per_kwh_ngn, source_type, location } = body

  if (!amount_kwh || !price_per_kwh_ngn || !source_type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const listingsRef = collection(db, "energy_listings")
    const docRef = await addDoc(listingsRef, {
      seller_id: session.user.id,
      seller_name: session.user.email,
      source_type,
      amount_kwh,
      price_per_kwh_ngn,
      total_price: amount_kwh * price_per_kwh_ngn,
      location: location || null,
      listing_status: "available",
      createdAt: Timestamp.now(),
    })
    
    return NextResponse.json({ 
      id: docRef.id, 
      success: true,
      amount_kwh,
      price_per_kwh_ngn,
      total_price: amount_kwh * price_per_kwh_ngn
    })
  } catch (error) {
    console.error("POST listing error:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
