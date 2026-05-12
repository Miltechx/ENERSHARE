import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, location, userType } = await request.json()

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check if already on waitlist
    const existing = await adminDb
      .collection('waitlist')
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get()

    if (!existing.empty) {
      return NextResponse.json({ success: true, message: 'Already on waitlist' })
    }

    // Add to waitlist
    await adminDb.collection('waitlist').add({
      fullName:  fullName.trim(),
      email:     email.toLowerCase().trim(),
      phone:     phone?.trim() || '',
      location:  location?.trim() || '',
      userType:  userType || 'consumer',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const snap = await adminDb.collection('waitlist').count().get()
    return NextResponse.json({ count: snap.data().count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}