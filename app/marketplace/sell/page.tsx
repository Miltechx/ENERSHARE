'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'

export default function SellEnergy() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [source, setSource] = useState('solar')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiPrice, setAiPrice] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    // Simulate AI price recommendation
    const hour = new Date().getHours()
    let recommended = 85
    if (hour >= 18 && hour <= 22) recommended = 105
    else if (hour >= 12 && hour <= 16) recommended = 95
    else if (hour >= 22 || hour <= 5) recommended = 75
    setAiPrice(recommended)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      alert(`✅ Energy listed! ${amount} kWh at ₦${price}/kWh`)
      router.push('/marketplace')
      setLoading(false)
    }, 1000)
  }

  const totalEarnings = parseFloat(amount) * parseFloat(price)
  const platformFee = totalEarnings * 0.02
  const netEarnings = totalEarnings - platformFee

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo variant="compact" />
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary transition">Dashboard</Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-primary transition">Marketplace</Link>
              <Link href="/marketplace/sell" className="text-primary font-semibold border-b-2 border-primary pb-1">Sell Energy</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">List Energy for Sale</h1>
          <p className="text-gray-500">Turn your surplus into income</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Energy Source</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'solar', label: 'Solar', icon: <Icons.Solar className="w-5 h-5" /> },
                    { id: 'generator', label: 'Generator', icon: <Icons.Generator className="w-5 h-5" /> },
                    { id: 'grid', label: 'Grid', icon: <Icons.Grid className="w-5 h-5" /> },
                    { id: 'battery', label: 'Battery', icon: <Icons.Battery className="w-5 h-5" /> },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSource(s.id)}
                      className={`flex flex-col items-center py-2 rounded-lg transition ${source === s.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {s.icon}
                      <span className="text-xs mt-1">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount to Sell (kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 10.5"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Your available surplus: ~18.5 kWh today</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price per kWh (₦)</label>
                <input
                  type="number"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 95"
                  required
                />
                {aiPrice && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Icons.Chart className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">AI Recommended Price:</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-primary">₦{aiPrice}/kWh</span>
                      <button
                        type="button"
                        onClick={() => setPrice(aiPrice.toString())}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location (City/Area)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Lekki, Lagos"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Listing...</span>
                  </>
                ) : (
                  <>
                    <Icons.Lightning className="w-5 h-5" />
                    <span>List Energy for Sale</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preview Sidebar */}
          <div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white mb-6">
              <h3 className="font-bold text-lg mb-3">Listing Preview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Source:</span><span className="capitalize font-semibold">{source}</span></div>
                <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">{amount || '0'} kWh</span></div>
                <div className="flex justify-between"><span>Price:</span><span className="font-semibold">₦{price || '0'}/kWh</span></div>
                <div className="border-t border-white/20 my-2 pt-2"></div>
                <div className="flex justify-between"><span>Total Earnings:</span><span className="font-bold">₦{totalEarnings.toLocaleString() || '0'}</span></div>
                <div className="flex justify-between text-xs opacity-80"><span>Platform Fee (2%):</span><span>₦{platformFee.toLocaleString() || '0'}</span></div>
                <div className="flex justify-between font-bold"><span>You Receive:</span><span>₦{netEarnings.toLocaleString() || '0'}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-gray-800 mb-3">Market Tips</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-2">
                  <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Price 10-15% below grid rate for fast sales</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>List during evening hours when demand is highest</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Consistent listings build buyer trust</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
