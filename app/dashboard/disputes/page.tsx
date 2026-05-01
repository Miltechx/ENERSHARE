'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

export default function DisputesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

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
        transaction:transactions (*)
      `)
      .or(`raised_by.eq.${session?.user?.id},transaction.seller_id.eq.${session?.user?.id},transaction.buyer_id.eq.${session?.user?.id}`)

    setDisputes(data || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4">
        <Logo variant="compact" />
      </nav>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Dispute Center</h1>
        {disputes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Icons.Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">No active disputes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute: any) => (
              <div key={dispute.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Transaction #{dispute.transaction_id.slice(0, 8)}</p>
                    <p className="mt-2">{dispute.reason}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    dispute.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                    dispute.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {dispute.status}
                  </span>
                </div>
                {dispute.resolution && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold">Resolution:</p>
                    <p className="text-sm text-gray-600">{dispute.resolution}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
