import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const userId = decoded.uid

    const { amountNaira, email, metadata } = await request.json()

    if (!amountNaira || amountNaira < 500) {
      return NextResponse.json({ error: 'Minimum amount is ₦500' }, { status: 400 })
    }

    const reference = `ENERSHARE_${Date.now()}_${userId.slice(0, 8)}`

    // Store pending payment log
    await adminDb.collection('paymentLogs').doc(reference).set({
      paystackReference: reference,
      userId: userId,
      amountKobo: amountNaira * 100,
      status: 'pending',
      metadata,
      createdAt: new Date().toISOString(),
    })

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email || decoded.email,
        amount: amountNaira * 100,
        reference,
        metadata: {
          userId,
          ...metadata,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?payment_success=true`,
      }),
    })

    const data = await paystackResponse.json()

    if (!data.status) {
      await adminDb.collection('paymentLogs').doc(reference).update({
        status: 'failed',
        error: data.message,
      })
      return NextResponse.json({ error: data.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reference,
      authorization_url: data.data.authorization_url,
    })
  } catch (error) {
    console.error('Paystack initialize error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}