import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const referralRef = doc(db, "referrals", session.user.id)
    const referralSnap = await getDoc(referralRef)

    let referralCode

    if (referralSnap.exists()) {
      referralCode = referralSnap.data().referral_code
    } else {
      referralCode = generateReferralCode()
      await setDoc(referralRef, {
        user_id: session.user.id,
        referral_code: referralCode,
        total_referrals: 0,
        total_bonus: 0,
        createdAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ referral_code: referralCode })
  } catch (error) {
    console.error("Referral create error:", error)
    return NextResponse.json({ error: "Failed to create referral" }, { status: 500 })
  }
}
