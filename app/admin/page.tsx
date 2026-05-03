'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, where, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore'

interface Stats {
  totalUsers: number
  totalTransactions: number
  totalVolume: number
  totalFees: number
  activeListings: number
  pendingWithdrawals: number
  pendingKYC: number
  totalReferrals: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user?.id) return

      const userRef = doc(db, 'profiles', session.user.id)
      const userSnap = await getDoc(userRef)
      const userData = userSnap.data()

      if (userData?.is_admin === true) {
        setIsAdmin(true)
        fetchStats()
        fetchUsers()
      } else {
        router.push('/dashboard')
      }
      setLoading(false)
    }

    if (session?.user) {
      checkAdmin()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'profiles'))
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'))
      const listingsSnapshot = await getDocs(query(collection(db, 'energy_listings'), where('listing_status', '==', 'available')))
      const withdrawalsSnapshot = await getDocs(query(collection(db, 'withdrawals'), where('status', '==', 'pending')))

      const transactionsData = transactionsSnapshot.docs.map(doc => doc.data())
      const totalVolume = transactionsData.reduce((sum, t) => sum + (t.total_amount || 0), 0)
      const totalFees = transactionsData.reduce((sum, t) => sum + (t.fee_ngn || 0), 0)

      setStats({
        totalUsers: usersSnapshot.size,
        totalTransactions: transactionsSnapshot.size,
        totalVolume,
        totalFees,
        activeListings: listingsSnapshot.size,
        pendingWithdrawals: withdrawalsSnapshot.size,
        pendingKYC: 0,
        totalReferrals: 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'profiles'))
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <Link href="/dashboard" className="text-green-600 mt-4 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <h1 className="text-xl font-bold">EnerShare Admin</h1>
          <Link href="/dashboard" className="text-gray-600">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex space-x-4 mb-6 border-b">
          {['overview', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 capitalize ${activeTab === tab ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-500">Transactions</p>
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-500">Volume</p>
              <p className="text-2xl font-bold">₦{stats.totalVolume.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-500">Fees</p>
              <p className="text-2xl font-bold">₦{stats.totalFees.toLocaleString()}</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Admin</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3">{user.full_name || '—'}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.is_admin ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
