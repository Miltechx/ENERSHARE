import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await adminAuth.verifyIdToken(token)
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const bankCode = searchParams.get('bankCode')
  const accountNumber = searchParams.get('accountNumber')

  if (!bankCode || !accountNumber) {
    return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
  }

  if (accountNumber.length !== 10) {
    return NextResponse.json({ success: false, error: 'Account number must be 10 digits' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    )
    const data = await response.json()
    if (data.status) {
      return NextResponse.json({ success: true, accountName: data.data.account_name })
    } else {
      return NextResponse.json({ success: false, error: data.message })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to resolve account' }, { status: 500 })
  }
}