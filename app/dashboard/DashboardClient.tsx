'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase/client'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { Icons } from '@/components/icons'

export default function DashboardClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    kwhBalance: 0,
    nairaBalance: 0,
    totalSpent: 0,
    totalEarned: 0,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth/signin')
        return
      }
      setUser(currentUser)
      
      // Fetch profile and wallet
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        setProfile(userDoc.data())
      }
      
      const walletDoc = await getDoc(doc(db, 'wallets', currentUser.uid))
      if (walletDoc.exists()) {
        const walletData = walletDoc.data()
        setWallet(walletData)
        setStats({
          kwhBalance: walletData.kwhBalance || 0,
          nairaBalance: walletData.nairaBalance || 0,
          totalSpent: walletData.totalSpent || 0,
          totalEarned: walletData.totalEarned || 0,
        })
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/auth/signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {profile?.fullName?.split(' ')[0] || user.email?.split('@')[0]}
            </h1>
            <p className="text-gray-400 mt-1">Here's your energy ecosystem summary</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
            <p className="text-green-100 text-sm">KWH BALANCE</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.kwhBalance} kWh</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
            <p className="text-blue-100 text-sm">NAIRA BALANCE</p>
            <p className="text-3xl font-bold text-white mt-1">₦{stats.nairaBalance.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">TOTAL SPENT</p>
            <p className="text-2xl font-bold text-white mt-1">₦{stats.totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">TOTAL EARNED</p>
            <p className="text-2xl font-bold text-white mt-1">₦{stats.totalEarned.toLocaleString()}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/marketplace" className="bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-semibold transition">
            Buy Energy
          </Link>
          <Link href="/marketplace/sell" className="bg-gray-700 hover:bg-gray-600 text-white text-center py-3 rounded-lg font-semibold transition">
            Sell Energy
          </Link>
          <Link href="/wallet" className="bg-gray-700 hover:bg-gray-600 text-white text-center py-3 rounded-lg font-semibold transition">
            Wallet
          </Link>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <p className="text-gray-400 text-center py-8">No transactions yet. Start trading!</p>
        </div>
      </div>
    </div>
  )
}