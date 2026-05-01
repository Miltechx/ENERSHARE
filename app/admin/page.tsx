'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore'

interface AdminStats {
  totalUsers: number
  totalTransactions: number
  totalVolume: number
  totalFees: number
  activeListings: number
}

interface User {
  id: string
  full_name: string
  email: string
  is_approved: boolean
  created_at: string
  wallet_balance: number
}

export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [sessionStatus, router])

  useEffect(() => {
    if (session?.user) {
      checkAdmin()
    }
  }, [session])

  const checkAdmin = async () => {
    if (!session?.user?.id) return

    try {
      const userRef = doc(db, 'users', session.user.id)
      const userSnap = await getDoc(userRef)
      const userData = userSnap.data()
      
      if (userData?.is_admin) {
        setIsAdmin(true)
        fetchStats()
        fetchUsers()
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking admin:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'))
      const listingsSnapshot = await getDocs(query(collection(db, 'energy_listings'), where('listing_status', '==', 'available')))
      
      const totalUsers = usersSnapshot.size
      const totalTransactions = transactionsSnapshot.size
      const totalVolume = transactionsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().total_amount || 0), 0)
      const totalFees = transactionsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().fee_ngn || 0), 0)
      const activeListings = listingsSnapshot.size

      setStats({ totalUsers, totalTransactions, totalVolume, totalFees, activeListings })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const approveUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, { is_approved: true })
      fetchUsers()
    } catch (error) {
      console.error('Error approving user:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-gray-500 mt-2">You don't have permission to access this page.</p>
          <Link href="/dashboard" className="inline-block mt-4 text-primary hover:underline">
            Back to Dashboard →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo variant="compact" />
              <span className="ml-4 text-sm bg-red-100 text-red-600 px-2 py-1 rounded">Admin</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary transition">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8 border-b">
          {['overview', 'users', 'transactions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 capitalize font-semibold transition ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-500 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalTransactions}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-500 text-sm">Total Volume</p>
                <p className="text-3xl font-bold text-primary">₦{stats.totalVolume.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-500 text-sm">Platform Fees</p>
                <p className="text-3xl font-bold text-green-600">₦{stats.totalFees.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Active Listings</h3>
              <p className="text-4xl font-bold text-primary">{stats.activeListings}</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-6">User</th>
                    <th className="text-left py-3 px-6">Email</th>
                    <th className="text-left py-3 px-6">Wallet</th>
                    <th className="text-left py-3 px-6">Status</th>
                    <th className="text-left py-3 px-6">Joined</th>
                    <th className="text-left py-3 px-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6 font-medium">{user.full_name}</td>
                      <td className="py-3 px-6 text-gray-600">{user.email}</td>
                      <td className="py-3 px-6">₦{user.wallet_balance?.toLocaleString() || 0}</td>
                      <td className="py-3 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {user.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-6">
                        {!user.is_approved && (
                          <button
                            onClick={() => approveUser(user.id)}
                            className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">Transaction history coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
