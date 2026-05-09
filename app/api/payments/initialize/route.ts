import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const userId = decoded.uid

    const { amountNaira, email, metadata } = await request.json()

    if (!amountNaira || amountNaira < 500) {
      return NextResponse.json({ error: 'Minimum amount is ₦500' }, { status: 400 })
    }

    const reference = `ENERSHARE_${Date.now()}_${userId.slice(0, 8)}`

    // Get the user's email from Firebase if not provided
    const userEmail = email || decoded.email

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        amount: amountNaira * 100,
        reference,
        metadata: { userId, ...metadata },
        callback_url: `${process.env.NEXTAUTH_URL}/wallet?payment_success=true`,
      }),
    })

    const data = await paystackResponse.json()

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reference,
      authorization_url: data.data.authorization_url,
    })
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}