'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import BackButton from '@/components/BackButton'

const NIGERIAN_STATES = [
  'Lagos', 'Abuja', 'Rivers', 'Ogun', 'Oyo', 'Delta', 'Edo', 'Kano',
  'Kaduna', 'Enugu', 'Anambra', 'Imo', 'Abia', 'Akwa Ibom', 'Cross River',
  'Benue', 'Plateau', 'Nasarawa', 'Kwara', 'Niger', 'Sokoto', 'Katsina',
  'Zamfara', 'Kebbi', 'Jigawa', 'Yobe', 'Borno', 'Adamawa', 'Taraba',
  'Gombe', 'Bauchi', 'Ebonyi', 'Ekiti', 'Ondo', 'Osun',
]

const ENERGY_SOURCES = ['solar', 'generator', 'inverter', 'battery']

export default function SellPage() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    energySource: 'solar',
    kwhAvailable: '',
    pricePerKwh: '',
    locationState: 'Rivers',
    locationCity: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/auth/signin'); return }

    const kwh   = parseFloat(formData.kwhAvailable)
    const price = parseFloat(formData.pricePerKwh)

    if (!formData.title.trim())        { setError('Title is required'); return }
    if (isNaN(kwh)   || kwh   <= 0)   { setError('Enter a valid kWh amount'); return }
    if (isNaN(price) || price <= 0)    { setError('Enter a valid price per kWh'); return }
    if (!formData.locationCity.trim()) { setError('City is required'); return }

    setLoading(true)
    setError('')

    try {
      // 1. Create the listing
      await addDoc(collection(db, 'listings'), {
        sellerId:      user.uid,
        sellerName:    profile?.fullName || user.email?.split('@')[0] || 'Anonymous',
        title:         formData.title.trim(),
        energySource:  formData.energySource,
        kwhAvailable:  kwh,
        kwhSold:       0,
        pricePerKwh:   price,
        locationState: formData.locationState,
        locationCity:  formData.locationCity.trim(),
        isActive:      true,
        createdAt:     new Date().toISOString(),
      })

      // 2. Auto-upgrade role to producer if still consumer
      //    This lets any user self-select as a producer by their actions
      if (!profile?.role || profile.role === 'consumer') {
        await updateDoc(doc(db, 'users', user.uid), { role: 'producer' })
        // Refresh the auth context so the sidebar updates immediately
        await refreshProfile()
      }

      router.push('/listings/mine')
    } catch (err) {
      console.error('Error creating listing:', err)
      setError('Failed to create listing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-white mb-2">Sell Energy</h1>
        <p className="text-gray-400 mb-6">List your surplus energy for others to buy</p>

        <div className="bg-gray-800 rounded-xl p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Listing Title *</label>
              <input
                type="text"
                placeholder="e.g. Solar Excess Power - Lekki"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Energy Source */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Energy Source *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ENERGY_SOURCES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, energySource: s })}
                    className={`py-2.5 rounded-lg capitalize text-sm font-medium transition ${
                      formData.energySource === s
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* kWh + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount Available (kWh) *</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  min="0.1"
                  step="0.1"
                  value={formData.kwhAvailable}
                  onChange={e => setFormData({ ...formData, kwhAvailable: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Price per kWh (₦) *</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  min="1"
                  step="1"
                  value={formData.pricePerKwh}
                  onChange={e => setFormData({ ...formData, pricePerKwh: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">State *</label>
                <select
                  value={formData.locationState}
                  onChange={e => setFormData({ ...formData, locationState: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">City *</label>
                <input
                  type="text"
                  placeholder="e.g. Port Harcourt"
                  value={formData.locationCity}
                  onChange={e => setFormData({ ...formData, locationCity: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Price preview */}
            {formData.kwhAvailable && formData.pricePerKwh && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm font-medium">Listing Preview</p>
                <p className="text-white text-sm mt-1">
                  {formData.kwhAvailable} kWh at ₦{formData.pricePerKwh}/kWh ={' '}
                  <span className="font-bold text-green-400">
                    ₦{(parseFloat(formData.kwhAvailable) * parseFloat(formData.pricePerKwh)).toLocaleString()} total value
                  </span>
                </p>
                <p className="text-gray-400 text-xs mt-1">Platform takes 2.5% on each sale</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Creating listing...' : 'List Energy for Sale'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}