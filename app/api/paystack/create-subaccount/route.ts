import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let uid: string
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
    uid = decoded.uid
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { business_name, bank_code, account_number } = await request.json()

  if (!business_name || !bank_code || !account_number) {
    return NextResponse.json({ error: 'business_name, bank_code, and account_number are required' }, { status: 400 })
  }

  try {
    // Create Paystack subaccount for this seller
    const res = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name,
        settlement_bank: bank_code,
        account_number,
        percentage_charge: 2.5, // EnerShare keeps 2.5%
        description: `EnerShare seller: ${business_name}`,
      }),
    })

    const data = await res.json()

    if (!data.status) {
      console.error('Paystack subaccount error:', data)
      return NextResponse.json({ error: data.message || 'Failed to create subaccount' }, { status: 400 })
    }

    const subaccountCode = data.data.subaccount_code

    // Save subaccount code to user's Firestore profile
    await adminDb.collection('users').doc(uid).update({
      paystackSubaccountCode: subaccountCode,
      bankName:               data.data.settlement_bank,
      accountNumber:          data.data.account_number,
      updatedAt:              new Date().toISOString(),
    })

    return NextResponse.json({
      success:          true,
      subaccount_code:  subaccountCode,
      bank:             data.data.settlement_bank,
      account_number:   data.data.account_number,
    })

  } catch (err: any) {
    console.error('Create subaccount error:', err)
    return NextResponse.json({ error: 'Failed to create subaccount' }, { status: 500 })
  }
}