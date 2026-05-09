'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import BackButton from '@/components/BackButton'
import { Icons } from '@/components/icons'

const NIGERIAN_STATES = [
  'Lagos', 'Abuja', 'Rivers', 'Ogun', 'Oyo', 'Delta', 'Edo', 'Kano',
  'Kaduna', 'Enugu', 'Anambra', 'Imo', 'Abia', 'Akwa Ibom', 'Cross River',
  'Benue', 'Plateau', 'Nasarawa', 'Kwara', 'Niger', 'Sokoto', 'Katsina',
  'Zamfara', 'Kebbi', 'Jigawa', 'Yobe', 'Borno', 'Adamawa', 'Taraba',
  'Gombe', 'Bauchi', 'Ebonyi', 'Ekiti', 'Ondo', 'Osun'
]

interface Listing {
  id: string
  sellerId: string
  sellerName: string
  title: string
  energySource: string
  kwhAvailable: number
  kwhSold: number
  pricePerKwh: number
  locationState: string
  locationCity: string
  isActive: boolean
  createdAt: any
}

export default function MarketplacePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    energySource: '',
    state: '',
    maxPrice: '',
    minKwh: '',
  })
  const [sortBy, setSortBy] = useState('newest')
  const [buying, setBuying] = useState<string | null>(null)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const listingsRef = collection(db, 'listings')
      const q = query(listingsRef, where('isActive', '==', true), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Listing[]

      // Apply filters
      if (filters.energySource) {
        results = results.filter(l => l.energySource === filters.energySource)
      }
      if (filters.state) {
        results = results.filter(l => l.locationState === filters.state)
      }
      if (filters.maxPrice) {
        results = results.filter(l => l.pricePerKwh <= parseInt(filters.maxPrice))
      }
      if (filters.minKwh) {
        results = results.filter(l => l.kwhAvailable >= parseInt(filters.minKwh))
      }

      // Apply sorting
      if (sortBy === 'price_asc') {
        results.sort((a, b) => a.pricePerKwh - b.pricePerKwh)
      } else if (sortBy === 'price_desc') {
        results.sort((a, b) => b.pricePerKwh - a.pricePerKwh)
      } else if (sortBy === 'most_kwh') {
        results.sort((a, b) => b.kwhAvailable - a.kwhAvailable)
      }

      setListings(results)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async (listingId: string, pricePerKwh: number, amountKwh: number) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    setBuying(listingId)
    const totalPrice = amountKwh * pricePerKwh
    const confirmed = confirm(`Buy ${amountKwh} kWh for ₦${totalPrice.toLocaleString()}?`)
    if (!confirmed) {
      setBuying(null)
      return
    }
    try {
      const res = await fetch('/api/energy/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, amountKwh }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Purchase successful! Energy added to your wallet.')
        fetchListings()
      } else {
        alert(data.error || 'Purchase failed')
      }
    } catch (error) {
      alert('Error processing purchase')
    } finally {
      setBuying(null)
    }
  }

  const totalAvailable = listings.reduce((sum, l) => sum + l.kwhAvailable, 0)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Energy Marketplace</h1>
          <p className="text-gray-400 mt-1">Buy clean energy from producers near you</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Total Available</p>
            <p className="text-2xl font-bold text-green-500">{totalAvailable} kWh</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Active Sellers</p>
            <p className="text-2xl font-bold text-green-500">{listings.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Avg Price</p>
            <p className="text-2xl font-bold text-green-500">
              ₦{listings.length > 0 ? Math.round(listings.reduce((s, l) => s + l.pricePerKwh, 0) / listings.length) : 0}/kWh
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.energySource}
              onChange={(e) => setFilters({ ...filters, energySource: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="">All Sources</option>
              <option value="solar">Solar</option>
              <option value="generator">Generator</option>
              <option value="inverter">Inverter</option>
              <option value="battery">Battery</option>
            </select>

            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="">All States</option>
              {NIGERIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Max Price (₦/kWh)"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />

            <input
              type="number"
              placeholder="Min kWh Available"
              value={filters.minKwh}
              onChange={(e) => setFilters({ ...filters, minKwh: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="most_kwh">Most Available</option>
            </select>
          </div>

          {(filters.energySource || filters.state || filters.maxPrice || filters.minKwh) && (
            <div className="mt-4 text-right">
              <button
                onClick={() => setFilters({ energySource: '', state: '', maxPrice: '', minKwh: '' })}
                className="text-sm text-green-500 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Icons.Lightning className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No energy listings found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or check back later</p>
            <Link href="/marketplace/sell" className="inline-block mt-4 text-green-500 hover:underline">
              Be the first to sell energy
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const soldPercentage = (listing.kwhSold / (listing.kwhAvailable + listing.kwhSold)) * 100
              return (
                <div key={listing.id} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition border border-gray-700">
                  <div className={`p-4 ${listing.energySource === 'solar' ? 'bg-green-600' : listing.energySource === 'generator' ? 'bg-orange-600' : 'bg-blue-600'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{listing.title}</h3>
                        <p className="text-white/80 text-sm mt-1">{listing.sellerName}</p>
                      </div>
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs text-white capitalize">
                        {listing.energySource}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Available</p>
                        <p className="text-2xl font-bold text-white">{listing.kwhAvailable} kWh</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Price per kWh</p>
                        <p className="text-2xl font-bold text-green-500">₦{listing.pricePerKwh}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Sold</span>
                        <span className="text-white">{listing.kwhSold} kWh</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 rounded-full h-2" style={{ width: `${soldPercentage}%` }} />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-400 mb-4">
                      <span>📍 {listing.locationCity}, {listing.locationState}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBuy(listing.id, listing.pricePerKwh, 1)}
                        disabled={buying === listing.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition disabled:opacity-50"
                      >
                        {buying === listing.id ? 'Processing...' : 'Buy 1 kWh'}
                      </button>
                      <button
                        onClick={() => {
                          const amount = prompt('Enter amount in kWh:', '5')
                          if (amount && !isNaN(parseFloat(amount))) {
                            handleBuy(listing.id, listing.pricePerKwh, parseFloat(amount))
                          }
                        }}
                        disabled={buying === listing.id}
                        className="px-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}