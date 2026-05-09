'use client'
import BackButton from '@/components/BackButton'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Icons } from '@/components/icons'

// Dynamically import recharts to avoid SSR issues
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })

import dynamic from 'next/dynamic'

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
  const [chartsReady, setChartsReady] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    setChartsReady(true)
  }, [])

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
        <BackButton />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
        <BackButton />
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

        {chartsReady && (
          <div className="bg-gray-800 rounded-xl p-5 mb-6">
            <h3 className="text-white font-semibold mb-4">Energy Consumption</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
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
          </div>
        )}

        {transactions.length === 0 && (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400">No transaction data available</p>
            <Link href="/marketplace" className="text-green-500 hover:underline mt-2 inline-block">
              Start trading
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}