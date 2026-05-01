import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { referral_code } = body

  if (!referral_code) {
    return NextResponse.json({ error: "Referral code required" }, { status: 400 })
  }

  try {
    // Find the referrer
    const referralsRef = collection(db, "referrals")
    const q = query(referralsRef, where("referral_code", "==", referral_code))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
    }

    const referrerDoc = querySnapshot.docs[0]
    const referrerId = referrerDoc.data().user_id

    // Don't let users refer themselves
    if (referrerId === session.user.id) {
      return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 })
    }

    // Check if user already used a referral
    const userReferralRef = doc(db, "referral_uses", session.user.id)
    const userReferralSnap = await getDoc(userReferralRef)

    if (userReferralSnap.exists()) {
      return NextResponse.json({ error: "Referral already used" }, { status: 400 })
    }

    // Record the referral use
    await setDoc(userReferralRef, {
      user_id: session.user.id,
      referrer_id: referrerId,
      bonus_amount: 1000,
      bonus_paid: false,
      usedAt: new Date().toISOString(),
    })

    // Update referrer's stats
    await updateDoc(doc(db, "referrals", referrerId), {
      total_referrals: increment(1),
    })

    // Give bonus to both users (₦1,000 each) - will be credited after KYC
    return NextResponse.json({ success: true, bonus: 1000, message: "Referral applied! Bonus will be credited after KYC." })
  } catch (error) {
    console.error("Referral claim error:", error)
    return NextResponse.json({ error: "Failed to claim referral" }, { status: 500 })
  }
}
