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
    await adminAuth.revokeRefreshTokens(decoded.uid)

    await adminDb.collection('users').doc(decoded.uid).update({
      lastSignOutAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session revocation error:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}