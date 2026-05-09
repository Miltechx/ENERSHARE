'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase/client'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser?.email)
      
      if (!currentUser) {
        console.log('No user, redirecting to signin')
        router.push('/auth/signin')
        return
      }

      setUser(currentUser)
      console.log('User found:', currentUser.uid)

      try {
        // Fetch profile
        const profileDoc = await getDoc(doc(db, 'users', currentUser.uid))
        console.log('Profile exists:', profileDoc.exists())
        
        if (profileDoc.exists()) {
          setProfile(profileDoc.data())
        } else {
          // Create profile if not exists
          const newProfile = {
            uid: currentUser.uid,
            fullName: currentUser.displayName || currentUser.email?.split('@')[0],
            email: currentUser.email,
            role: 'consumer',
            createdAt: new Date().toISOString()
          }
          await setDoc(doc(db, 'users', currentUser.uid), newProfile)
          setProfile(newProfile)
        }

        // Fetch wallet
        const walletDoc = await getDoc(doc(db, 'wallets', currentUser.uid))
        console.log('Wallet exists:', walletDoc.exists())
        
        if (walletDoc.exists()) {
          setWallet(walletDoc.data())
        } else {
          // Create wallet if not exists
          const newWallet = {
            userId: currentUser.uid,
            kwhBalance: 0,
            nairaBalance: 5000,
            totalEarned: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString()
          }
          await setDoc(doc(db, 'wallets', currentUser.uid), newWallet)
          setWallet(newWallet)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/auth/signin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold text-white">EnerShare</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/marketplace" className="text-gray-300 hover:text-green-500 transition">Marketplace</Link>
            <Link href="/wallet" className="text-gray-300 hover:text-green-500 transition">Wallet</Link>
            <button
              onClick={handleLogout}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome, {displayName}
          </h1>
          <p className="text-gray-400 mt-1">Here's your energy dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
            <p className="text-green-100 text-sm">KWH BALANCE</p>
            <p className="text-3xl font-bold text-white mt-1">{wallet?.kwhBalance || 0} kWh</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
            <p className="text-blue-100 text-sm">NAIRA BALANCE</p>
            <p className="text-3xl font-bold text-white mt-1">₦{(wallet?.nairaBalance || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">TOTAL SPENT</p>
            <p className="text-2xl font-bold text-white mt-1">₦{(wallet?.totalSpent || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">TOTAL EARNED</p>
            <p className="text-2xl font-bold text-white mt-1">₦{(wallet?.totalEarned || 0).toLocaleString()}</p>
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

        {/* Info Card */}
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-400">
            {wallet?.nairaBalance === 0 && wallet?.kwhBalance === 0 ? (
              <>Get started by <Link href="/marketplace" className="text-green-500 hover:underline">buying energy</Link> or <Link href="/marketplace/sell" className="text-green-500 hover:underline">selling your surplus</Link></>
            ) : (
              <>Ready to trade? Visit the <Link href="/marketplace" className="text-green-500 hover:underline">marketplace</Link></>
            )}
          </p>
        </div>
      </main>
    </div>
  )
}