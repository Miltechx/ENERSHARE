'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getIdToken } from 'firebase/auth'
import { useAuth } from '@/lib/auth-context'
import { auth, db } from '@/lib/firebase/client'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import BackButton from '@/components/BackButton'
import { Icons } from '@/components/icons'

const NIGERIAN_STATES = [
  'Lagos', 'Abuja', 'Rivers', 'Ogun', 'Oyo', 'Delta', 'Edo', 'Kano',
  'Kaduna', 'Enugu', 'Anambra', 'Imo', 'Abia', 'Akwa Ibom', 'Cross River',
  'Benue', 'Plateau', 'Nasarawa', 'Kwara', 'Niger', 'Sokoto', 'Katsina',
  'Zamfara', 'Kebbi', 'Jigawa', 'Yobe', 'Borno', 'Adamawa', 'Taraba',
  'Gombe', 'Bauchi', 'Ebonyi', 'Ekiti', 'Ondo', 'Osun',
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

// ─── Buy Modal ────────────────────────────────────────────────────────────────
function BuyModal({
  listing,
  walletBalance,
  onClose,
  onSuccess,
}: {
  listing: Listing
  walletBalance: number
  onClose: () => void
  onSuccess: () => void
}) {
  const remainingKwh = listing.kwhAvailable - (listing.kwhSold || 0)
  const [kwhAmount, setKwhAmount]   = useState('1')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const amount    = parseFloat(kwhAmount) || 0
  const totalCost = parseFloat((amount * listing.pricePerKwh).toFixed(2))
  const canAfford = walletBalance >= totalCost
  const isValid   = amount > 0 && amount <= remainingKwh

  const handlePurchase = async () => {
    if (!isValid || !canAfford) return
    setLoading(true)
    setError('')
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not signed in')
      const token = await getIdToken(user)

      const res = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,   // ← auth token required by API
        },
        body: JSON.stringify({
          listingId: listing.id,
          kwhAmount: amount,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Purchase failed')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Purchase failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{listing.title}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {listing.locationCity}, {listing.locationState} · {listing.energySource}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Price info */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Price per kWh</p>
            <p className="text-green-400 font-bold text-lg">₦{listing.pricePerKwh.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Available</p>
            <p className="text-white font-bold text-lg">{remainingKwh} kWh</p>
          </div>
          <div>
            <p className="text-gray-400">Your wallet</p>
            <p className="text-white font-semibold">₦{walletBalance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Seller</p>
            <p className="text-white font-semibold truncate">{listing.sellerName}</p>
          </div>
        </div>

        {/* Quick amount buttons */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Quick select</p>
          <div className="flex gap-2 flex-wrap">
            {[1, 5, 10, 20, 50].filter(n => n <= remainingKwh).map(n => (
              <button
                key={n}
                onClick={() => setKwhAmount(String(n))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  kwhAmount === String(n)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {n} kWh
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-1">
            Or enter custom amount (kWh)
          </label>
          <input
            type="number"
            value={kwhAmount}
            onChange={(e) => setKwhAmount(e.target.value)}
            min="0.1"
            max={remainingKwh}
            step="0.1"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Total cost summary */}
        <div className={`rounded-xl p-4 mb-4 ${canAfford ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-medium">Total Cost</span>
            <span className={`text-xl font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
              ₦{totalCost.toLocaleString()}
            </span>
          </div>
          {!canAfford && isValid && (
            <p className="text-red-400 text-xs mt-1">
              Insufficient balance. <Link href="/wallet" className="underline">Top up your wallet</Link>
            </p>
          )}
          {amount > remainingKwh && (
            <p className="text-red-400 text-xs mt-1">
              Only {remainingKwh} kWh available
            </p>
          )}
          {canAfford && isValid && (
            <p className="text-green-400 text-xs mt-1">
              {amount} kWh × ₦{listing.pricePerKwh} · 2.5% platform fee included
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading || !isValid || !canAfford}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Processing…' : `Buy ${amount} kWh`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Success Toast ─────────────────────────────────────────────────────────────
function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-medium">{message}</span>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MarketplaceClient() {
  const { user, wallet } = useAuth()
  const router = useRouter()

  const [listings, setListings]     = useState<Listing[]>([])
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters]       = useState({ energySource: '', state: '', maxPrice: '', minKwh: '' })
  const [sortBy, setSortBy]         = useState('newest')
  const [activeListing, setActiveListing] = useState<Listing | null>(null)  // buy modal
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => { fetchListings() }, [])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, 'listings'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Listing[]

      // Client-side filters
      if (filters.energySource) results = results.filter(l => l.energySource === filters.energySource)
      if (filters.state)        results = results.filter(l => l.locationState === filters.state)
      if (filters.maxPrice)     results = results.filter(l => l.pricePerKwh <= parseInt(filters.maxPrice))
      if (filters.minKwh)       results = results.filter(l => (l.kwhAvailable - l.kwhSold) >= parseInt(filters.minKwh))

      // Sorting
      if (sortBy === 'price_asc')  results.sort((a, b) => a.pricePerKwh - b.pricePerKwh)
      if (sortBy === 'price_desc') results.sort((a, b) => b.pricePerKwh - a.pricePerKwh)
      if (sortBy === 'most_kwh')   results.sort((a, b) => (b.kwhAvailable - b.kwhSold) - (a.kwhAvailable - a.kwhSold))

      setListings(results)
    } catch (err) {
      console.error('Error fetching listings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyClick = (listing: Listing) => {
    if (!user) { router.push('/auth/signin'); return }
    setActiveListing(listing)
  }

  const handlePurchaseSuccess = () => {
    setActiveListing(null)
    setSuccessMsg('Purchase successful! Energy added to your wallet. 🎉')
    fetchListings()
  }

  const totalAvailable = listings.reduce((sum, l) => sum + Math.max(0, l.kwhAvailable - (l.kwhSold || 0)), 0)
  const avgPrice       = listings.length > 0
    ? Math.round(listings.reduce((s, l) => s + l.pricePerKwh, 0) / listings.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Energy Marketplace</h1>
            <p className="text-gray-400 mt-1">Buy clean energy from producers near you</p>
          </div>
          <Link
            href="/marketplace/sell"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            + Sell Energy
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Total Available</p>
            <p className="text-2xl font-bold text-green-500">{totalAvailable.toLocaleString()} kWh</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Active Sellers</p>
            <p className="text-2xl font-bold text-green-500">{listings.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Avg Price</p>
            <p className="text-2xl font-bold text-green-500">
              {avgPrice > 0 ? `₦${avgPrice.toLocaleString()}/kWh` : '—'}
            </p>
          </div>
        </div>

        {/* Wallet balance reminder */}
        {user && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Icons.Wallet className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Your wallet balance</p>
                <p className="text-white font-bold">₦{(wallet?.nairaBalance || 0).toLocaleString()}</p>
              </div>
            </div>
            <Link href="/wallet" className="text-green-500 text-sm hover:underline">
              Top up →
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <select
              value={filters.energySource}
              onChange={(e) => setFilters(f => ({ ...f, energySource: e.target.value }))}
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
              onChange={(e) => setFilters(f => ({ ...f, state: e.target.value }))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="">All States</option>
              {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <input
              type="number"
              placeholder="Max Price (₦/kWh)"
              value={filters.maxPrice}
              onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />

            <input
              type="number"
              placeholder="Min kWh Available"
              value={filters.minKwh}
              onChange={(e) => setFilters(f => ({ ...f, minKwh: e.target.value }))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="most_kwh">Most Available</option>
            </select>
          </div>

          {(filters.energySource || filters.state || filters.maxPrice || filters.minKwh) && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-gray-400 text-sm">{listings.length} result{listings.length !== 1 ? 's' : ''}</p>
              <button
                onClick={() => setFilters({ energySource: '', state: '', maxPrice: '', minKwh: '' })}
                className="text-sm text-green-500 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500" />
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Icons.Lightning className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No energy listings found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or check back later</p>
            <Link href="/marketplace/sell" className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition">
              Be the first to sell energy
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const remaining      = Math.max(0, listing.kwhAvailable - (listing.kwhSold || 0))
              const soldPct        = listing.kwhAvailable > 0
                ? ((listing.kwhSold || 0) / listing.kwhAvailable) * 100
                : 0
              const sourceColor    = listing.energySource === 'solar'
                ? 'bg-green-600'
                : listing.energySource === 'generator'
                ? 'bg-orange-600'
                : 'bg-blue-600'
              const isOwnListing   = user?.uid === listing.sellerId

              return (
                <div
                  key={listing.id}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition"
                >
                  {/* Card header */}
                  <div className={`p-4 ${sourceColor}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-semibold text-lg leading-tight">{listing.title}</h3>
                        <p className="text-white/70 text-sm mt-1">{listing.sellerName}</p>
                      </div>
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs text-white capitalize flex-shrink-0">
                        {listing.energySource}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-gray-400 text-xs">Available</p>
                        <p className="text-2xl font-bold text-white">{remaining.toLocaleString()} kWh</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Price per kWh</p>
                        <p className="text-2xl font-bold text-green-500">₦{listing.pricePerKwh.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Sold progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Sold</span>
                        <span className="text-gray-300">{(listing.kwhSold || 0).toLocaleString()} kWh</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-green-500 rounded-full h-1.5 transition-all"
                          style={{ width: `${Math.min(soldPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">
                      📍 {listing.locationCity}, {listing.locationState}
                    </p>

                    {isOwnListing ? (
                      <div className="w-full bg-gray-700 text-gray-400 py-2 rounded-lg text-center text-sm">
                        Your listing
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuyClick(listing)}
                        disabled={remaining === 0}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 text-white py-2.5 rounded-lg font-semibold transition"
                      >
                        {remaining === 0 ? 'Sold Out' : 'Buy Energy'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Buy Modal */}
      {activeListing && (
        <BuyModal
          listing={activeListing}
          walletBalance={wallet?.nairaBalance || 0}
          onClose={() => setActiveListing(null)}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Success Toast */}
      {successMsg && (
        <SuccessToast
          message={successMsg}
          onClose={() => setSuccessMsg('')}
        />
      )}
    </div>
  )
}