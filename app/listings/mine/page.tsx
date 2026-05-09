'use client'
import BackButton from '@/components/BackButton'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { EnergyListing } from '@/types'

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<EnergyListing[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchListings()
    }
  }, [user])

  const fetchListings = async () => {
    if (!user) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'listings'),
        where('sellerId', '==', user.uid),
        where('isActive', '==', true)
      )
      const snapshot = await getDocs(q)
      const listingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EnergyListing[]
      setListings(listingsData)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleListingStatus = async (listingId: string, currentStatus: boolean) => {
    setUpdating(listingId)
    try {
      const listingRef = doc(db, 'listings', listingId)
      await updateDoc(listingRef, {
        isActive: !currentStatus,
        updatedAt: new Date().toISOString(),
      })
      await fetchListings()
    } catch (error) {
      console.error('Error updating listing:', error)
    } finally {
      setUpdating(null)
    }
  }

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Listings</h1>
            <p className="text-gray-400 mt-1">Manage your energy listings</p>
          </div>
          <Link
            href="/listings/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            + New Listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400">You haven't created any listings yet</p>
            <Link href="/listings/new" className="text-green-500 hover:underline mt-2 inline-block">
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {listings.map((listing) => {
              const soldPercentage = (listing.kwhSold / (listing.kwhAvailable + listing.kwhSold)) * 100
              return (
                <div key={listing.id} className="bg-gray-800 rounded-xl p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 capitalize">{listing.energySource}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{listing.locationCity}, {listing.locationState}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-500">₦{listing.pricePerKwh}</p>
                      <p className="text-xs text-gray-400">per kWh</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Sold Progress</span>
                      <span className="text-white">{listing.kwhSold} / {listing.kwhAvailable + listing.kwhSold} kWh</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 rounded-full h-2 transition-all"
                        style={{ width: `${soldPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        listing.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {listing.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {listing.expiresAt && new Date(listing.expiresAt) < new Date() && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                          Expired
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleListingStatus(listing.id, listing.isActive)}
                        disabled={updating === listing.id}
                        className={`px-3 py-1 rounded text-sm transition ${
                          listing.isActive
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        }`}
                      >
                        {updating === listing.id ? '...' : (listing.isActive ? 'Deactivate' : 'Activate')}
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