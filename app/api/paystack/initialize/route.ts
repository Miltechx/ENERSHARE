import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let userId: string
  let userEmail: string

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    userId    = decoded.uid
    userEmail = decoded.email || ''
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // ─── Payload ─────────────────────────────────────────────────────────────────
  const { amountNaira, email, metadata } = await request.json()

  if (!amountNaira || amountNaira < 500) {
    return NextResponse.json({ error: 'Minimum amount is ₦500' }, { status: 400 })
  }

  const finalEmail = email || userEmail
  if (!finalEmail) {
    return NextResponse.json({ error: 'User email not found' }, { status: 400 })
  }

  // ─── Build reference ─────────────────────────────────────────────────────────
  const reference = `ENERSHARE_${Date.now()}_${userId.slice(0, 8)}`

  try {
    // ── 1. Create pending_payments doc BEFORE calling Paystack ──────────────────
    //       The webhook checks for this doc — it must exist before payment completes
    await adminDb.collection('pending_payments').doc(reference).set({
      reference,
      userId,           // ← consistent field name used throughout the app
      email:     finalEmail,
      amountNaira,
      status:    'pending',
      type:      'deposit',
      metadata:  metadata || {},
      createdAt: new Date().toISOString(),
    })

    // ── 2. Initialize Paystack transaction ──────────────────────────────────────
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:        finalEmail,
        amount:       amountNaira * 100, // Paystack uses kobo
        reference,
        metadata: {
          userId,     // ← matches what the webhook reads (metadata.userId)
          ...metadata,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?payment_success=true`,
      }),
    })

    const data = await paystackResponse.json()

    if (!data.status) {
      // Paystack rejected — clean up the pending doc
      await adminDb.collection('pending_payments').doc(reference).delete()
      return NextResponse.json({ error: data.message || 'Paystack error' }, { status: 500 })
    }

    return NextResponse.json({
      success:           true,
      reference,
      authorization_url: data.data.authorization_url,
    })

  } catch (error) {
    console.error('Payment initialization error:', error)
    // Clean up pending doc if Firestore write succeeded but Paystack failed
    try { await adminDb.collection('pending_payments').doc(reference).delete() } catch {}
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}