'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { Icons } from '@/components/icons'

interface DashboardData {
  stats: {
    kwhBalance: number
    nairaBalance: number
    totalSpent: number
    totalEarned: number
    activeListings: number
  }
  recentTransactions: any[]
  nearbyListings: any[]
}

export default function DashboardClient() {
  const router = useRouter()
  // Use the shared auth context — keeps session consistent across mobile & desktop
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/signin')
      return
    }

    const loadDashboard = async () => {
      try {
        // Ensure wallet exists
        const walletRef = doc(db, 'wallets', user.uid)
        const walletSnap = await getDoc(walletRef)
        let wallet = walletSnap.data()

        if (!walletSnap.exists()) {
          wallet = {
            userId: user.uid,
            kwhBalance: 0,
            nairaBalance: 0,
            totalEarned: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
          }
          await setDoc(walletRef, wallet)
        }

        // Active listings count
        const listingsQuery = query(
          collection(db, 'listings'),
          where('sellerId', '==', user.uid),
          where('isActive', '==', true)
        )
        const listingsSnap = await getDocs(listingsQuery)

        // Recent transactions
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('buyerId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
        const transactionsSnap = await getDocs(transactionsQuery)
        const recentTransactions = transactionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

        // Nearby listings — fall back to all active listings if no state set
        let nearbyListings: any[] = []
        const userState = profile?.state

        if (userState) {
          const nearbyQuery = query(
            collection(db, 'listings'),
            where('locationState', '==', userState),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc'),
            limit(3)
          )
          const nearbySnap = await getDocs(nearbyQuery)
          nearbyListings = nearbySnap.docs.map(d => ({ id: d.id, ...d.data() }))
        }

        // If no state or no nearby results, show latest 3 active listings
        if (nearbyListings.length === 0) {
          const fallbackQuery = query(
            collection(db, 'listings'),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc'),
            limit(3)
          )
          const fallbackSnap = await getDocs(fallbackQuery)
          nearbyListings = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        }

        setData({
          stats: {
            kwhBalance: wallet?.kwhBalance || 0,
            nairaBalance: wallet?.nairaBalance || 0,
            totalSpent: wallet?.totalSpent || 0,
            totalEarned: wallet?.totalEarned || 0,
            activeListings: listingsSnap.size,
          },
          recentTransactions,
          nearbyListings,
        })
      } catch (error) {
        console.error('Dashboard error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [user, authLoading, profile, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!data || !user) return null

  const isProducer = profile?.role === 'producer' || profile?.role === 'retailer'
  const displayName = profile?.fullName?.split(' ')[0] || user.email?.split('@')[0]

  return (
    // NOTE: The global <Navbar> already renders in the layout.
    // This page should NOT have its own <header> to avoid duplication.
    <div className="min-h-screen bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back, {displayName}</h1>
          <p className="text-gray-400 mt-1">Here's your energy ecosystem summary</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
            <p className="text-green-100 text-sm">KWH BALANCE</p>
            <p className="text-3xl font-bold text-white mt-1">{data.stats.kwhBalance} kWh</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
            <p className="text-blue-100 text-sm">NAIRA BALANCE</p>
            <p className="text-3xl font-bold text-white mt-1">₦{data.stats.nairaBalance.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">TOTAL SPENT</p>
            <p className="text-2xl font-bold text-white mt-1">₦{data.stats.totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">TOTAL EARNED</p>
            <p className="text-2xl font-bold text-white mt-1">₦{data.stats.totalEarned.toLocaleString()}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/marketplace"
            className="bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Icons.Lightning className="w-5 h-5" /> Buy Energy
          </Link>
          <Link
            href="/marketplace/sell"
            className="bg-gray-700 hover:bg-gray-600 text-white text-center py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Icons.Solar className="w-5 h-5" /> Sell Energy
          </Link>
          <Link
            href="/wallet"
            className="bg-gray-700 hover:bg-gray-600 text-white text-center py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Icons.Wallet className="w-5 h-5" /> Wallet
          </Link>
        </div>

        {/* Recent Transactions + Nearby Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
              <Link href="/wallet?tab=history" className="text-green-500 text-sm hover:underline">View All</Link>
            </div>
            {data.recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Icons.Trade className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No transactions yet</p>
                <Link href="/marketplace" className="text-green-500 text-sm hover:underline mt-2 inline-block">
                  Start trading
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        {tx.type === 'purchase' ? 'Energy Purchase' : 'Energy Sale'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                    <p className={`font-semibold ${tx.type === 'purchase' ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.type === 'purchase' ? '-' : '+'}₦{tx.totalNaira?.toLocaleString() || 0}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {profile?.state ? 'Near You' : 'Latest Listings'}
              </h2>
              <Link href="/marketplace" className="text-green-500 text-sm hover:underline">View All</Link>
            </div>
            {data.nearbyListings.length === 0 ? (
              <div className="text-center py-8">
                <Icons.Lightning className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No active listings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.nearbyListings.map((listing: any) => (
                  <div key={listing.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{listing.title}</p>
                      <p className="text-xs text-gray-400">{listing.locationCity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">₦{listing.pricePerKwh}/kWh</p>
                      <p className="text-gray-400 text-sm">{listing.kwhAvailable} kWh left</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Producer: Active Listings */}
        {isProducer && (
          <div className="mt-8 bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Active Listings</h2>
              <Link href="/listings/mine" className="text-green-500 text-sm hover:underline">
                Manage Listings
              </Link>
            </div>
            {data.stats.activeListings === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400">You have no active listings</p>
                <Link href="/marketplace/sell" className="text-green-500 text-sm hover:underline mt-2 inline-block">
                  Create your first listing
                </Link>
              </div>
            ) : (
              <p className="text-gray-300">
                You have{' '}
                <span className="text-green-400 font-semibold">{data.stats.activeListings}</span>{' '}
                active listing{data.stats.activeListings !== 1 ? 's' : ''}.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}