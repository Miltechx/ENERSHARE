'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'

interface Listing {
  id: string
  seller_name: string
  source_type: string
  amount_kwh: number
  price_per_kwh: number
  total_price: number
  location: string
  created_at: string
}

export default function Marketplace() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [buying, setBuying] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    // Mock listings data for demo
    const mockListings: Listing[] = [
      { id: '1', seller_name: 'Oluwaseun A.', source_type: 'solar', amount_kwh: 25, price_per_kwh: 85, total_price: 2125, location: 'Lekki, Lagos', created_at: '2024-01-15T10:00:00Z' },
      { id: '2', seller_name: 'Chidi N.', source_type: 'solar', amount_kwh: 18, price_per_kwh: 90, total_price: 1620, location: 'Victoria Island, Lagos', created_at: '2024-01-15T09:30:00Z' },
      { id: '3', seller_name: 'Amara O.', source_type: 'generator', amount_kwh: 12, price_per_kwh: 180, total_price: 2160, location: 'GRA, Lagos', created_at: '2024-01-15T08:00:00Z' },
      { id: '4', seller_name: 'Bola K.', source_type: 'solar', amount_kwh: 30, price_per_kwh: 82, total_price: 2460, location: 'Ajah, Lagos', created_at: '2024-01-14T20:00:00Z' },
      { id: '5', seller_name: 'Tunde A.', source_type: 'battery', amount_kwh: 8, price_per_kwh: 75, total_price: 600, location: 'Ikoyi, Lagos', created_at: '2024-01-14T15:00:00Z' },
    ]
    setListings(mockListings)
    setLoading(false)
  }, [])

  const handleBuy = async (listingId: string) => {
    setBuying(listingId)
    // Simulate purchase
    setTimeout(() => {
      alert('Purchase successful! Energy credits added to your account.')
      setListings(listings.filter(l => l.id !== listingId))
      setBuying(null)
    }, 1000)
  }

  const filteredListings = filter === 'all' ? listings : listings.filter(l => l.source_type === filter)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo variant="compact" />
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary transition">Dashboard</Link>
              <Link href="/marketplace" className="text-primary font-semibold border-b-2 border-primary pb-1">Marketplace</Link>
              <Link href="/marketplace/sell" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm">
                + Sell Energy
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with AI Alert */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-8 border border-blue-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Icons.Chart className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-gray-500">AI Market Insight</p>
                <p className="text-lg font-bold text-gray-800">Prices expected to rise 5-8% this evening</p>
              </div>
            </div>
            <div className="flex space-x-4 text-sm">
              <div><span className="text-gray-500">Current Avg:</span> <span className="font-semibold">₦94/kWh</span></div>
              <div><span className="text-gray-500">24h Change:</span> <span className="font-semibold text-green-600">↑ ₦3</span></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Energy Marketplace</h1>
          <div className="flex space-x-2">
            {['all', 'solar', 'generator', 'grid', 'battery'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition capitalize ${filter === f ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                {f === 'all' ? 'All Sources' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Available Energy</p>
            <p className="text-xl font-bold text-primary">{filteredListings.reduce((sum, l) => sum + l.amount_kwh, 0)} kWh</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Active Sellers</p>
            <p className="text-xl font-bold text-primary">{filteredListings.length}</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Lowest Price</p>
            <p className="text-xl font-bold text-primary">₦{Math.min(...filteredListings.map(l => l.price_per_kwh), 0)}/kWh</p>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">Loading marketplace...</div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Icons.Lightning className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Energy Available</h3>
            <p className="text-gray-500 mb-4">Be the first to list energy for sale in your area!</p>
            <Link href="/marketplace/sell" className="bg-primary text-white px-6 py-2 rounded-lg inline-block">
              Sell Energy Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className={`p-4 text-white ${listing.source_type === 'solar' ? 'bg-gradient-to-r from-green-500 to-green-600' : listing.source_type === 'generator' ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-90">Seller</p>
                      <p className="font-semibold">{listing.seller_name}</p>
                    </div>
                    <div className="capitalize text-sm bg-white/20 px-2 py-1 rounded-full">{listing.source_type}</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-2xl font-bold text-gray-800">{listing.amount_kwh} kWh</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Price per kWh</p>
                      <p className="text-xl font-bold text-primary">₦{listing.price_per_kwh}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Price:</span>
                      <span className="font-semibold">₦{listing.total_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Location:</span>
                      <span>{listing.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuy(listing.id)}
                    disabled={buying === listing.id}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {buying === listing.id ? 'Processing...' : 'Buy Energy →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
