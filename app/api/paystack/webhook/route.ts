import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { adminDb } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data

    const paymentLog = await adminDb.collection('paymentLogs').doc(reference).get()
    
    // Only process if not already processed
    if (paymentLog.exists && paymentLog.data()?.status !== 'success') {
      // Trigger the verification process
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      })
    }
  }

  return NextResponse.json({ received: true })
}