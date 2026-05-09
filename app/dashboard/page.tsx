'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { EnergyListing, Transaction } from '@/types'
import DashboardEmailBanner from '@/components/DashboardEmailBanner'

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic'

interface DashboardStats {
  kwhBalance: number
  nairaBalance: number
  totalSpent: number
  totalEarned: number
  activeListings: number
  nearbyListings: number
}

export default function DashboardPage() {
  const { user, profile, wallet, loading: authLoading, refreshWallet } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    kwhBalance: 0,
    nairaBalance: 0,
    totalSpent: 0,
    totalEarned: 0,
    activeListings: 0,
    nearbyListings: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [nearbyListings, setNearbyListings] = useState<EnergyListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
    if (!authLoading && user && !profile?.onboardingCompleted) {
      router.push('/onboarding')
    }
  }, [user, authLoading, profile, router])

  useEffect(() => {
    if (user && wallet) {
      fetchDashboardData()
    }
  }, [user, wallet])

  const fetchDashboardData = async () => {
    if (!user || !profile) return

    setLoading(true)
    try {
      setStats(prev => ({
        ...prev,
        kwhBalance: wallet?.kwhBalance || 0,
        nairaBalance: wallet?.nairaBalance || 0,
        totalSpent: wallet?.totalSpent || 0,
        totalEarned: wallet?.totalEarned || 0,
      }))

      const transactionsRef = collection(db, 'transactions')
      const q = query(
        transactionsRef,
        where('buyerId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      const txSnapshot = await getDocs(q)
      const transactions = txSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]
      setRecentTransactions(transactions)

      const listingsRef = collection(db, 'listings')
      const listingsQuery = query(
        listingsRef,
        where('sellerId', '==', user.uid),
        where('isActive', '==', true)
      )
      const listingsSnapshot = await getDocs(listingsQuery)
      setStats(prev => ({ ...prev, activeListings: listingsSnapshot.size }))

      const nearbyQuery = query(
        listingsRef,
        where('locationState', '==', profile.state),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(3)
      )
      const nearbySnapshot = await getDocs(nearbyQuery)
      const nearby = nearbySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EnergyListing[]
      setNearbyListings(nearby)
      setStats(prev => ({ ...prev, nearbyListings: nearby.length }))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  const isProducer = profile?.role === 'producer' || profile?.role === 'retailer'

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardEmailBanner />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {profile?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-gray-400 mt-1">Here's what's happening with your energy ecosystem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
            <p className="text-green-100 text-sm">KWH BALANCE</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.kwhBalance} kWh</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
            <p className="text-blue-100 text-sm">NAIRA BALANCE</p>
            <p className="text-3xl font-bold text-white mt-1">
              ₦{stats.nairaBalance.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">TOTAL SPENT</p>
            <p className="text-2xl font-bold text-white mt-1">
              ₦{stats.totalSpent.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">TOTAL EARNED</p>
            <p className="text-2xl font-bold text-white mt-1">
              ₦{stats.totalEarned.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/marketplace"
            className="bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-semibold transition"
          >
            Buy Energy
          </Link>
          {isProducer && (
            <Link
              href="/listings/new"
              className="bg-gray-700 hover:bg-gray-600 text-white text-center py-3 rounded-lg font-semibold transition"
            >
              Create Listing
            </Link>
          )}
          <Link
            href="/wallet"
            className="bg-gray-700 hover:bg-gray-600 text-white text-center py-3 rounded-lg font-semibold transition"
          >
            Wallet
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
              <Link href="/wallet?tab=history" className="text-green-500 text-sm hover:underline">
                View All
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No transactions yet</p>
                <Link href="/marketplace" className="text-green-500 text-sm hover:underline mt-2 inline-block">
                  Start trading
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        {tx.type === 'purchase' ? 'Energy Purchase' : 'Energy Sale'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {tx.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === 'purchase' ? 'text-red-400' : 'text-green-400'}`}>
                        {tx.type === 'purchase' ? '-' : '+'}₦{tx.totalNaira.toLocaleString()}
                      </p>
                      {tx.kwhAmount && (
                        <p className="text-gray-400 text-sm">{tx.kwhAmount} kWh</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Near You</h2>
              <Link href="/marketplace" className="text-green-500 text-sm hover:underline">
                View All
              </Link>
            </div>

            {nearbyListings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No active listings nearby</p>
                {isProducer && (
                  <Link href="/listings/new" className="text-green-500 text-sm hover:underline mt-2 inline-block">
                    Create the first listing
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyListings.map((listing) => (
                  <div key={listing.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{listing.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 capitalize">{listing.energySource}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{listing.locationCity}</span>
                      </div>
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

        {isProducer && (
          <div className="mt-8 bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Active Listings</h2>
              <Link href="/listings/mine" className="text-green-500 text-sm hover:underline">
                Manage Listings
              </Link>
            </div>

            {stats.activeListings === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">You have no active listings</p>
                <Link href="/listings/new" className="text-green-500 text-sm hover:underline mt-2 inline-block">
                  Create your first listing
                </Link>
              </div>
            ) : (
              <p className="text-gray-300">
                You have <span className="text-green-400 font-semibold">{stats.activeListings}</span> active listings.
                <Link href="/listings/mine" className="ml-2 text-green-500 hover:underline">
                  View and manage
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}