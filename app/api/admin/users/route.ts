import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

async function verifyAdmin(token: string): Promise<string | null> {
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const doc = await adminDb.collection('users').doc(decoded.uid).get()
    if (doc.exists && doc.data()?.is_admin === true) return decoded.uid
    return null
  } catch {
    return null
  }
}

// ─── GET: fetch all users + stats ─────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUid = await verifyAdmin(token)
  if (!adminUid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const usersSnap = await adminDb.collection('users').get()

    const users = await Promise.all(
      usersSnap.docs.map(async (d) => {
        const data = d.data()
        let nairaBalance = 0
        try {
          const w = await adminDb.collection('wallets').doc(d.id).get()
          if (w.exists) nairaBalance = w.data()?.nairaBalance || 0
        } catch {}

        return {
          id:           d.id,
          fullName:     data.fullName   || '—',
          email:        data.email      || '—',
          role:         data.role       || 'consumer',
          kycStatus:    data.kycStatus  || 'pending',
          is_admin:     data.is_admin   || false,
          createdAt:    data.createdAt  || '',
          nairaBalance,
        }
      })
    )

    const stats = {
      totalUsers:      users.length,
      totalProducers:  users.filter(u => u.role === 'producer' || u.role === 'retailer').length,
      totalConsumers:  users.filter(u => u.role === 'consumer').length,
      pendingKyc:      users.filter(u => u.kycStatus === 'submitted').length,
    }

    return NextResponse.json({ success: true, users, stats })
  } catch (err) {
    console.error('Admin GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// ─── PATCH: update role / kycStatus / is_admin ────────────────────────────────
export async function PATCH(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUid = await verifyAdmin(token)
  if (!adminUid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { targetUid, role, kycStatus, is_admin } = await request.json()
  if (!targetUid) return NextResponse.json({ error: 'targetUid required' }, { status: 400 })

  const update: Record<string, any> = { updatedAt: new Date().toISOString() }
  if (role      !== undefined) update.role      = role
  if (kycStatus !== undefined) update.kycStatus = kycStatus
  if (is_admin  !== undefined) update.is_admin  = is_admin

  await adminDb.collection('users').doc(targetUid).update(update)
  return NextResponse.json({ success: true })
}