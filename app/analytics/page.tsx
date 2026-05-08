'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs } from 'firebase/firestore'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Icons } from '@/components/icons'

interface Transaction {
  id: string
  buyerId: string
  sellerId: string
  kwhAmount: number
  totalNaira: number
  pricePerKwh: number
  energySource: string
  createdAt: any
}

export default function AnalyticsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user, timeRange])

  const fetchTransactions = async () => {
    if (!user) return

    const now = new Date()
    let startDate = new Date()
    if (timeRange === 'week') startDate.setDate(now.getDate() - 7)
    if (timeRange === 'month') startDate.setDate(now.getDate() - 30)
    if (timeRange === 'year') startDate.setFullYear(now.getFullYear() - 1)

    try {
      const q = query(
        collection(db, 'transactions'),
        where('buyerId', '==', user.uid)
      )
      const snapshot = await getDocs(q)
      const allTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]
      
      const filtered = allTransactions.filter(t => new Date(t.createdAt) >= startDate)
      setTransactions(filtered)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data
  const weeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const data: Record<string, { day: string; kwh: number; naira: number }> = {}
    days.forEach(day => { data[day] = { day, kwh: 0, naira: 0 } })

    transactions.forEach(t => {
      const date = new Date(t.createdAt)
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]
      if (data[dayName]) {
        data[dayName].kwh += t.kwhAmount || 0
        data[dayName].naira += t.totalNaira || 0
      }
    })
    return Object.values(data)
  }

  const monthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data: Record<string, { month: string; kwh: number; naira: number }> = {}
    months.forEach(month => { data[month] = { month, kwh: 0, naira: 0 } })

    transactions.forEach(t => {
      const date = new Date(t.createdAt)
      const monthName = months[date.getMonth()]
      if (data[monthName]) {
        data[monthName].kwh += t.kwhAmount || 0
        data[monthName].naira += t.totalNaira || 0
      }
    })
    return Object.values(data)
  }

  const sourceData = () => {
    const sources: Record<string, number> = {}
    transactions.forEach(t => {
      const source = t.energySource || 'other'
      sources[source] = (sources[source] || 0) + (t.kwhAmount || 0)
    })
    return Object.entries(sources).map(([name, value]) => ({ name, value }))
  }

  const totalKwh = transactions.reduce((sum, t) => sum + (t.kwhAmount || 0), 0)
  const totalSpent = transactions.reduce((sum, t) => sum + (t.totalNaira || 0), 0)
  const avgPrice = totalKwh > 0 ? totalSpent / totalKwh : 0

  const COLORS = ['#00FF85', '#F5A623', '#FF4D4D', '#00B0FF', '#8B9EB7']

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  const isProducer = profile?.role === 'producer' || profile?.role === 'retailer'

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Energy Analytics</h1>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  timeRange === range
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {range === 'week' ? 'Weekly' : range === 'month' ? 'Monthly' : 'Yearly'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Icons.Lightning className="w-5 h-5" />
              <span>Total Energy</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalKwh.toFixed(1)} kWh</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Icons.Wallet className="w-5 h-5" />
              <span>Total Spent</span>
            </div>
            <p className="text-2xl font-bold text-white">₦{totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Icons.Chart className="w-5 h-5" />
              <span>Average Price</span>
            </div>
            <p className={`text-2xl font-bold ${avgPrice < 100 ? 'text-green-500' : 'text-white'}`}>
              ₦{avgPrice.toFixed(2)}/kWh
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Energy Consumption</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeRange === 'month' ? monthlyData() : weeklyData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey={timeRange === 'month' ? 'month' : 'day'} stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Legend />
                <Bar dataKey="kwh" name="kWh" fill="#00FF85" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Spending Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeRange === 'month' ? monthlyData() : weeklyData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey={timeRange === 'month' ? 'month' : 'day'} stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Legend />
                <Line type="monotone" dataKey="naira" name="Amount (₦)" stroke="#F5A623" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Energy Source Breakdown</h3>
            {sourceData().length === 0 ? (
              <p className="text-gray-400 text-center py-12">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sourceData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sourceData().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    formatter={(value) => `${(value as number).toFixed(1)} kWh`}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Insights</h3>
            <div className="space-y-4">
              {avgPrice < 100 && (
                <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Icons.Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Great savings!</p>
                    <p className="text-gray-400 text-xs">
                      You're paying below the market average of ₦125/kWh
                    </p>
                  </div>
                </div>
              )}
              {transactions.length === 0 && (
                <p className="text-gray-400 text-center py-8">No transaction data available</p>
              )}
              {transactions.length > 0 && (
                <div className="text-center text-gray-400 text-sm">
                  <p>Track your energy consumption and spending over time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}