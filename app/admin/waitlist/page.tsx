'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { Icons } from '@/components/icons'

interface WaitlistEntry {
  id: string
  fullName: string
  email: string
  phone: string
  city: string
  userType: string
  referredBy?: string
  createdAt: string
}

export default function AdminWaitlistPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [exporting, setExporting] = useState(false)

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
      fetchWaitlist()
    }
  }, [profile])

  const fetchWaitlist = async () => {
    try {
      const q = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const entriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WaitlistEntry[]
      setEntries(entriesData)
    } catch (error) {
      console.error('Error fetching waitlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEntry = async (entryId: string) => {
    if (confirm('Delete this waitlist entry?')) {
      try {
        await deleteDoc(doc(db, 'waitlist', entryId))
        fetchWaitlist()
      } catch (error) {
        console.error('Error deleting entry:', error)
      }
    }
  }

  const exportToCSV = () => {
    setExporting(true)
    const headers = ['Name', 'Email', 'Phone', 'City', 'User Type', 'Referred By', 'Date']
    const rows = entries.map(e => [
      e.fullName,
      e.email,
      e.phone || '',
      e.city || '',
      e.userType,
      e.referredBy || '',
      new Date(e.createdAt).toLocaleDateString(),
    ])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enershare-waitlist-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const filteredEntries = entries.filter(e =>
    e.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    e.email.toLowerCase().includes(filter.toLowerCase()) ||
    (e.city && e.city.toLowerCase().includes(filter.toLowerCase()))
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (profile?.role !== 'admin') return null

  const userTypeLabels: Record<string, string> = {
    solar_owner: 'Solar Home Owner',
    estate_manager: 'Estate Manager',
    sme_owner: 'SME Owner',
    microgrid_operator: 'Mini-Grid Operator',
    curious: 'Just Curious',
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Waitlist Management</h1>
          <div className="flex gap-3">
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              />
            </div>
            <button
              onClick={exportToCSV}
              disabled={exporting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition flex items-center gap-2"
            >
              <Icons.Chart className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 text-gray-300">Name</th>
                  <th className="text-left p-4 text-gray-300">Email</th>
                  <th className="text-left p-4 text-gray-300">Phone</th>
                  <th className="text-left p-4 text-gray-300">City</th>
                  <th className="text-left p-4 text-gray-300">User Type</th>
                  <th className="text-left p-4 text-gray-300">Referred By</th>
                  <th className="text-left p-4 text-gray-300">Date</th>
                  <th className="text-left p-4 text-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-700">
                    <td className="p-4 text-white">{entry.fullName}</td>
                    <td className="p-4 text-gray-400">{entry.email}</td>
                    <td className="p-4 text-gray-400">{entry.phone || '—'}</td>
                    <td className="p-4 text-gray-400">{entry.city || '—'}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                        {userTypeLabels[entry.userType] || entry.userType}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{entry.referredBy || '—'}</td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Icons.Close className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-right text-sm text-gray-500">
          Total: {filteredEntries.length} entries
        </div>
      </div>
    </div>
  )
}