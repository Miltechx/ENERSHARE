'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore'
import { Icons } from '@/components/icons'

interface Dispute {
  id: string
  transactionId: string
  raisedByUserId: string
  raisedByName: string
  againstUserId: string
  againstName: string
  type: string
  description: string
  status: string
  resolution?: string
  createdAt: any
}

export default function AdminDisputesPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [resolution, setResolution] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      fetchDisputes()
    }
  }, [profile])

  const fetchDisputes = async () => {
    try {
      const q = query(collection(db, 'disputes'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const disputesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dispute[]
      setDisputes(disputesData)
    } catch (error) {
      console.error('Error fetching disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateDisputeStatus = async (disputeId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'disputes', disputeId), {
        status,
        updatedAt: new Date().toISOString(),
      })
      fetchDisputes()
    } catch (error) {
      console.error('Error updating dispute:', error)
    }
  }

  const resolveDispute = async () => {
    if (!selectedDispute || !resolution.trim()) return
    setSubmitting(true)
    try {
      await updateDoc(doc(db, 'disputes', selectedDispute.id), {
        status: 'resolved',
        resolution: resolution,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      setSelectedDispute(null)
      setResolution('')
      fetchDisputes()
    } catch (error) {
      console.error('Error resolving dispute:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-yellow-500/20 text-yellow-400',
      under_review: 'bg-blue-500/20 text-blue-400',
      resolved: 'bg-green-500/20 text-green-400',
      dismissed: 'bg-red-500/20 text-red-400',
    }
    return styles[status] || 'bg-gray-500/20 text-gray-400'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (profile?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Dispute Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Disputes List */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-4">
            <div className="space-y-3">
              {disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  onClick={() => setSelectedDispute(dispute)}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    selectedDispute?.id === dispute.id
                      ? 'bg-gray-700 border border-green-500'
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">
                        {dispute.raisedByName} vs {dispute.againstName}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">{dispute.type.replace('_', ' ')}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(dispute.status)}`}>
                      {dispute.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {disputes.length === 0 && (
                <p className="text-gray-400 text-center py-8">No disputes</p>
              )}
            </div>
          </div>

          {/* Dispute Detail */}
          <div className="bg-gray-800 rounded-xl p-5">
            {selectedDispute ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-white">Dispute Details</h2>
                  <button onClick={() => setSelectedDispute(null)} className="text-gray-400">
                    <Icons.Close className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Transaction ID</p>
                    <p className="text-white text-sm font-mono">{selectedDispute.transactionId}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Raised By</p>
                    <p className="text-white">{selectedDispute.raisedByName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Against</p>
                    <p className="text-white">{selectedDispute.againstName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Issue Type</p>
                    <p className="text-white capitalize">{selectedDispute.type.replace('_', ' ')}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="text-gray-300 text-sm">{selectedDispute.description}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Resolution Note</p>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      placeholder="Enter resolution details..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <select
                      value={selectedDispute.status}
                      onChange={(e) => updateDisputeStatus(selectedDispute.id, e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                    <button
                      onClick={resolveDispute}
                      disabled={submitting}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                    >
                      {submitting ? '...' : 'Resolve'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Select a dispute to review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}