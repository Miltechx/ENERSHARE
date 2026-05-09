'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { Icons } from '@/components/icons'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  kycStatus: string
  is_admin: boolean
  createdAt: string
  nairaBalance?: number
}

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducers: 0,
    totalConsumers: 0,
    pendingKyc: 0,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
    if (!authLoading && profile && !profile.is_admin) {
      router.push('/dashboard')
    }
  }, [user, authLoading, profile, router])

  useEffect(() => {
    if (profile?.is_admin) {
      fetchUsers()
      fetchStats()
    }
  }, [profile])

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersList: User[] = []
      
      for (const docSnap of usersSnapshot.docs) {
        const userData = docSnap.data()
        // Get wallet balance
        const walletRef = doc(db, 'wallets', docSnap.id)
        const walletSnap = await getDoc(walletRef)
        const walletData = walletSnap.data()
        
        usersList.push({
          id: docSnap.id,
          fullName: userData.fullName || '—',
          email: userData.email || '—',
          role: userData.role || 'consumer',
          kycStatus: userData.kycStatus || 'pending',
          is_admin: userData.is_admin || false,
          createdAt: userData.createdAt || new Date().toISOString(),
          nairaBalance: walletData?.nairaBalance || 0,
        })
      }
      setUsers(usersList)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersList = usersSnapshot.docs.map(doc => doc.data())
      
      setStats({
        totalUsers: usersSnapshot.size,
        totalProducers: usersList.filter(u => u.role === 'producer' || u.role === 'retailer').length,
        totalConsumers: usersList.filter(u => u.role === 'consumer').length,
        pendingKyc: usersList.filter(u => u.kycStatus === 'submitted').length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole })
      fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const updateKycStatus = async (userId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { kycStatus: status })
      fetchUsers()
      fetchStats()
    } catch (error) {
      console.error('Error updating KYC status:', error)
    }
  }

  const makeAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { is_admin: isAdmin })
      fetchUsers()
    } catch (error) {
      console.error('Error updating admin status:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Icons.Lightning className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-gray-400 mt-2">You don't have admin permissions.</p>
          <Link href="/dashboard" className="inline-block mt-4 text-green-500 hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const pendingKycUsers = users.filter(u => u.kycStatus === 'submitted')

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icons.Lightning className="w-8 h-8 text-green-500" />
            <span className="text-xl font-bold text-white">EnerShare Admin</span>
          </div>
          <Link href="/dashboard" className="text-gray-300 hover:text-green-500 transition">Back to Dashboard</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Producers</p>
            <p className="text-2xl font-bold text-white">{stats.totalProducers}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Consumers</p>
            <p className="text-2xl font-bold text-white">{stats.totalConsumers}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Pending KYC</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.pendingKyc}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-700 mb-6">
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'users' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}>All Users</button>
          <button onClick={() => setActiveTab('kyc')} className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'kyc' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}>KYC Pending {stats.pendingKyc > 0 && <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">{stats.pendingKyc}</span>}</button>
        </div>

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-3 text-gray-300">User</th>
                    <th className="text-left p-3 text-gray-300">Email</th>
                    <th className="text-left p-3 text-gray-300">Role</th>
                    <th className="text-left p-3 text-gray-300">KYC</th>
                    <th className="text-left p-3 text-gray-300">Balance</th>
                    <th className="text-left p-3 text-gray-300">Admin</th>
                    <th className="text-left p-3 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-gray-700">
                      <td className="p-3 text-white">{user.fullName}</td>
                      <td className="p-3 text-gray-400 text-sm">{user.email}</td>
                      <td className="p-3">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                        >
                          <option value="consumer">Consumer</option>
                          <option value="producer">Producer</option>
                          <option value="retailer">Retailer</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.kycStatus === 'verified' ? 'bg-green-500/20 text-green-400' :
                          user.kycStatus === 'submitted' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="p-3 text-white">₦{user.nairaBalance?.toLocaleString() || 0}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {user.is_admin ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {!user.is_admin && (
                            <button onClick={() => makeAdmin(user.id, true)} className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-2 py-1 rounded text-xs">Make Admin</button>
                          )}
                          {user.kycStatus === 'submitted' && (
                            <button onClick={() => updateKycStatus(user.id, 'verified')} className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-2 py-1 rounded text-xs">Verify KYC</button>
                          )}
                        </div>
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
          <div className="space-y-4">
            {pendingKycUsers.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <Icons.Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-400">No pending KYC submissions</p>
              </div>
            ) : (
              pendingKycUsers.map((user) => (
                <div key={user.id} className="bg-gray-800 rounded-xl p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold">{user.fullName}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateKycStatus(user.id, 'verified')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">Approve</button>
                      <button onClick={() => updateKycStatus(user.id, 'rejected')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">Reject</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}