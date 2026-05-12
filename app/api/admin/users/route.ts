import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

async function verifyAdmin(token: string): Promise<string | null> {
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const snap    = await adminDb.collection('users').doc(decoded.uid).get()
    if (snap.exists && snap.data()?.is_admin === true) return decoded.uid
    return null
  } catch { return null }
}

// ─── GET: users + stats + transactions + withdrawals + revenue ────────────────
export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUid = await verifyAdmin(token)
  if (!adminUid)  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const section = searchParams.get('section') || 'users'

  try {
    if (section === 'users') {
      const snap  = await adminDb.collection('users').get()
      const users = await Promise.all(snap.docs.map(async d => {
        const data = d.data()
        let nairaBalance = 0
        try {
          const w = await adminDb.collection('wallets').doc(d.id).get()
          if (w.exists) nairaBalance = w.data()?.nairaBalance || 0
        } catch {}
        return {
          id: d.id,
          fullName:  data.fullName  || '—',
          email:     data.email     || '—',
          role:      data.role      || 'consumer',
          kycStatus: data.kycStatus || 'pending',
          is_admin:  data.is_admin  || false,
          createdAt: data.createdAt || '',
          nairaBalance,
        }
      }))
      return NextResponse.json({
        success: true,
        users,
        stats: {
          totalUsers:     users.length,
          totalProducers: users.filter(u => u.role === 'producer' || u.role === 'retailer').length,
          totalConsumers: users.filter(u => u.role === 'consumer').length,
          pendingKyc:     users.filter(u => u.kycStatus === 'submitted').length,
        },
      })
    }

    if (section === 'transactions') {
      const snap = await adminDb.collection('transactions')
        .orderBy('createdAt', 'desc').limit(50).get()
      const transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const totalVolume  = transactions.reduce((s: number, t: any) => s + (t.totalNaira || 0), 0)
      const totalFees    = transactions.reduce((s: number, t: any) => s + (t.platformFee || 0), 0)
      return NextResponse.json({ success: true, transactions, totalVolume, totalFees })
    }

    if (section === 'withdrawals') {
      const snap = await adminDb.collection('withdrawals')
        .orderBy('createdAt', 'desc').limit(50).get()
      const withdrawals = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const pending     = withdrawals.filter((w: any) => w.status === 'pending')
      return NextResponse.json({ success: true, withdrawals, pendingCount: pending.length })
    }

    if (section === 'revenue') {
      const snap    = await adminDb.collection('platform_revenue')
        .orderBy('createdAt', 'desc').limit(100).get()
      const entries = snap.docs.map(d => d.data())
      const total   = entries.reduce((s: number, e: any) => s + (e.amount || 0), 0)
      const today   = new Date().toISOString().split('T')[0]
      const todayRev = entries
        .filter((e: any) => e.createdAt?.startsWith(today))
        .reduce((s: number, e: any) => s + (e.amount || 0), 0)
      return NextResponse.json({ success: true, totalRevenue: total, todayRevenue: todayRev, entries })
    }

    return NextResponse.json({ error: 'Invalid section' }, { status: 400 })

  } catch (err) {
    console.error('Admin GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

// ─── PATCH: update user / approve-reject withdrawal ──────────────────────────
export async function PATCH(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUid = await verifyAdmin(token)
  if (!adminUid)  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()

  // Update user fields
  if (body.targetUid) {
    const { targetUid, role, kycStatus, is_admin } = body
    const update: Record<string, any> = { updatedAt: new Date().toISOString() }
    if (role      !== undefined) update.role      = role
    if (kycStatus !== undefined) update.kycStatus = kycStatus
    if (is_admin  !== undefined) update.is_admin  = is_admin
    await adminDb.collection('users').doc(targetUid).update(update)
    return NextResponse.json({ success: true })
  }

  // Approve or reject withdrawal
  if (body.withdrawalId) {
    const { withdrawalId, action } = body // action: 'approve' | 'reject'
    const wSnap = await adminDb.collection('withdrawals').doc(withdrawalId).get()
    if (!wSnap.exists) return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })

    const w = wSnap.data()!

    if (action === 'reject') {
      // Refund the amount back to wallet
      const walletRef = adminDb.collection('wallets').doc(w.userId)
      const walletSnap = await walletRef.get()
      if (walletSnap.exists) {
        await walletRef.update({
          nairaBalance: (walletSnap.data()?.nairaBalance || 0) + w.amountNaira,
          updatedAt: new Date().toISOString(),
        })
      }
      await adminDb.collection('withdrawals').doc(withdrawalId).update({
        status: 'rejected', rejectedAt: new Date().toISOString(),
      })
      await adminDb.collection('notifications').add({
        userId: w.userId, title: 'Withdrawal Rejected',
        message: `Your withdrawal of ₦${w.amountNaira?.toLocaleString()} was rejected. Amount returned to wallet.`,
        type: 'withdrawal_failed', read: false, createdAt: new Date().toISOString(),
      })
    }

    if (action === 'approve') {
      await adminDb.collection('withdrawals').doc(withdrawalId).update({
        status: 'approved', approvedAt: new Date().toISOString(), approvedBy: adminUid,
      })
      await adminDb.collection('notifications').add({
        userId: w.userId, title: 'Withdrawal Approved',
        message: `Your withdrawal of ₦${w.amountNaira?.toLocaleString()} has been approved and is being processed.`,
        type: 'withdrawal', read: false, createdAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
}