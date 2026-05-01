'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'

interface DashboardData {
  wallet_balance: number
  demo_credits: number
  total_energy_sold: number
  total_earned: number
  active_listings: number
  recent_transactions: any[]
  meter_data: any
}

export default function Dashboard() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/auth/signin')
  }, [sessionStatus, router])

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const [walletRes, listingsRes, transactionsRes, meterRes] = await Promise.all([
        fetch('/api/user/wallet'),
        fetch('/api/energy/listings'),
        fetch('/api/user/transactions'),
        fetch('/api/meter/reading'),
      ])

      const wallet = await walletRes.json()
      const listings = await listingsRes.json()
      const transactions = await transactionsRes.json()
      const meter = await meterRes.json()

      // Calculate totals
      const soldTransactions = transactions.filter((t: any) => t.seller_id === session?.user?.id && t.tx_status === 'completed')
      const totalEnergySold = soldTransactions.reduce((sum: number, t: any) => sum + (t.amount_kwh || 0), 0)
      const totalEarned = soldTransactions.reduce((sum: number, t: any) => sum + (t.total_amount - (t.fee_ngn || 0)), 0)
      const activeListings = listings.filter((l: any) => l.listing_status === 'available').length
      const demoCredits = wallet.demo_credits || 5000
      const realBalance = wallet.balance_ngn || 0

      setData({
        wallet_balance: realBalance,
        demo_credits: demoCredits,
        total_energy_sold: totalEnergySold,
        total_earned: totalEarned,
        active_listings: activeListings,
        recent_transactions: transactions.slice(0, 5),
        meter_data: meter,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚡</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const totalBalance = data.wallet_balance + data.demo_credits

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo variant="compact" />
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-primary font-semibold border-b-2 border-primary pb-1">Dashboard</Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-primary transition">Marketplace</Link>
              <Link href="/dashboard/history" className="text-gray-600 hover:text-primary transition">History</Link>
              <Link href="/marketplace/sell" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm">
                + Sell Energy
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {session?.user?.email?.split('@')[0] || 'Energy Pro'}
          </h1>
          <p className="text-gray-500">Here's your energy ecosystem summary</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 text-sm">Total Balance</p>
                <p className="text-3xl font-bold mt-1">₦{totalBalance.toLocaleString()}</p>
              </div>
              <Icons.Wallet className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-green-100 text-xs mt-2">₦{data.demo_credits.toLocaleString()} demo • ₦{data.wallet_balance.toLocaleString()} real</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm">Energy Sold</p>
                <p className="text-3xl font-bold mt-1">{data.total_energy_sold} kWh</p>
              </div>
              <Icons.Lightning className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-blue-100 text-xs mt-2">₦{data.total_earned.toLocaleString()} earned</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-100 text-sm">Active Listings</p>
                <p className="text-3xl font-bold mt-1">{data.active_listings}</p>
              </div>
              <Icons.Trade className="w-8 h-8 opacity-80" />
            </div>
            <Link href="/marketplace/sell" className="text-yellow-100 text-xs hover:text-white transition">
              + Create new listing →
            </Link>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm">Carbon Saved</p>
                <p className="text-3xl font-bold mt-1">{data.meter_data?.carbon_saved_kg || 0} kg</p>
              </div>
              <Icons.Carbon className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-purple-100 text-xs mt-2">🌍 Equivalent to planting {Math.floor((data.meter_data?.carbon_saved_kg || 0) / 25)} trees</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Live Smart Meter</h3>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Real-time</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Current Output</p>
                <p className="text-2xl font-bold text-primary">{data.meter_data?.current_power_watts || 0} W</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Today's Generation</p>
                <p className="text-2xl font-bold text-primary">{data.meter_data?.daily_generation_kwh || 0} kWh</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Grid Status</p>
                <p className={`text-2xl font-bold ${data.meter_data?.grid_status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                  {data.meter_data?.grid_status === 'connected' ? 'ON' : 'OFF'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/marketplace/sell" className="flex items-center justify-between w-full bg-green-50 text-green-600 p-3 rounded-lg hover:bg-green-100 transition">
                <span>Sell Excess Energy</span>
                <Icons.ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/marketplace" className="flex items-center justify-between w-full bg-blue-50 text-blue-600 p-3 rounded-lg hover:bg-blue-100 transition">
                <span>Buy Energy</span>
                <Icons.ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          {data.recent_transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icons.Trade className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No transactions yet</p>
              <Link href="/marketplace" className="text-primary text-sm hover:underline mt-2 inline-block">
                Start trading →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recent_transactions.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center p-3 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.seller_id === session?.user?.id ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {tx.seller_id === session?.user?.id ? (
                        <Icons.Lightning className="w-5 h-5 text-green-600" />
                      ) : (
                        <Icons.Wallet className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {tx.seller_id === session?.user?.id ? 'Sold' : 'Bought'} energy
                      </p>
                      <p className="text-sm text-gray-500">
                        {tx.amount_kwh} kWh at ₦{tx.price_per_kwh_ngn}/kWh
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.seller_id === session?.user?.id ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.seller_id === session?.user?.id ? '+' : '-'}₦{tx.total_amount?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-400">{tx.createdAt ? new Date(tx.createdAt.toDate()).toLocaleDateString() : 'Just now'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/dashboard/history" className="block text-center text-primary text-sm mt-4 hover:underline">
            View all transactions →
          </Link>
        </div>
      </div>
    </div>
  )
}
