'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from 'firebase/firestore'
import BackButton from '@/components/BackButton'
import { Icons } from '@/components/icons'

interface Listing {
  id: string
  title: string
  description: string
  pricePerKwh: number
  kwhAvailable: number
  locationCity: string
  locationState: string
  isActive: boolean
  energySource: string
  createdAt: any
}

interface EditForm {
  title: string
  description: string
  pricePerKwh: string
  kwhAvailable: string
  locationCity: string
  locationState: string
  energySource: string
}

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/signin'); return }
    fetchListings()
  }, [user, authLoading])

  const fetchListings = async () => {
    if (!user) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'listings'),
        where('sellerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Listing)))
    } catch (err) {
      console.error('Error fetching listings:', err)
      setError('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (listing: Listing) => {
    setEditingId(listing.id)
    setEditForm({
      title: listing.title,
      description: listing.description || '',
      pricePerKwh: String(listing.pricePerKwh),
      kwhAvailable: String(listing.kwhAvailable),
      locationCity: listing.locationCity || '',
      locationState: listing.locationState || '',
      energySource: listing.energySource || 'solar',
    })
    setError('')
    setSuccess('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const saveEdit = async (listingId: string) => {
    if (!editForm) return
    const price = parseFloat(editForm.pricePerKwh)
    const kwh = parseFloat(editForm.kwhAvailable)

    if (!editForm.title.trim()) { setError('Title is required'); return }
    if (isNaN(price) || price <= 0) { setError('Enter a valid price per kWh'); return }
    if (isNaN(kwh) || kwh <= 0) { setError('Enter a valid kWh amount'); return }

    setSaving(true)
    setError('')
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        pricePerKwh: price,
        kwhAvailable: kwh,
        locationCity: editForm.locationCity.trim(),
        locationState: editForm.locationState.trim(),
        energySource: editForm.energySource,
        updatedAt: new Date().toISOString(),
      })
      setSuccess('Listing updated successfully')
      setEditingId(null)
      setEditForm(null)
      fetchListings()
    } catch (err) {
      console.error('Error updating listing:', err)
      setError('Failed to update listing')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (listingId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'listings', listingId), { isActive: !current })
      setListings(prev =>
        prev.map(l => l.id === listingId ? { ...l, isActive: !current } : l)
      )
      setSuccess(`Listing ${!current ? 'activated' : 'paused'}`)
    } catch (err) {
      setError('Failed to update listing status')
    }
  }

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return
    setDeletingId(listingId)
    setError('')
    try {
      await deleteDoc(doc(db, 'listings', listingId))
      setListings(prev => prev.filter(l => l.id !== listingId))
      setSuccess('Listing deleted')
    } catch (err) {
      console.error('Error deleting listing:', err)
      setError('Failed to delete listing')
    } finally {
      setDeletingId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton />

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Listings</h1>
            <p className="text-gray-400 mt-1">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/marketplace/sell"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
          >
            <Icons.Lightning className="w-4 h-4" /> New Listing
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {listings.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Icons.Solar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">You haven't created any listings yet</p>
            <Link
              href="/marketplace/sell"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition inline-block"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map(listing => (
              <div key={listing.id} className="bg-gray-800 rounded-xl overflow-hidden">
                {editingId === listing.id && editForm ? (
                  /* ── EDIT MODE ── */
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Edit Listing</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-gray-400 mb-1">Title *</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                        <textarea
                          value={editForm.description}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Price per kWh (₦) *</label>
                        <input
                          type="number"
                          value={editForm.pricePerKwh}
                          onChange={e => setEditForm({ ...editForm, pricePerKwh: e.target.value })}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">kWh Available *</label>
                        <input
                          type="number"
                          value={editForm.kwhAvailable}
                          onChange={e => setEditForm({ ...editForm, kwhAvailable: e.target.value })}
                          min="0"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">City</label>
                        <input
                          type="text"
                          value={editForm.locationCity}
                          onChange={e => setEditForm({ ...editForm, locationCity: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">State</label>
                        <input
                          type="text"
                          value={editForm.locationState}
                          onChange={e => setEditForm({ ...editForm, locationState: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Energy Type</label>
                        <select
                          value={editForm.energySource}
                          onChange={e => setEditForm({ ...editForm, energySource: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="solar">Solar</option>
                          <option value="generator">Generator</option>
                          <option value="inverter">Inverter</option>
                          <option value="battery">Battery</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => saveEdit(listing.id)}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-5 py-2 rounded-lg text-sm transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── VIEW MODE ── */
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold truncate">{listing.title}</h3>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${
                            listing.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {listing.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {listing.locationCity && `${listing.locationCity}, `}
                        {listing.locationState} ·{' '}
                        <span className="text-green-400 font-medium">
                          ₦{listing.pricePerKwh}/kWh
                        </span>{' '}
                        · {listing.kwhAvailable} kWh available
                      </p>
                      {listing.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                          {listing.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleActive(listing.id, listing.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          listing.isActive
                            ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                        }`}
                      >
                        {listing.isActive ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={() => startEdit(listing)}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteListing(listing.id)}
                        disabled={deletingId === listing.id}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition"
                      >
                        {deletingId === listing.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}