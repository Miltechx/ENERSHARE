'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

interface Transaction {
  id: string
  buyer_id: string
  seller_id: string
  buyer_name?: string
  seller_name?: string
  amount_kwh: number
  price_per_kwh_ngn: number
  total_amount: number
  fee_ngn: number
  tx_status: string
  createdAt: any
}

export default function History() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/auth/signin')
  }, [sessionStatus, router])

  useEffect(() => {
    if (session?.user) {
      fetchTransactions()
    }
  }, [session, filter])

  const fetchTransactions = async () => {
    if (!session?.user?.id) return

    try {
      const transactionsRef = collection(db, 'transactions')
      let q: any = query(transactionsRef, orderBy('createdAt', 'desc'))
      
      const snapshot = await getDocs(q)
      let allTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]
      
      // Filter client-side based on type
      if (filter === 'bought') {
        allTransactions = allTransactions.filter(t => t.buyer_id === session.user?.id)
      } else if (filter === 'sold') {
        allTransactions = allTransactions.filter(t => t.seller_id === session.user?.id)
      } else {
        allTransactions = allTransactions.filter(t => 
          t.buyer_id === session.user?.id || t.seller_id === session.user?.id
        )
      }
      
      setTransactions(allTransactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalEarned = transactions
    .filter(t => t.tx_status === 'completed' && t.seller_id === session?.user?.id)
    .reduce((sum, t) => sum + (t.total_amount - t.fee_ngn), 0)

  const totalSpent = transactions
    .filter(t => t.tx_status === 'completed' && t.buyer_id === session?.user?.id)
    .reduce((sum, t) => sum + t.total_amount, 0)

  const totalFees = transactions
    .filter(t => t.tx_status === 'completed')
    .reduce((sum, t) => sum + t.fee_ngn, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo variant="compact" />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary">Dashboard</Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-primary">Marketplace</Link>
              <Link href="/dashboard/history" className="text-primary font-semibold">History</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-sm">Total Earned</p>
            <p className="text-2xl font-bold text-green-600">₦{totalEarned.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-red-600">₦{totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-sm">Platform Fees</p>
            <p className="text-2xl font-bold text-blue-600">₦{totalFees.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          {['all', 'bought', 'sold'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition capitalize ${
                filter === f ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Icons.Trade className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No transactions yet</h3>
            <p className="text-gray-500">Start trading energy on the marketplace!</p>
            <Link href="/marketplace" className="inline-block mt-4 text-primary hover:underline">
              Go to Marketplace →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Type</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Price/kWh</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Total</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-sm font-semibold ${tx.buyer_id === session?.user?.id ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.buyer_id === session?.user?.id ? 'BOUGHT' : 'SOLD'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold">{tx.amount_kwh} kWh</td>
                      <td className="py-4 px-6 text-sm">₦{tx.price_per_kwh_ngn}</td>
                      <td className="py-4 px-6 text-sm font-semibold">₦{tx.total_amount.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tx.tx_status === 'completed' ? 'bg-green-100 text-green-700' :
                          tx.tx_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {tx.tx_status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
