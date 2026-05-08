'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { EnergyListing, NIGERIAN_STATES } from '@/types'
import PurchaseModal from '@/components/PurchaseModal'
import FavouriteButton from '@/components/FavouriteButton'
import StarRating from '@/components/StarRating'

export default function MarketplacePage() {
  const { user, loading: authLoading } = useAuth()
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
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchListings()
    }
  }, [user, filters, sortBy])

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

      if (filters.maxPrice) {
        results = results.filter(l => l.pricePerKwh <= parseInt(filters.maxPrice))
      }
      if (filters.minKwh) {
        results = results.filter(l => l.kwhAvailable >= parseInt(filters.minKwh))
      }

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

  const openPurchaseModal = (listing: EnergyListing) => {
    setSelectedListing(listing)
    setModalOpen(true)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Energy Marketplace</h1>
          <p className="text-gray-400 mt-1">Buy clean energy from producers near you</p>
        </div>

        {/* Filters Bar */}
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
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="most_kwh">Most Available</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl">
            <p className="text-gray-400">No energy listings found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                        <FavouriteButton
                          listingId={listing.id}
                          listingTitle={listing.title}
                          sellerName={listing.sellerName}
                          pricePerKwh={listing.pricePerKwh}
                          energySource={listing.energySource}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 capitalize">{listing.energySource}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{listing.sellerName}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{listing.locationCity}</span>
                      </div>
                      <StarRating rating={4.5} size="sm" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-500">₦{listing.pricePerKwh}</p>
                      <p className="text-xs text-gray-400">per kWh</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 my-4 pt-4">
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
                    onClick={() => openPurchaseModal(listing)}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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