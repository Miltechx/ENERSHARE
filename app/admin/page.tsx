'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'

interface DashboardStats {
  totalUsers: number
  totalTransactions: number
  totalVolume: number
  totalFees: number
  activeListings: number
  pendingWithdrawals: number
  pendingVerifications: number
}

interface User {
  id: string
  email: string
  full_name: string
  balance_ngn: number
  is_verified: boolean
  is_admin: boolean
  created_at: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchAdminData()
    }
  }, [session])

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ])
      const statsData = await statsRes.json()
      const usersData = await usersRes.json()
      setStats(statsData)
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveUser = async (userId: string) => {
    await fetch('/api/admin/approve-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
    fetchAdminData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
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
              <Link href="/dashboard" className="text-gray-600 hover:text-primary">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8 border-b">
          {['overview', 'users', 'transactions', 'withdrawals'].map((tab) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-500 text-sm">Transactions</p>
              <p className="text-3xl font-bold">{stats.totalTransactions}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-500 text-sm">Total Volume</p>
              <p className="text-3xl font-bold text-green-600">₦{stats.totalVolume.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-500 text-sm">Fees Earned</p>
              <p className="text-3xl font-bold text-blue-600">₦{stats.totalFees.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-500 text-sm">Active Listings</p>
              <p className="text-3xl font-bold">{stats.activeListings}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-500 text-sm">Pending Withdrawals</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingWithdrawals}</p>
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
                    <th className="text-left py-3 px-6">Balance</th>
                    <th className="text-left py-3 px-6">Status</th>
                    <th className="text-left py-3 px-6">Joined</th>
                    <th className="text-left py-3 px-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6 font-medium">{user.full_name || user.email}</td>
                      <td className="py-3 px-6">{user.email}</td>
                      <td className="py-3 px-6">₦{user.balance_ngn.toLocaleString()}</td>
                      <td className="py-3 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {user.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-6">
                        {!user.is_verified && (
                          <button
                            onClick={() => approveUser(user.id)}
                            className="bg-primary text-white px-3 py-1 rounded text-sm"
                          >
                            Verify
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
      </div>
    </div>
  )
}