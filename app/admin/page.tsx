'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

interface AdminStats {
  totalUsers: number
  totalTransactions: number
  totalVolume: number
  totalFees: number
  activeListings: number
  pendingKyc: number
}

interface User {
  id: string
  full_name: string
  email: string
  is_approved: boolean
  created_at: string
  wallet_balance: number
}

interface Transaction {
  id: string
  buyer_name: string
  seller_name: string
  amount_kwh: number
  total_amount: number
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin (you can set this in profiles table)
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchAdminData()
    }
  }, [session])

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, txRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/transactions'),
      ])

      const statsData = await statsRes.json()
      const usersData = await usersRes.json()
      const txData = await txRes.json()

      setStats(statsData)
      setUsers(usersData)
      setTransactions(txData)
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

  const resolveDispute = async (transactionId: string, resolution: string) => {
    await fetch('/api/admin/resolve-dispute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: transactionId, resolution }),
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
      {/* Navigation */}
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
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b">
          {['overview', 'users', 'transactions', 'disputes', 'kyc'].map((tab) => (
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

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-gray-500 text-sm">Total Fees Earned</p>
                <p className="text-3xl font-bold text-green-600">₦{stats.totalFees.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Active Listings</h3>
                <p className="text-4xl font-bold text-primary">{stats.activeListings}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Pending KYC</h3>
                <p className="text-4xl font-bold text-orange-500">{stats.pendingKyc}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                    <td className="py-3 px-6">₦{user.wallet_balance.toLocaleString()}</td>
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
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-6">Date</th>
                  <th className="text-left py-3 px-6">Buyer</th>
                  <th className="text-left py-3 px-6">Seller</th>
                  <th className="text-left py-3 px-6">Amount</th>
                  <th className="text-left py-3 px-6">Total</th>
                  <th className="text-left py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-6 text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-6">{tx.buyer_name}</td>
                    <td className="py-3 px-6">{tx.seller_name}</td>
                    <td className="py-3 px-6">{tx.amount_kwh} kWh</td>
                    <td className="py-3 px-6">₦{tx.total_amount.toLocaleString()}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-center py-8">No active disputes</p>
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-center py-8">No pending KYC submissions</p>
          </div>
        )}
      </div>
    </div>
  )
}
