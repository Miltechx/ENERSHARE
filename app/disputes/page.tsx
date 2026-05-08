'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { Icons } from '@/components/icons'

interface Dispute {
  id: string
  transactionId: string
  raisedByName: string
  againstName: string
  type: string
  status: string
  description: string
  resolution?: string
  createdAt: any
}

export default function DisputesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchDisputes()
    }
  }, [user])

  const fetchDisputes = async () => {
    if (!user) return
    try {
      const q = query(
        collection(db, 'disputes'),
        where('raisedByUserId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const disputesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dispute[]
      setDisputes(disputesData)
    } catch (error) {
      console.error('Error fetching disputes:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Disputes</h1>
        <p className="text-gray-400 mb-6">Track and manage your support tickets</p>

        {disputes.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Icons.Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-400">No disputes filed</p>
            <p className="text-sm text-gray-500 mt-2">
              If you have an issue with a transaction, you can report it from your transaction history
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div key={dispute.id} className="bg-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-medium">Transaction #{dispute.transactionId.slice(0, 8)}</p>
                    <p className="text-sm text-gray-400 mt-1">Against {dispute.againstName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(dispute.status)}`}>
                    {dispute.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{dispute.description}</p>
                {dispute.resolution && (
                  <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-400">Resolution</p>
                    <p className="text-sm text-gray-300">{dispute.resolution}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3">
                  Filed {new Date(dispute.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}