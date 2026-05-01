'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'

interface DashboardData {
  wallet_balance: number
  total_energy_sold: number
  total_energy_bought: number
  carbon_saved: number
  active_listings: number
  recent_transactions: any[]
  meter_reading: {
    current_power: number
    today_generation: number
    battery_level: number
  }
  price_trend: number[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      // Simulate real-time data for demo
      const mockData: DashboardData = {
        wallet_balance: 12450,
        total_energy_sold: 342,
        total_energy_bought: 156,
        carbon_saved: 187,
        active_listings: 3,
        recent_transactions: [
          { id: 1, type: 'sold', amount: 12, price: 95, date: '2024-01-15', to: 'Oluwaseun A.' },
          { id: 2, type: 'bought', amount: 8, price: 88, date: '2024-01-14', from: 'Chidi N.' },
          { id: 3, type: 'sold', amount: 15, price: 92, date: '2024-01-13', to: 'Amara O.' },
        ],
        meter_reading: {
          current_power: 2450,
          today_generation: 18.5,
          battery_level: 76,
        },
        price_trend: [85, 88, 92, 90, 95, 94, 98],
      }
      setData(mockData)
      setLoading(false)
    }
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚡</div>
          <p className="text-gray-500">Loading your energy dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
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
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {session?.user?.email?.split('@')[0] || 'Energy Pro'}! 👋
          </h1>
          <p className="text-gray-500">Here's what's happening with your energy assets today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 text-sm">Wallet Balance</p>
                <p className="text-3xl font-bold mt-1">₦{data?.wallet_balance.toLocaleString()}</p>
              </div>
              <Icons.Wallet className="w-8 h-8 opacity-80" />
            </div>
            <button className="mt-4 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 text-sm transition">
              + Add Funds
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm">Energy Sold</p>
                <p className="text-3xl font-bold mt-1">{data?.total_energy_sold} kWh</p>
              </div>
              <Icons.Lightning className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-blue-100 text-sm mt-2">₦{(data?.total_energy_sold || 0) * 92} earned</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-100 text-sm">Current Rate</p>
                <p className="text-3xl font-bold mt-1">₦94/kWh</p>
              </div>
              <Icons.Chart className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-yellow-100 text-sm mt-2">↑ 3% from yesterday</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm">Carbon Saved</p>
                <p className="text-3xl font-bold mt-1">{data?.carbon_saved} kg</p>
              </div>
              <Icons.Carbon className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-purple-100 text-sm mt-2">🌍 Equivalent to planting 8 trees</p>
          </div>
        </div>

        {/* Live Meter Reading */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Live Smart Meter Reading</h3>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Real-time</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Current Output</p>
                <p className="text-2xl font-bold text-primary">{data?.meter_reading.current_power} W</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Today's Generation</p>
                <p className="text-2xl font-bold text-primary">{data?.meter_reading.today_generation} kWh</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Battery Level</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: `${data?.meter_reading.battery_level}%` }}></div>
                  </div>
                  <span className="font-bold">{data?.meter_reading.battery_level}%</span>
                </div>
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
              <button className="flex items-center justify-between w-full bg-purple-50 text-purple-600 p-3 rounded-lg hover:bg-purple-100 transition">
                <span>View Smart Meter</span>
                <Icons.ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Listings */}
        {data?.active_listings && data.active_listings > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Active Listings</h3>
            <div className="space-y-3">
              {[1, 2, 3].slice(0, data.active_listings).map((i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{10 + i * 5} kWh available</p>
                    <p className="text-sm text-gray-500">₦{90 + i * 2}/kWh</p>
                  </div>
                  <button className="text-red-500 text-sm">Cancel</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          {data?.recent_transactions.length ? (
            <div className="space-y-3">
              {data.recent_transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-3 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'sold' ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {tx.type === 'sold' ? <Icons.Lightning className="w-5 h-5 text-green-600" /> : <Icons.Wallet className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {tx.type === 'sold' ? `Sold to ${tx.to}` : `Bought from ${tx.from}`}
                      </p>
                      <p className="text-sm text-gray-500">{tx.amount} kWh at ₦{tx.price}/kWh</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'sold' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'sold' ? '+' : '-'}₦{tx.amount * tx.price}
                    </p>
                    <p className="text-xs text-gray-400">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No transactions yet. Start trading!</div>
          )}
          <Link href="/dashboard/history" className="block text-center text-primary text-sm mt-4 hover:underline">
            View All Transactions →
          </Link>
        </div>
      </div>
    </div>
  )
}
