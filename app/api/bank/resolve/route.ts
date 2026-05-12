import { NextRequest, NextResponse } from 'next/server'

// No auth required — bank resolution is a public lookup
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bankCode      = searchParams.get('bankCode')?.trim()
  const accountNumber = searchParams.get('accountNumber')?.trim().replace(/\s/g, '')

  if (!bankCode || !accountNumber) {
    return NextResponse.json({ success: false, error: 'bankCode and accountNumber are required' }, { status: 400 })
  }

  if (accountNumber.length !== 10) {
    return NextResponse.json({ success: false, error: 'Account number must be exactly 10 digits' }, { status: 400 })
  }

  if (!/^\d{10}$/.test(accountNumber)) {
    return NextResponse.json({ success: false, error: 'Account number must contain digits only' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    )

    const data = await res.json()

    if (data.status && data.data?.account_name) {
      return NextResponse.json({ success: true, accountName: data.data.account_name })
    }

    // Distinguish error types
    const msg = data.message?.toLowerCase() || ''
    if (msg.includes('invalid') || msg.includes('not found') || msg.includes('could not')) {
      return NextResponse.json({ success: false, error: 'Account not found. Check bank and number.' }, { status: 404 })
    }

    return NextResponse.json({ success: false, error: data.message || 'Could not resolve account' }, { status: 400 })

  } catch (err) {
    console.error('Bank resolve error:', err)
    return NextResponse.json({ success: false, error: 'Bank verification service unavailable. Try again.' }, { status: 503 })
  }
}