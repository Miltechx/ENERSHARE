'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface DashboardData {
  balance: number
  totalSold: number
  totalBought: number
  totalEarned: number
  totalSpent: number
  activeListings: number
  recentTransactions: any[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const [walletRes, listingsRes, transactionsRes] = await Promise.all([
        fetch('/api/user/wallet'),
        fetch('/api/energy/listings'),
        fetch('/api/user/transactions'),
      ])

      const wallet = await walletRes.json()
      const listings = await listingsRes.json()
      const transactions = await transactionsRes.json()

      const userTransactions = transactions.filter(
        (t: any) => t.buyer_id === session?.user?.id || t.seller_id === session?.user?.id
      )

      const soldTransactions = userTransactions.filter(
        (t: any) => t.seller_id === session?.user?.id && t.tx_status === 'completed'
      )
      const boughtTransactions = userTransactions.filter(
        (t: any) => t.buyer_id === session?.user?.id && t.tx_status === 'completed'
      )

      const totalSold = soldTransactions.reduce((sum: number, t: any) => sum + t.amount_kwh, 0)
      const totalBought = boughtTransactions.reduce((sum: number, t: any) => sum + t.amount_kwh, 0)
      const totalEarned = soldTransactions.reduce((sum: number, t: any) => sum + (t.total_amount - t.fee_ngn), 0)
      const totalSpent = boughtTransactions.reduce((sum: number, t: any) => sum + t.total_amount, 0)

      const activeListings = listings.filter((l: any) => l.listing_status === 'available' && l.seller_id === session?.user?.id).length

      setData({
        balance: wallet.balance_ngn || 0,
        totalSold,
        totalBought,
        totalEarned,
        totalSpent,
        activeListings,
        recentTransactions: userTransactions.slice(0, 5),
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚡</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Energy Generated (kWh)',
        data: [12, 14, 11, 13, 15, 18, 16],
        borderColor: '#00C853',
        backgroundColor: 'rgba(0, 200, 83, 0.1)',
        fill: true,
      },
      {
        label: 'Energy Consumed (kWh)',
        data: [10, 11, 9, 12, 13, 14, 12],
        borderColor: '#FFD600',
        backgroundColor: 'rgba(255, 214, 0, 0.1)',
        fill: true,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-2xl font-bold text-green-600">⚡ EnerShare</span>
          <div className="flex space-x-6">
            <Link href="/dashboard" className="text-green-600 font-semibold">Dashboard</Link>
            <Link href="/marketplace" className="text-gray-600 hover:text-green-600">Marketplace</Link>
            <Link href="/marketplace/sell" className="bg-green-600 text-white px-4 py-2 rounded-lg">Sell Energy</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {session?.user?.email?.split('@')[0]}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <p className="text-green-100">Wallet Balance</p>
            <p className="text-3xl font-bold">₦{data?.balance.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-gray-500">Energy Sold</p>
            <p className="text-2xl font-bold text-green-600">{data?.totalSold} kWh</p>
            <p className="text-sm text-gray-400">₦{data?.totalEarned.toLocaleString()} earned</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-gray-500">Energy Bought</p>
            <p className="text-2xl font-bold text-blue-600">{data?.totalBought} kWh</p>
            <p className="text-sm text-gray-400">₦{data?.totalSpent.toLocaleString()} spent</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-gray-500">Active Listings</p>
            <p className="text-2xl font-bold text-purple-600">{data?.activeListings}</p>
            <Link href="/marketplace/sell" className="text-sm text-green-600 hover:underline">+ Create new</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-gray-800 mb-4">Energy Trends</h3>
            <Line data={chartData} options={{ responsive: true }} />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
            {data?.recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {data?.recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 border-b">
                    <div>
                      <p className="font-medium">
                        {tx.buyer_id === session?.user?.id ? 'Bought' : 'Sold'} {tx.amount_kwh} kWh
                      </p>
                      <p className="text-sm text-gray-500">{new Date(tx.createdAt?.toDate()).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-bold ${tx.buyer_id === session?.user?.id ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.buyer_id === session?.user?.id ? '-' : '+'}₦{tx.total_amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/marketplace" className="bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700">
            Buy Energy
          </Link>
          <Link href="/marketplace/sell" className="border-2 border-green-600 text-green-600 text-center py-3 rounded-lg font-semibold hover:bg-green-50">
            Sell Energy
          </Link>
        </div>
      </div>
    </div>
  )
}