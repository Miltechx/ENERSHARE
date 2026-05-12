'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getIdToken } from 'firebase/auth'
import { useAuth } from '@/lib/auth-context'
import { auth, db } from '@/lib/firebase/client'
import { collection, getDocs, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore'
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
  const remaining = listing.kwhAvailable - (listing.kwhSold || 0)
  const [kwhAmount, setKwhAmount] = useState('1')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const amount    = parseFloat(kwhAmount) || 0
  const totalCost = parseFloat((amount * listing.pricePerKwh).toFixed(2))
  const canAfford = walletBalance >= totalCost
  const isValid   = amount > 0 && amount <= remaining

  const handlePurchase = async () => {
    if (!isValid || !canAfford) return
    setLoading(true); setError('')
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not signed in')
      const token = await getIdToken(user)
      const res = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId: listing.id, kwhAmount: amount }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Purchase failed')
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Purchase failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Sheet slides up from bottom on mobile, centered modal on desktop */}
      <div
        className="bg-gray-800 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div className="pr-4">
            <h2 className="text-lg font-bold text-white leading-tight">{listing.title}</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {listing.locationCity}, {listing.locationState} · {listing.energySource}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 mb-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Price / kWh</p>
            <p className="text-green-400 font-bold text-lg">₦{listing.pricePerKwh.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Available</p>
            <p className="text-white font-bold text-lg">{remaining} kWh</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Your wallet</p>
            <p className="text-white font-semibold">₦{walletBalance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Seller</p>
            <p className="text-white font-semibold truncate">{listing.sellerName}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Quick select</p>
          <div className="flex gap-2 flex-wrap">
            {[1, 5, 10, 20, 50].filter(n => n <= remaining).map(n => (
              <button
                key={n}
                onClick={() => setKwhAmount(String(n))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  kwhAmount === String(n) ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {n} kWh
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm text-gray-400 mb-1">Custom amount (kWh)</label>
          <input
            type="number"
            value={kwhAmount}
            onChange={e => setKwhAmount(e.target.value)}
            min="0.1"
            max={remaining}
            step="0.1"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className={`rounded-xl p-4 mb-4 ${canAfford ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-medium">Total Cost</span>
            <span className={`text-xl font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
              ₦{totalCost.toLocaleString()}
            </span>
          </div>
          {!canAfford && isValid && (
            <p className="text-red-400 text-xs mt-1">
              Insufficient balance.{' '}
              <Link href="/wallet" className="underline">Top up</Link>
            </p>
          )}
          {amount > remaining && (
            <p className="text-red-400 text-xs mt-1">Only {remaining} kWh available</p>
          )}
          {canAfford && isValid && (
            <p className="text-green-400 text-xs mt-1">
              {amount} kWh × ₦{listing.pricePerKwh} · 2.5% platform fee included
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition">
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading || !isValid || !canAfford}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? 'Processing…' : `Buy ${amount} kWh`}
          </button>
        </div>
      </div>
    </div>
  )
}

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-medium">{message}</span>
    </div>
  )
}

export default function MarketplaceClient() {
  const { user, wallet } = useAuth()
  const router = useRouter()

  const [listings, setListings]           = useState<Listing[]>([])
  const [loading, setLoading]             = useState(true)
  const [filters, setFilters]             = useState({ energySource: '', state: '', maxPrice: '', minKwh: '' })
  const [sortBy, setSortBy]               = useState('newest')
  const [activeListing, setActiveListing] = useState<Listing | null>(null)
  const [successMsg, setSuccessMsg]       = useState('')
  const [showFilters, setShowFilters]     = useState(false)
  const [deletingId, setDeletingId]       = useState<string | null>(null)

  useEffect(() => { fetchListings() }, [filters, sortBy])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'listings'), where('isActive', '==', true), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Listing[]

      if (filters.energySource) results = results.filter(l => l.energySource === filters.energySource)
      if (filters.state)        results = results.filter(l => l.locationState === filters.state)
      if (filters.maxPrice)     results = results.filter(l => l.pricePerKwh <= parseInt(filters.maxPrice))
      if (filters.minKwh)       results = results.filter(l => (l.kwhAvailable - l.kwhSold) >= parseInt(filters.minKwh))

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

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeletingId(listingId)
    try {
      await deleteDoc(doc(db, 'listings', listingId))
      setListings(prev => prev.filter(l => l.id !== listingId))
      setSuccessMsg('Listing deleted successfully')
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handlePurchaseSuccess = () => {
    setActiveListing(null)
    setSuccessMsg('Purchase successful! Energy added to your wallet. 🎉')
    fetchListings()
  }

  const totalAvailable = listings.reduce((sum, l) => sum + Math.max(0, l.kwhAvailable - (l.kwhSold || 0)), 0)
  const avgPrice = listings.length > 0
    ? Math.round(listings.reduce((s, l) => s + l.pricePerKwh, 0) / listings.length)
    : 0

  const hasActiveFilters = filters.energySource || filters.state || filters.maxPrice || filters.minKwh

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <BackButton />

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Energy Marketplace</h1>
            <p className="text-gray-400 mt-1 text-sm">Buy clean energy from producers near you</p>
          </div>
          <Link
            href="/marketplace/sell"
            className="shrink-0 bg-green-600 hover:bg-green-700 text-white px-3 py-2 sm:px-4 rounded-lg text-sm font-semibold transition"
          >
            + Sell Energy
          </Link>
        </div>

        {/* Stats — 1 col on mobile, 3 on sm+ */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Total Available</p>
            <p className="text-lg sm:text-2xl font-bold text-green-500 leading-tight">
              {totalAvailable.toLocaleString()}
              <span className="text-xs sm:text-sm font-normal text-green-400 ml-1">kWh</span>
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Active Sellers</p>
            <p className="text-lg sm:text-2xl font-bold text-green-500">{listings.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Avg Price</p>
            <p className="text-lg sm:text-2xl font-bold text-green-500 leading-tight">
              {avgPrice > 0 ? `₦${avgPrice.toLocaleString()}` : '—'}
              {avgPrice > 0 && <span className="text-xs font-normal text-green-400">/kWh</span>}
            </p>
          </div>
        </div>

        {/* Wallet reminder */}
        {user && (
          <div className="bg-gray-800 rounded-xl p-4 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center shrink-0">
                <Icons.Wallet className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Your wallet balance</p>
                <p className="text-white font-bold">₦{(wallet?.nairaBalance || 0).toLocaleString()}</p>
              </div>
            </div>
            <Link href="/wallet" className="text-green-500 text-sm hover:underline shrink-0">
              Top up →
            </Link>
          </div>
        )}

        {/* Filters — collapsible on mobile */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          {/* Mobile: toggle button + sort always visible */}
          <div className="flex gap-2 mb-3 sm:hidden">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                hasActiveFilters
                  ? 'bg-green-600/20 border-green-600/40 text-green-400'
                  : 'bg-gray-700 border-gray-600 text-gray-300'
              }`}
            >
              {showFilters ? 'Hide Filters' : `Filters${hasActiveFilters ? ' •' : ''}`}
            </button>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="most_kwh">Most kWh</option>
            </select>
          </div>

          {/* Filter inputs: always visible on desktop, toggle on mobile */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <select
                value={filters.energySource}
                onChange={e => setFilters(f => ({ ...f, energySource: e.target.value }))}
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
                onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              >
                <option value="">All States</option>
                {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <input
                type="number"
                placeholder="Max Price (₦/kWh)"
                value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              />

              <input
                type="number"
                placeholder="Min kWh Available"
                value={filters.minKwh}
                onChange={e => setFilters(f => ({ ...f, minKwh: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              />

              {/* Sort — desktop only (mobile has it above) */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="hidden sm:block px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="most_kwh">Most Available</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(listing => {
              const remaining   = Math.max(0, listing.kwhAvailable - (listing.kwhSold || 0))
              const soldPct     = listing.kwhAvailable > 0 ? ((listing.kwhSold || 0) / listing.kwhAvailable) * 100 : 0
              const sourceColor = listing.energySource === 'solar' ? 'bg-green-600' : listing.energySource === 'generator' ? 'bg-orange-600' : 'bg-blue-600'
              const isOwn       = user?.uid === listing.sellerId

              return (
                <div key={listing.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition">
                  <div className={`p-4 ${sourceColor}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold text-base leading-tight truncate">{listing.title}</h3>
                        <p className="text-white/70 text-sm mt-0.5 truncate">{listing.sellerName}</p>
                      </div>
                      <span className="shrink-0 bg-white/20 px-2 py-1 rounded-full text-xs text-white capitalize">
                        {listing.energySource}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-gray-400 text-xs">Available</p>
                        <p className="text-xl font-bold text-white">{remaining.toLocaleString()} kWh</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Price / kWh</p>
                        <p className="text-xl font-bold text-green-500">₦{listing.pricePerKwh.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Sold</span>
                        <span className="text-gray-300">{(listing.kwhSold || 0).toLocaleString()} kWh</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-green-500 rounded-full h-1.5 transition-all" style={{ width: `${Math.min(soldPct, 100)}%` }} />
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">📍 {listing.locationCity}, {listing.locationState}</p>

                    {isOwn ? (
                      <div className="flex gap-2">
                        <div className="flex-1 bg-gray-700 text-gray-400 py-2 rounded-lg text-center text-xs font-medium">
                          Your listing
                        </div>
                        <Link
                          href="/listings/mine"
                          className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          disabled={deletingId === listing.id}
                          className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-medium transition disabled:opacity-50"
                        >
                          {deletingId === listing.id ? '...' : 'Delete'}
                        </button>
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

      {activeListing && (
        <BuyModal
          listing={activeListing}
          walletBalance={wallet?.nairaBalance || 0}
          onClose={() => setActiveListing(null)}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {successMsg && (
        <SuccessToast message={successMsg} onClose={() => setSuccessMsg('')} />
      )}
    </div>
  )
}