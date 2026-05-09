'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import { Icons } from '@/components/icons'

interface WalletStats {
  kwhBalance: number
  nairaBalance: number
  totalSpent: number
  totalEarned: number
}

export default function DashboardClient() {
  const router = useRouter()

  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats]     = useState<WalletStats>({
    kwhBalance: 0,
    nairaBalance: 0,
    totalSpent: 0,
    totalEarned: 0,
  })
  const [loading, setLoading]     = useState(true)
  const [authReady, setAuthReady] = useState(false) // true once Firebase has resolved auth state
  const [dataError, setDataError] = useState('')

  // ─── Auth + data loader ────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthReady(true)

      // Firebase auth state resolved — no user
      if (!currentUser) {
        // Middleware already guards this route via __session cookie.
        // If Firebase client state is null it usually means the session
        // cookie is valid but IndexedDB hasn't hydrated yet. Wait one tick
        // before deciding to redirect so we don't create a redirect loop.
        setTimeout(() => {
          // Re-check: if still no user after tick, go to signin
          if (!auth.currentUser) {
            router.push('/auth/signin')
          }
        }, 500)
        setLoading(false)
        return
      }

      setUser(currentUser)

      try {
        // ── Profile ──────────────────────────────────────────────────────────
        const userRef  = doc(db, 'users', currentUser.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          setProfile(userSnap.data())
        } else {
          // First-time Google user — create profile on the fly
          const fallback = {
            uid:       currentUser.uid,
            fullName:  currentUser.displayName || '',
            email:     currentUser.email || '',
            phone:     '',
            role:      'consumer',
            state:     'Lagos',
            city:      '',
            createdAt: new Date().toISOString(),
          }
          await setDoc(userRef, fallback)
          setProfile(fallback)
        }

        // ── Wallet ───────────────────────────────────────────────────────────
        const walletRef  = doc(db, 'wallets', currentUser.uid)
        const walletSnap = await getDoc(walletRef)

        if (walletSnap.exists()) {
          const w = walletSnap.data()
          setStats({
            kwhBalance:   w.kwhBalance   ?? 0,
            nairaBalance: w.nairaBalance ?? 0,
            totalSpent:   w.totalSpent   ?? 0,
            totalEarned:  w.totalEarned  ?? 0,
          })
        } else {
          // Create wallet if it doesn't exist yet
          const emptyWallet = {
            userId:       currentUser.uid,
            kwhBalance:   0,
            nairaBalance: 0,
            totalEarned:  0,
            totalSpent:   0,
            createdAt:    new Date().toISOString(),
          }
          await setDoc(walletRef, emptyWallet)
        }
      } catch (err: any) {
        console.error('Dashboard data error:', err)
        setDataError('Could not load your data. Check your connection and refresh.')
      } finally {
        // Always stop the spinner — even if Firestore failed
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  // ─── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await signOut(auth)
      await fetch('/api/auth/session', { method: 'DELETE' })
    } finally {
      router.push('/auth/signin')
    }
  }

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
        <p className="text-gray-400 text-sm">Loading your dashboard…</p>
      </div>
    )
  }

  // ─── Not authenticated ─────────────────────────────────────────────────────
  if (!user) return null

  // ─── Data error ────────────────────────────────────────────────────────────
  if (dataError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-400 font-semibold mb-2">Something went wrong</p>
          <p className="text-gray-400 text-sm mb-4">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const displayName = profile?.fullName?.split(' ')[0] || user.email?.split('@')[0] || 'User'

  // ─── Dashboard UI ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {displayName} 👋
            </h1>
            <p className="text-gray-400 mt-1">Here&apos;s your energy ecosystem summary</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
            <p className="text-green-100 text-sm font-medium uppercase tracking-wide">KWH Balance</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.kwhBalance} kWh</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Naira Balance</p>
            <p className="text-3xl font-bold text-white mt-2">₦{stats.nairaBalance.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Total Spent</p>
            <p className="text-2xl font-bold text-white mt-2">₦{stats.totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Total Earned</p>
            <p className="text-2xl font-bold text-white mt-2">₦{stats.totalEarned.toLocaleString()}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/marketplace"
            className="bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-semibold transition"
          >
            Buy Energy
          </Link>
          <Link
            href="/marketplace/sell"
            className="bg-gray-700 hover:bg-gray-600 text-white text-center py-3 rounded-lg font-semibold transition"
          >
            Sell Energy
          </Link>
          <Link
            href="/wallet"
            className="bg-gray-700 hover:bg-gray-600 text-white text-center py-3 rounded-lg font-semibold transition"
          >
            Wallet
          </Link>
        </div>

        {/* Profile summary */}
        {profile && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Account Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white truncate">{profile.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="text-white">{profile.phone || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400">State</p>
                <p className="text-white">{profile.state || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400">Role</p>
                <p className="text-white capitalize">{profile.role || 'consumer'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <Icons.Lightning className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400 text-center">No transactions yet.</p>
            <Link
              href="/marketplace"
              className="text-green-500 hover:underline text-sm font-medium"
            >
              Start trading →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}