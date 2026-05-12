'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getIdToken } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { useAuth } from '@/lib/auth-context'
import { Icons } from '@/components/icons'

type Tab = 'users' | 'kyc' | 'transactions' | 'withdrawals' | 'revenue'

async function getToken() {
  try { return await getIdToken(auth.currentUser!) } catch { return null }
}

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab]   = useState<Tab>('users')
  const [users, setUsers]           = useState<any[]>([])
  const [transactions, setTxs]      = useState<any[]>([])
  const [withdrawals, setWds]       = useState<any[]>([])
  const [revenue, setRevenue]       = useState({ totalRevenue: 0, todayRevenue: 0 })
  const [stats, setStats]           = useState({ totalUsers: 0, totalProducers: 0, totalConsumers: 0, pendingKyc: 0 })
  const [txStats, setTxStats]       = useState({ totalVolume: 0, totalFees: 0 })
  const [wdStats, setWdStats]       = useState({ pendingCount: 0 })
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/signin'); return }
    if (profile !== null && !profile?.is_admin) router.push('/dashboard')
  }, [user, authLoading, profile, router])

  const fetchSection = useCallback(async (section: string) => {
    const token = await getToken()
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/admin/users?section=${section}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      if (section === 'users')        { setUsers(data.users); setStats(data.stats) }
      if (section === 'transactions') { setTxs(data.transactions); setTxStats({ totalVolume: data.totalVolume, totalFees: data.totalFees }) }
      if (section === 'withdrawals')  { setWds(data.withdrawals); setWdStats({ pendingCount: data.pendingCount }) }
      if (section === 'revenue')      { setRevenue({ totalRevenue: data.totalRevenue, todayRevenue: data.todayRevenue }) }
    } catch (err: any) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (profile?.is_admin) fetchSection('users')
  }, [profile, fetchSection])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    const sectionMap: Record<Tab, string> = {
      users: 'users', kyc: 'users',
      transactions: 'transactions',
      withdrawals: 'withdrawals',
      revenue: 'revenue',
    }
    fetchSection(sectionMap[tab])
  }

  const patch = async (body: Record<string, any>, refresh: string) => {
    const token = await getToken()
    if (!token) return
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    fetchSection(refresh)
  }

  if (authLoading || (user && profile === undefined)) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
    </div>
  }

  if (!profile?.is_admin) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <Icons.Lightning className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <Link href="/dashboard" className="text-green-500 hover:underline mt-4 inline-block">Back to Dashboard</Link>
      </div>
    </div>
  }

  const pendingKycUsers  = users.filter(u => u.kycStatus === 'submitted')
  const pendingWithdrawals = withdrawals.filter((w: any) => w.status === 'pending')

  const tabs = [
    { key: 'users',        label: 'Users',        badge: null },
    { key: 'kyc',          label: 'KYC',          badge: stats.pendingKyc || null },
    { key: 'transactions', label: 'Transactions',  badge: null },
    { key: 'withdrawals',  label: 'Withdrawals',   badge: wdStats.pendingCount || null },
    { key: 'revenue',      label: 'Revenue',       badge: null },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icons.Lightning className="w-7 h-7 text-green-500" />
            <span className="text-xl font-bold text-white">EnerShare Admin</span>
          </div>
          <Link href="/dashboard" className="text-gray-400 hover:text-green-500 text-sm transition">
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-6 flex justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => fetchSection('users')} className="text-red-400 text-sm underline">Retry</button>
          </div>
        )}

        {/* Top stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Users',      value: stats.totalUsers,          color: 'text-white' },
            { label: 'Producers',  value: stats.totalProducers,      color: 'text-blue-400' },
            { label: 'Volume',     value: `₦${(txStats.totalVolume / 1000).toFixed(0)}k`, color: 'text-green-400' },
            { label: 'Fees Earned',value: `₦${txStats.totalFees.toLocaleString()}`,       color: 'text-green-400' },
            { label: 'Pending KYC',value: stats.pendingKyc,          color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-700 mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key as Tab)}
              className={`px-4 py-2.5 text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === t.key
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t.label}
              {t.badge ? (
                <span className="bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500" />
          </div>
        ) : (
          <>
            {/* ── USERS TAB ──────────────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                {users.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">No users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-700">
                        <tr>{['User', 'Email', 'Role', 'KYC', 'Balance', 'Admin', 'Actions'].map(h => (
                          <th key={h} className="text-left p-3 text-gray-300 font-medium">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="border-t border-gray-700">
                            <td className="p-3 text-white">{u.fullName}</td>
                            <td className="p-3 text-gray-400">{u.email}</td>
                            <td className="p-3">
                              <select
                                value={u.role}
                                onChange={e => patch({ targetUid: u.id, role: e.target.value }, 'users')}
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
                              }`}>{u.kycStatus}</span>
                            </td>
                            <td className="p-3 text-white">₦{u.nairaBalance.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${u.is_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                {u.is_admin ? 'Admin' : 'No'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1 flex-wrap">
                                {!u.is_admin && (
                                  <button onClick={() => patch({ targetUid: u.id, is_admin: true }, 'users')}
                                    className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 px-2 py-1 rounded text-xs">
                                    Make Admin
                                  </button>
                                )}
                                {u.kycStatus === 'submitted' && (
                                  <button onClick={() => patch({ targetUid: u.id, kycStatus: 'verified' }, 'users')}
                                    className="bg-green-600/20 hover:bg-green-600/40 text-green-400 px-2 py-1 rounded text-xs">
                                    Verify KYC
                                  </button>
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
            )}

            {/* ── KYC TAB ────────────────────────────────────────────────────── */}
            {activeTab === 'kyc' && (
              <div className="space-y-4">
                {pendingKycUsers.length === 0 ? (
                  <div className="bg-gray-800 rounded-xl p-8 text-center">
                    <p className="text-green-400 font-medium">All clear — no pending KYC</p>
                  </div>
                ) : pendingKycUsers.map(u => (
                  <div key={u.id} className="bg-gray-800 rounded-xl p-5 flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{u.fullName}</p>
                      <p className="text-gray-400 text-sm">{u.email}</p>
                      <p className="text-gray-500 text-xs mt-1">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => patch({ targetUid: u.id, kycStatus: 'verified' }, 'users')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">Approve</button>
                      <button onClick={() => patch({ targetUid: u.id, kycStatus: 'rejected' }, 'users')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── TRANSACTIONS TAB ───────────────────────────────────────────── */}
            {activeTab === 'transactions' && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Total Volume</p>
                    <p className="text-2xl font-bold text-green-400">₦{txStats.totalVolume.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Platform Fees Collected</p>
                    <p className="text-2xl font-bold text-green-400">₦{txStats.totalFees.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  {transactions.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">No transactions yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-700">
                          <tr>{['Date', 'kWh', 'Total', 'Fee', 'Seller Earned', 'Status'].map(h => (
                            <th key={h} className="text-left p-3 text-gray-300 font-medium">{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx: any) => (
                            <tr key={tx.id} className="border-t border-gray-700">
                              <td className="p-3 text-gray-400 text-xs">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3 text-white">{tx.kwhAmount} kWh</td>
                              <td className="p-3 text-white">₦{tx.totalNaira?.toLocaleString()}</td>
                              <td className="p-3 text-green-400">₦{tx.platformFee?.toLocaleString()}</td>
                              <td className="p-3 text-blue-400">₦{tx.sellerEarns?.toLocaleString()}</td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── WITHDRAWALS TAB ────────────────────────────────────────────── */}
            {activeTab === 'withdrawals' && (
              <div className="space-y-4">
                {withdrawals.length === 0 ? (
                  <div className="bg-gray-800 rounded-xl p-8 text-center">
                    <p className="text-gray-400">No withdrawals yet</p>
                  </div>
                ) : withdrawals.map((w: any) => (
                  <div key={w.id} className="bg-gray-800 rounded-xl p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-semibold">₦{w.amountNaira?.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">{w.bankName} · {w.accountNumber}</p>
                        <p className="text-gray-500 text-xs mt-1">{w.accountName}</p>
                        <p className="text-gray-500 text-xs">{new Date(w.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          w.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          w.status === 'pending'   ? 'bg-yellow-500/20 text-yellow-400' :
                          w.status === 'approved'  ? 'bg-blue-500/20 text-blue-400' :
                                                     'bg-red-500/20 text-red-400'
                        }`}>{w.status}</span>
                        {w.status === 'pending' && (
                          <>
                            <button
                              onClick={() => patch({ withdrawalId: w.id, action: 'approve' }, 'withdrawals')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs"
                            >Approve</button>
                            <button
                              onClick={() => patch({ withdrawalId: w.id, action: 'reject' }, 'withdrawals')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs"
                            >Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── REVENUE TAB ────────────────────────────────────────────────── */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
                    <p className="text-green-100 text-sm">Total Platform Revenue</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      ₦{revenue.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-green-200 text-xs mt-1">All time · 2.5% transaction fees</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-6">
                    <p className="text-gray-400 text-sm">Today&apos;s Revenue</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">
                      ₦{revenue.todayRevenue.toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <p className="text-gray-400 text-sm text-center py-4">
                    Full revenue analytics with charts coming soon
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}