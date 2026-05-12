'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getIdToken } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { useAuth } from '@/lib/auth-context'
import { Icons } from '@/components/icons'

interface AdminUser {
  id: string
  fullName: string
  email: string
  role: string
  kycStatus: string
  is_admin: boolean
  createdAt: string
  nairaBalance: number
}

interface Stats {
  totalUsers: number
  totalProducers: number
  totalConsumers: number
  pendingKyc: number
}

async function getToken(): Promise<string | null> {
  try { return await getIdToken(auth.currentUser!) } catch { return null }
}

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [users, setUsers]       = useState<AdminUser[]>([])
  const [stats, setStats]       = useState<Stats>({ totalUsers: 0, totalProducers: 0, totalConsumers: 0, pendingKyc: 0 })
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'kyc'>('users')

  // ─── Auth guard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/signin'); return }
    if (profile !== null && !profile?.is_admin) { router.push('/dashboard') }
  }, [user, authLoading, profile, router])

  // ─── Fetch via API (Admin SDK bypasses Firestore rules) ───────────────────────
  const fetchData = useCallback(async () => {
    const token = await getToken()
    if (!token) return

    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (!data.success) throw new Error(data.error || 'Failed to load')

      setUsers(data.users)
      setStats(data.stats)
    } catch (err: any) {
      console.error('Admin fetch error:', err)
      setError(err.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (profile?.is_admin) fetchData()
  }, [profile, fetchData])

  // ─── Update helpers (all go through API, not client Firestore) ───────────────
  const patch = async (targetUid: string, payload: Record<string, any>) => {
    const token = await getToken()
    if (!token) return
    await fetch('/api/admin/users', {
      method:  'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ targetUid, ...payload }),
    })
    fetchData()
  }

  // ─── Render guards ────────────────────────────────────────────────────────────
  if (authLoading || (user && profile === undefined)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    )
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Icons.Lightning className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-gray-400 mt-2">You don&apos;t have admin permissions.</p>
          <Link href="/dashboard" className="inline-block mt-4 text-green-500 hover:underline">
            Back to Dashboard
          </Link>
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
          <Link href="/dashboard" className="text-gray-300 hover:text-green-500 text-sm transition">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-6 flex justify-between items-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={fetchData} className="text-sm text-red-400 underline">Retry</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users',  value: stats.totalUsers,     color: 'text-white' },
            { label: 'Producers',    value: stats.totalProducers, color: 'text-white' },
            { label: 'Consumers',    value: stats.totalConsumers, color: 'text-white' },
            { label: 'Pending KYC', value: stats.pendingKyc,     color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'users' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
          >
            All Users
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'kyc' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
          >
            KYC Pending
            {stats.pendingKyc > 0 && (
              <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                {stats.pendingKyc}
              </span>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500" />
          </div>
        ) : activeTab === 'users' ? (

          /* ── Users Table ─────────────────────────────────────────────────────── */
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            {users.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      {['User', 'Email', 'Role', 'KYC', 'Balance', 'Admin', 'Actions'].map(h => (
                        <th key={h} className="text-left p-3 text-gray-300 text-sm font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-gray-700 hover:bg-gray-750">
                        <td className="p-3 text-white text-sm">{u.fullName}</td>
                        <td className="p-3 text-gray-400 text-sm">{u.email}</td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={(e) => patch(u.id, { role: e.target.value })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="consumer">Consumer</option>
                            <option value="producer">Producer</option>
                            <option value="retailer">Retailer</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            u.kycStatus === 'verified'  ? 'bg-green-500/20 text-green-400' :
                            u.kycStatus === 'submitted' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {u.kycStatus}
                          </span>
                        </td>
                        <td className="p-3 text-white text-sm">
                          ₦{u.nairaBalance.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            u.is_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {u.is_admin ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 flex-wrap">
                            {!u.is_admin && (
                              <button
                                onClick={() => patch(u.id, { is_admin: true })}
                                className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 px-2 py-1 rounded text-xs transition"
                              >
                                Make Admin
                              </button>
                            )}
                            {u.kycStatus === 'submitted' && (
                              <>
                                <button
                                  onClick={() => patch(u.id, { kycStatus: 'verified' })}
                                  className="bg-green-600/20 hover:bg-green-600/40 text-green-400 px-2 py-1 rounded text-xs transition"
                                >
                                  Verify KYC
                                </button>
                                <button
                                  onClick={() => patch(u.id, { kycStatus: 'rejected' })}
                                  className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-2 py-1 rounded text-xs transition"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        ) : (

          /* ── KYC Tab ─────────────────────────────────────────────────────────── */
          <div className="space-y-4">
            {pendingKycUsers.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <p className="text-green-400 font-medium mb-1">All clear!</p>
                <p className="text-gray-400 text-sm">No pending KYC submissions</p>
              </div>
            ) : (
              pendingKycUsers.map((u) => (
                <div key={u.id} className="bg-gray-800 rounded-xl p-5 flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{u.fullName}</p>
                    <p className="text-gray-400 text-sm">{u.email}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => patch(u.id, { kycStatus: 'verified' })}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => patch(u.id, { kycStatus: 'rejected' })}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      Reject
                    </button>
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