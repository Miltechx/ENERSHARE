'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

interface Dispute {
  id: string
  transaction_id: string
  raised_by: string
  reason: string
  evidence: string | null
  dispute_status: string
  resolution: string | null
  created_at: string
  resolved_at: string | null
  transaction?: {
    id: string
    amount_kwh: number
    total_amount: number
    buyer_id: string
    seller_id: string
  }
}

export default function DisputesPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/auth/signin')
  }, [sessionStatus, router])

  useEffect(() => {
    if (session?.user) {
      fetchDisputes()
    }
  }, [session])

  const fetchDisputes = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('disputes')
      .select(`
        *,
        transaction:transactions (
          id,
          amount_kwh,
          total_amount,
          buyer_id,
          seller_id
        )
      `)
      .or(`raised_by.eq.${session?.user?.id},transaction.seller_id.eq.${session?.user?.id},transaction.buyer_id.eq.${session?.user?.id}`)

    setDisputes(data as Dispute[] || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <Logo variant="compact" />
          <Link href="/dashboard" className="text-gray-600">Back to Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Dispute Center</h1>

        {disputes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Icons.Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">No active disputes</p>
            <Link href="/marketplace" className="inline-block mt-4 text-primary hover:underline">
              Back to Marketplace →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div key={dispute.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      Transaction #{dispute.transaction_id?.slice(0, 8) || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Amount: {dispute.transaction?.amount_kwh || 0} kWh · ₦{dispute.transaction?.total_amount?.toLocaleString() || 0}
                    </p>
                    <p className="mt-3 font-medium">{dispute.reason}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    dispute.dispute_status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                    dispute.dispute_status === 'resolved' ? 'bg-green-100 text-green-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {dispute.dispute_status || 'open'}
                  </span>
                </div>

                {dispute.resolution && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold">Resolution:</p>
                    <p className="text-sm text-gray-600">{dispute.resolution}</p>
                  </div>
                )}

                <div className="mt-4 text-right">
                  <p className="text-xs text-gray-400">
                    Filed: {new Date(dispute.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
