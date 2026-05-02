import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { adminDb } from "@/lib/firebase/admin"

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { amount, bank_code, account_number, account_name } = body

  if (!amount || amount < 1000) {
    return NextResponse.json({ error: "Minimum withdrawal is ₦1,000" }, { status: 400 })
  }

  try {
    // Check balance
    const walletRef = adminDb.collection("wallets").doc(session.user.id)
    const walletDoc = await walletRef.get()

    if (!walletDoc.exists || (walletDoc.data()?.balance_ngn || 0) < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Create transfer recipient in Paystack
    const recipientResponse = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: account_name,
        account_number: account_number,
        bank_code: bank_code,
        currency: "NGN",
      }),
    })

    const recipientData = await recipientResponse.json()

    if (!recipientData.status) {
      return NextResponse.json({ error: recipientData.message }, { status: 500 })
    }

    const reference = `ENERSHARE_WD_${Date.now()}`

    // Initiate transfer
    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amount * 100,
        recipient: recipientData.data.recipient_code,
        reason: "EnerShare withdrawal",
        reference: reference,
      }),
    })

    const transferData = await transferResponse.json()

    if (!transferData.status) {
      return NextResponse.json({ error: transferData.message }, { status: 500 })
    }

    // Deduct from wallet
    await walletRef.update({
      balance_ngn: (walletDoc.data()?.balance_ngn || 0) - amount,
      updatedAt: new Date().toISOString(),
    })

    // Record withdrawal
    await adminDb.collection("withdrawals").doc(reference).set({
      user_id: session.user.id,
      amount: amount,
      reference: reference,
      bank_code: bank_code,
      account_number: account_number,
      account_name: account_name,
      status: "pending",
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      reference: reference,
      message: "Withdrawal initiated. Funds will be sent to your account within 1-2 business days.",
    })
  } catch (error) {
    console.error("Withdrawal error:", error)
    return NextResponse.json({ error: "Failed to process withdrawal" }, { status: 500 })
  }
}
