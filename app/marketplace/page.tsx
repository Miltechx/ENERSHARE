'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'

interface Listing {
  id: string
  seller_name: string
  source_type: string
  amount_kwh: number
  price_per_kwh_ngn: number
  total_price: number
  location: string
  created_at: string
}

export default function Marketplace() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<EnergyListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    energySource: '',
    state: '',
    maxPrice: '',
    minKwh: '',
  })
  const [selectedListing, setSelectedListing] = useState<EnergyListing | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest' | 'most_kwh'>('newest')

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/auth/signin')
  }, [sessionStatus, router])

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    try {
      let constraints = [where('isActive', '==', true)]
      
      if (filters.energySource) {
        constraints.push(where('energySource', '==', filters.energySource))
      }
      if (filters.state) {
        constraints.push(where('locationState', '==', filters.state))
      }

      let q = query(collection(db, 'listings'), ...constraints, orderBy('createdAt', 'desc'))
      let snapshot = await getDocs(q)
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EnergyListing[]

      // Apply client-side filters
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

  const handleBuy = async (listingId: string) => {
    setBuying(listingId)
    try {
      const res = await fetch('/api/energy/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Purchase successful! Energy credits added to your account.')
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

  const filteredListings = filter === 'all' ? listings : listings.filter(l => l.source_type === filter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    )
  }

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

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Energy Marketplace</h1>
          <div className="flex space-x-2">
            {['all', 'solar', 'generator', 'grid', 'battery'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition capitalize ${filter === f ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

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
            <p className="text-xl font-bold text-primary">
              ₦{filteredListings.length > 0 ? Math.min(...filteredListings.map(l => l.price_per_kwh_ngn)) : 0}/kWh
            </p>
          </div>
        </div>

        {filteredListings.length === 0 ? (
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
                      <p className="text-xl font-bold text-primary">₦{listing.price_per_kwh_ngn}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Available</span>
                      <span className="text-white font-semibold">{listing.kwhAvailable} kWh</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 rounded-full h-2"
                        style={{ width: `${(listing.kwhSold / (listing.kwhAvailable + listing.kwhSold)) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Min: {listing.minPurchaseKwh} kWh</span>
                      {listing.maxPurchaseKwh && <span>Max: {listing.maxPurchaseKwh} kWh</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuy(listing.id)}
                    disabled={buying === listing.id}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {selectedListing && (
        <PurchaseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          listing={selectedListing}
          onSuccess={() => {
            setModalOpen(false)
            fetchListings()
          }}
        />
      )}
    </div>
  )
}