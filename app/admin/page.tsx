'use client'
import BackButton from '@/components/BackButton'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, updateDoc, doc, orderBy, limit } from 'firebase/firestore'
import { UserProfile, WithdrawalRequest } from '@/types'

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'kyc' | 'withdrawals' | 'listings'>('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingKyc: 0,
    pendingWithdrawals: 0,
  })
  const [users, setUsers] = useState<UserProfile[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
    if (!authLoading && profile?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, authLoading, profile, router])

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAdminData()
    }
  }, [profile, activeTab])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      // Fetch stats
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const listingsSnapshot = await getDocs(collection(db, 'listings'))
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'))
      const kycQuery = query(collection(db, 'users'), where('kycStatus', '==', 'submitted'))
      const kycSnapshot = await getDocs(kycQuery)
      const withdrawalsQuery = query(collection(db, 'withdrawals'), where('status', '==', 'pending'))
      const withdrawalsSnapshot = await getDocs(withdrawalsQuery)

      let totalVolume = 0
      transactionsSnapshot.forEach(doc => {
        totalVolume += doc.data().totalNaira || 0
      })

      setStats({
        totalUsers: usersSnapshot.size,
        totalListings: listingsSnapshot.size,
        totalTransactions: transactionsSnapshot.size,
        totalVolume,
        pendingKyc: kycSnapshot.size,
        pendingWithdrawals: withdrawalsSnapshot.size,
      })

      // Fetch users if on users tab
      if (activeTab === 'users') {
        const usersData: UserProfile[] = []
        usersSnapshot.forEach(doc => {
          usersData.push({ id: doc.id, ...doc.data() } as UserProfile)
        })
        setUsers(usersData)
      }

      // Fetch withdrawals if on withdrawals tab
      if (activeTab === 'withdrawals') {
        const withdrawalsData: WithdrawalRequest[] = []
        withdrawalsSnapshot.forEach(doc => {
          withdrawalsData.push({ id: doc.id, ...doc.data() } as WithdrawalRequest)
        })
        setWithdrawals(withdrawalsData)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKycDecision = async (userId: string, approved: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        kycStatus: approved ? 'verified' : 'rejected',
        kycRejectionReason: approved ? undefined : 'Failed verification',
        updatedAt: new Date().toISOString(),
      })
      await fetchAdminData()
    } catch (error) {
      console.error('Error updating KYC:', error)
    }
  }

  const handleWithdrawalDecision = async (withdrawalId: string, approved: boolean) => {
    try {
      await updateDoc(doc(db, 'withdrawals', withdrawalId), {
        status: approved ? 'completed' : 'rejected',
        adminNotes: approved ? 'Approved' : 'Rejected by admin',
        updatedAt: new Date().toISOString(),
      })
      await fetchAdminData()
    } catch (error) {
      console.error('Error updating withdrawal:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <BackButton />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (profile?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
        <BackButton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Platform management and oversight</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Active Listings</p>
            <p className="text-2xl font-bold text-white">{stats.totalListings}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Transactions</p>
            <p className="text-2xl font-bold text-white">{stats.totalTransactions}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Volume</p>
            <p className="text-2xl font-bold text-white">₦{stats.totalVolume.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Pending KYC</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingKyc}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-700 mb-6 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'users', label: 'Users' },
            { key: 'kyc', label: 'KYC Verification' },
            { key: 'withdrawals', label: 'Withdrawals' },
            { key: 'listings', label: 'Listings' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.key === 'kyc' && stats.pendingKyc > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-black text-xs rounded-full">
                  {stats.pendingKyc}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300">Name</th>
                    <th className="text-left p-4 text-gray-300">Email</th>
                    <th className="text-left p-4 text-gray-300">Role</th>
                    <th className="text-left p-4 text-gray-300">KYC Status</th>
                    <th className="text-left p-4 text-gray-300">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} className="border-t border-gray-700">
                      <td className="p-4 text-white">{user.fullName}</td>
                      <td className="p-4 text-gray-400">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                          user.role === 'producer' ? 'bg-blue-500/20 text-blue-400' :
                          user.role === 'retailer' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.kycStatus === 'verified' ? 'bg-green-500/20 text-green-400' :
                          user.kycStatus === 'submitted' ? 'bg-yellow-500/20 text-yellow-400' :
                          user.kycStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div className="bg-gray-800 rounded-xl p-6">
            {users.filter(u => u.kycStatus === 'submitted').length === 0 ? (
              <p className="text-gray-400 text-center py-8">No pending KYC submissions</p>
            ) : (
              <div className="space-y-4">
                {users.filter(u => u.kycStatus === 'submitted').map((user) => (
                  <div key={user.uid} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-semibold">{user.fullName}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          NIN: {user.nin || 'Not provided'}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          Submitted: {new Date(user.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleKycDecision(user.uid, true)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleKycDecision(user.uid, false)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            {withdrawals.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No pending withdrawals</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="text-left p-4 text-gray-300">User</th>
                      <th className="text-left p-4 text-gray-300">Amount</th>
                      <th className="text-left p-4 text-gray-300">Bank Details</th>
                      <th className="text-left p-4 text-gray-300">Date</th>
                      <th className="text-left p-4 text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((wd) => (
                      <tr key={wd.id} className="border-t border-gray-700">
                        <td className="p-4 text-white">{wd.userName}</td>
                        <td className="p-4 text-white font-semibold">₦{wd.amountNaira.toLocaleString()}</td>
                        <td className="p-4">
                          <p className="text-white text-sm">{wd.bankName}</p>
                          <p className="text-gray-400 text-sm">{wd.accountNumber}</p>
                          <p className="text-gray-500 text-xs">{wd.accountName}</p>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {new Date(wd.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleWithdrawalDecision(wd.id, true)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-center py-8">Listing management coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}