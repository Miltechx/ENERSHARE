'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    // AI price recommendation based on hour
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

    const amountNum = parseFloat(amount)
    const priceNum = parseFloat(price)

    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount')
      setLoading(false)
      return
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/energy/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_kwh: amountNum,
          price_per_kwh_ngn: priceNum,
          source_type: source,
          location: location || 'Lagos',
        }),
      })

      if (res.ok) {
        alert('✅ Energy listed successfully! Buyers can now purchase.')
        router.push('/marketplace')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to list energy')
      }
    } catch (error) {
      alert('Error creating listing')
    } finally {
      setLoading(false)
    }
  }

  // Safe calculation functions
  const getAmount = (): number => {
    const val = parseFloat(amount)
    return isNaN(val) ? 0 : val
  }

  const getPrice = (): number => {
    const val = parseFloat(price)
    return isNaN(val) ? 0 : val
  }

  const totalEarnings = getAmount() * getPrice()
  const platformFee = totalEarnings * 0.02
  const netEarnings = totalEarnings - platformFee

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl mr-2">⚡</Link>
              <Link href="/" className="font-bold text-xl text-gray-800">EnerShare</Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-green-600 transition">Dashboard</Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-green-600 transition">Marketplace</Link>
              <Link href="/marketplace/sell" className="text-green-600 font-semibold">Sell Energy</Link>
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
                    { id: 'solar', label: 'Solar', icon: '☀️' },
                    { id: 'generator', label: 'Generator', icon: '🔄' },
                    { id: 'grid', label: 'Grid', icon: '⚡' },
                    { id: 'battery', label: 'Battery', icon: '🔋' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSource(s.id)}
                      className={`flex flex-col items-center py-2 rounded-lg transition ${
                        source === s.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-xs mt-1">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount to Sell (kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 10.5"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Enter the amount of energy you want to sell</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price per kWh (₦)
                </label>
                <input
                  type="number"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 95"
                  required
                />
                {aiPrice && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">🤖</span>
                      <span className="text-sm text-gray-600">AI Recommended Price:</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-green-600">₦{aiPrice}/kWh</span>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location (City/Area)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Lekki, Lagos"
                />
                <p className="text-xs text-gray-400 mt-1">Buyers will see your location</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Listing...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>List Energy for Sale</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preview Sidebar */}
          <div>
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-6 text-white mb-6">
              <h3 className="font-bold text-lg mb-3">Listing Preview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="capitalize font-semibold">{source}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold">{getAmount()} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-semibold">₦{getPrice()}/kWh</span>
                </div>
                <div className="border-t border-white/20 my-2 pt-2"></div>
                <div className="flex justify-between">
                  <span>Total Earnings:</span>
                  <span className="font-bold">₦{totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs opacity-80">
                  <span>Platform Fee (2%):</span>
                  <span>₦{platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>You Receive:</span>
                  <span>₦{netEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-gray-800 mb-3">Market Tips</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Price 10-15% below grid rate for fast sales</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>List during evening hours when demand is highest</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Consistent listings build buyer trust</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Clean energy sources (solar) attract more buyers</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>💡 Pro Tip:</strong> Start with a competitive price to build your seller reputation. You can adjust prices later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
