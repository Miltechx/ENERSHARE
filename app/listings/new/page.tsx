'use client'
import BackButton from '@/components/BackButton'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { addDoc, collection } from 'firebase/firestore'
import { NIGERIAN_STATES, EnergySource } from '@/types'

export default function NewListingPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    energySource: 'solar' as EnergySource,
    kwhAvailable: '',
    pricePerKwh: '',
    minPurchaseKwh: '1',
    maxPurchaseKwh: '',
    locationState: '',
    locationCity: '',
    locationArea: '',
    expiresInDays: '30',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
    if (!authLoading && user && profile?.role === 'consumer') {
      router.push('/dashboard')
    }
    if (profile?.state) {
      setFormData(prev => ({ ...prev, locationState: profile.state || '', locationCity: profile.city || '' }))
    }
  }, [user, authLoading, profile, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const kwhAvailable = parseFloat(formData.kwhAvailable)
    const pricePerKwh = parseFloat(formData.pricePerKwh)
    const minPurchaseKwh = parseFloat(formData.minPurchaseKwh)
    const maxPurchaseKwh = formData.maxPurchaseKwh ? parseFloat(formData.maxPurchaseKwh) : undefined
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiresInDays))

    if (isNaN(kwhAvailable) || kwhAvailable <= 0) {
      setError('Please enter a valid amount of energy')
      setLoading(false)
      return
    }

    if (isNaN(pricePerKwh) || pricePerKwh < 50 || pricePerKwh > 500) {
      setError('Price must be between ₦50 and ₦500 per kWh')
      setLoading(false)
      return
    }

    if (isNaN(minPurchaseKwh) || minPurchaseKwh <= 0) {
      setError('Minimum purchase amount must be at least 1 kWh')
      setLoading(false)
      return
    }

    if (maxPurchaseKwh && maxPurchaseKwh < minPurchaseKwh) {
      setError('Maximum purchase cannot be less than minimum purchase')
      setLoading(false)
      return
    }

    try {
      const listingData = {
        sellerId: user!.uid,
        sellerName: profile?.fullName?.split(' ')[0] + ' ' + (profile?.fullName?.split(' ')[1]?.[0] || ''),
        sellerState: profile?.state,
        sellerCity: profile?.city,
        title: formData.title,
        description: formData.description || '',
        energySource: formData.energySource,
        kwhAvailable,
        kwhSold: 0,
        pricePerKwh,
        minPurchaseKwh,
        maxPurchaseKwh,
        locationState: formData.locationState,
        locationCity: formData.locationCity,
        locationArea: formData.locationArea,
        isActive: true,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await addDoc(collection(db, 'listings'), listingData)
      router.push('/listings/mine')
    } catch (err) {
      console.error(err)
      setError('Failed to create listing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Create New Listing</h1>
          <p className="text-gray-400 mt-1">List your energy for sale to nearby buyers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Listing Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Solar Excess Power Available"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your energy source, reliability, etc."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Energy Source</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'solar', label: 'Solar' },
                  { value: 'generator', label: 'Generator' },
                  { value: 'inverter', label: 'Inverter' },
                  { value: 'battery', label: 'Battery' },
                ].map((source) => (
                  <button
                    key={source.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, energySource: source.value as any })}
                    className={`py-2 rounded-lg text-sm font-medium transition ${
                      formData.energySource === source.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {source.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Amount Available (kWh)</label>
                <input
                  type="number"
                  name="kwhAvailable"
                  value={formData.kwhAvailable}
                  onChange={handleChange}
                  placeholder="100"
                  step="0.5"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Price per kWh (₦)</label>
                <input
                  type="number"
                  name="pricePerKwh"
                  value={formData.pricePerKwh}
                  onChange={handleChange}
                  placeholder="95"
                  step="5"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Recommended range: ₦85-₦180</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Minimum Purchase (kWh)</label>
                <input
                  type="number"
                  name="minPurchaseKwh"
                  value={formData.minPurchaseKwh}
                  onChange={handleChange}
                  placeholder="1"
                  step="0.5"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Maximum Purchase (kWh)</label>
                <input
                  type="number"
                  name="maxPurchaseKwh"
                  value={formData.maxPurchaseKwh}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  step="0.5"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty for no maximum</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Location</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                <select
                  name="locationState"
                  value={formData.locationState}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                >
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  name="locationCity"
                  value={formData.locationCity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Area (Optional)</label>
              <input
                type="text"
                name="locationArea"
                value={formData.locationArea}
                onChange={handleChange}
                placeholder="e.g., Lekki Phase 1"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Listing Expiry</label>
              <select
                name="expiresInDays"
                value={formData.expiresInDays}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}