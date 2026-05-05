'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore'

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

interface User {
  id: string
  email: string
  full_name: string
  phone: string
  balance_ngn: number
  demo_credits: number
  is_verified: boolean
  is_admin: boolean
  created_at: string
  total_energy_sold: number
  total_earned: number
}

interface Transaction {
  id: string
  buyer_id: string
  seller_id: string
  buyer_name: string
  seller_name: string
  amount_kwh: number
  price_per_kwh_ngn: number
  total_amount: number
  fee_ngn: number
  tx_status: string
  created_at: any
}

interface Withdrawal {
  id: string
  user_id: string
  user_name: string
  amount: number
  account_name: string
  account_number: string
  bank_name: string
  status: string
  created_at: any
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  // Check if user is admin
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
        fetchAllData()
      } else {
        router.push('/dashboard')
      }
      setLoading(false)
    }

    if (session?.user) {
      checkAdmin()
    }
  }, [session])

  const fetchAllData = async () => {
    await Promise.all([
      fetchStats(),
      fetchUsers(),
      fetchTransactions(),
      fetchWithdrawals(),
    ])
  }

  const fetchStats = async () => {
    try {
      // Get users count
      const usersSnapshot = await getDocs(collection(db, 'profiles'))
      const totalUsers = usersSnapshot.size

      // Get transactions
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'))
      const transactionsData = transactionsSnapshot.docs.map(doc => doc.data())
      const totalTransactions = transactionsData.length
      const totalVolume = transactionsData.reduce((sum, t) => sum + (t.total_amount || 0), 0)
      const totalFees = transactionsData.reduce((sum, t) => sum + (t.fee_ngn || 0), 0)

      // Get active listings
      const listingsQuery = query(collection(db, 'energy_listings'), where('listing_status', '==', 'available'))
      const listingsSnapshot = await getDocs(listingsQuery)
      const activeListings = listingsSnapshot.size

      // Get pending withdrawals
      const withdrawalsQuery = query(collection(db, 'withdrawals'), where('status', '==', 'pending'))
      const withdrawalsSnapshot = await getDocs(withdrawalsQuery)
      const pendingWithdrawals = withdrawalsSnapshot.size

      // Get pending KYC
      const kycQuery = query(collection(db, 'kyc_submissions'), where('status', '==', 'pending'))
      const kycSnapshot = await getDocs(kycQuery)
      const pendingKYC = kycSnapshot.size

      // Get total referrals
      const referralsSnapshot = await getDocs(collection(db, 'referrals'))
      const totalReferrals = referralsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().total_referrals || 0), 0)

      setStats({
        totalUsers,
        totalTransactions,
        totalVolume,
        totalFees,
        activeListings,
        pendingWithdrawals,
        pendingKYC,
        totalReferrals,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'profiles'))
      const usersData = await Promise.all(
        usersSnapshot.docs.map(async (doc) => {
          const userData = doc.data()
          const walletRef = doc(db, 'wallets', doc.id)
          const walletSnap = await getDoc(walletRef)
          const walletData = walletSnap.data()

          // Get user's sold energy
          const soldQuery = query(collection(db, 'transactions'), where('seller_id', '==', doc.id), where('tx_status', '==', 'completed'))
          const soldSnapshot = await getDocs(soldQuery)
          const totalEnergySold = soldSnapshot.docs.reduce((sum, t) => sum + (t.data().amount_kwh || 0), 0)
          const totalEarned = soldSnapshot.docs.reduce((sum, t) => sum + ((t.data().total_amount || 0) - (t.data().fee_ngn || 0)), 0)

          return {
            id: doc.id,
            email: userData.email || '',
            full_name: userData.full_name || '',
            phone: userData.phone || '',
            balance_ngn: walletData?.balance_ngn || 0,
            demo_credits: walletData?.demo_credits || 0,
            is_verified: userData.is_verified || false,
            is_admin: userData.is_admin || false,
            created_at: userData.created_at || new Date().toISOString(),
            total_energy_sold: totalEnergySold,
            total_earned: totalEarned,
          }
        })
      )
      setUsers(usersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const transactionsQuery = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(100))
      const transactionsSnapshot = await getDocs(transactionsQuery)
      const transactionsData = await Promise.all(
        transactionsSnapshot.docs.map(async (doc) => {
          const data = doc.data()
          
          // Get buyer name
          const buyerRef = doc(db, 'profiles', data.buyer_id)
          const buyerSnap = await getDoc(buyerRef)
          
          // Get seller name
          const sellerRef = doc(db, 'profiles', data.seller_id)
          const sellerSnap = await getDoc(sellerRef)

          return {
            id: doc.id,
            ...data,
            buyer_name: buyerSnap.data()?.full_name || data.buyer_id.slice(0, 8),
            seller_name: sellerSnap.data()?.full_name || data.seller_id.slice(0, 8),
          }
        })
      )
      setTransactions(transactionsData as Transaction[])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const fetchWithdrawals = async () => {
    try {
      const withdrawalsQuery = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'))
      const withdrawalsSnapshot = await getDocs(withdrawalsQuery)
      const withdrawalsData = await Promise.all(
        withdrawalsSnapshot.docs.map(async (doc) => {
          const data = doc.data()
          
          // Get user name
          const userRef = doc(db, 'profiles', data.user_id)
          const userSnap = await getDoc(userRef)

          return {
            id: doc.id,
            ...data,
            user_name: userSnap.data()?.full_name || data.user_id.slice(0, 8),
          }
        })
      )
      setWithdrawals(withdrawalsData as Withdrawal[])
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
    }
  }

  const approveUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'profiles', userId)
      await updateDoc(userRef, { is_verified: true })
      fetchUsers()
      alert('User verified successfully')
    } catch (error) {
      alert('Failed to verify user')
    }
  }

  const makeAdmin = async (userId: string) => {
    try {
      const userRef = doc(db, 'profiles', userId)
      await updateDoc(userRef, { is_admin: true })
      fetchUsers()
      alert('Admin status granted')
    } catch (error) {
      alert('Failed to make admin')
    }
  }

  const approveWithdrawal = async (withdrawalId: string) => {
    try {
      const withdrawalRef = doc(db, 'withdrawals', withdrawalId)
      await updateDoc(withdrawalRef, { status: 'approved', approvedAt: new Date().toISOString() })
      fetchWithdrawals()
      fetchStats()
      alert('Withdrawal approved')
    } catch (error) {
      alert('Failed to approve withdrawal')
    }
  }

  const approveKYC = async (userId: string) => {
    try {
      const kycQuery = query(collection(db, 'kyc_submissions'), where('user_id', '==', userId))
      const kycSnapshot = await getDocs(kycQuery)
      
      if (!kycSnapshot.empty) {
        const kycDoc = kycSnapshot.docs[0]
        await updateDoc(kycDoc.ref, { status: 'approved', reviewedAt: new Date().toISOString() })
      }
      
      const userRef = doc(db, 'profiles', userId)
      await updateDoc(userRef, { is_verified: true })
      
      fetchStats()
      alert('KYC approved')
    } catch (error) {
      alert('Failed to approve KYC')
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
          <p className="text-gray-500 mt-2">You don't have admin permissions.</p>
          <Link href="/dashboard" className="inline-block mt-4 text-primary hover:underline">
            Back to Dashboard →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">⚡</span>
              <span className="font-bold text-xl">EnerShare Admin</span>
              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Production</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary">
                User Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b overflow-x-auto">
          {['overview', 'users', 'transactions', 'withdrawals', 'kyc'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 capitalize font-semibold transition whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'withdrawals' && stats?.pendingWithdrawals > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingWithdrawals}
                </span>
              )}
              {tab === 'kyc' && stats?.pendingKYC > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingKYC}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-500 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalTransactions.toLocaleString()}</p>
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
                <p className="text-3xl font-bold text-purple-600">{stats.activeListings}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-500 text-sm">Pending Withdrawals</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingWithdrawals}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-500 text-sm">Pending KYC</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingKYC}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-500 text-sm">Total Referrals</p>
                <p className="text-3xl font-bold text-teal-600">{stats.totalReferrals}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Balance</th>
                    <th className="text-left py-3 px-4">Energy Sold</th>
                    <th className="text-left py-3 px-4">Earned</th>
                    <th className="text-left py-3 px-4">Verified</th>
                    <th className="text-left py-3 px-4">Admin</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{user.full_name || '—'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 font-semibold">₦{user.balance_ngn.toLocaleString()}</td>
                      <td className="py-3 px-4">{user.total_energy_sold.toFixed(1)} kWh</td>
                      <td className="py-3 px-4">₦{user.total_earned.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {user.is_verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 space-x-2">
                        {!user.is_verified && (
                          <button
                            onClick={() => approveUser(user.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                          >
                            Verify
                          </button>
                        )}
                        {!user.is_admin && (
                          <button
                            onClick={() => makeAdmin(user.id)}
                            className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                          >
                            Make Admin
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

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Buyer</th>
                    <th className="text-left py-3 px-4">Seller</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Fee</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {tx.created_at?.toDate?.().toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="py-3 px-4">{tx.buyer_name}</td>
                      <td className="py-3 px-4">{tx.seller_name}</td>
                      <td className="py-3 px-4">{tx.amount_kwh} kWh</td>
                      <td className="py-3 px-4">₦{tx.price_per_kwh_ngn}</td>
                      <td className="py-3 px-4 font-semibold">₦{tx.total_amount.toLocaleString()}</td>
                      <td className="py-3 px-4">₦{tx.fee_ngn.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tx.tx_status === 'completed' ? 'bg-green-100 text-green-700' :
                          tx.tx_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {tx.tx_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No transactions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Bank Account</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((wd) => (
                    <tr key={wd.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {wd.created_at?.toDate?.().toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="py-3 px-4">{wd.user_name}</td>
                      <td className="py-3 px-4 font-semibold">₦{wd.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div>{wd.account_name}</div>
                          <div className="text-gray-500 text-xs">{wd.account_number} ({wd.bank_name})</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          wd.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          wd.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {wd.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {wd.status === 'pending' && (
                          <button
                            onClick={() => approveWithdrawal(wd.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No withdrawal requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">NIN</th>
                    <th className="text-left py-3 px-4">BVN</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No pending KYC submissions
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}