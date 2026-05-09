'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { addDoc, collection } from 'firebase/firestore'
import BackButton from '@/components/BackButton'
import { Icons } from '@/components/icons'

const NIGERIAN_STATES = ['Lagos', 'Abuja', 'Rivers', 'Ogun', 'Oyo', 'Delta', 'Edo', 'Kano', 'Kaduna', 'Enugu', 'Anambra', 'Imo', 'Abia', 'Akwa Ibom', 'Cross River', 'Benue', 'Plateau', 'Nasarawa', 'Kwara', 'Niger', 'Sokoto', 'Katsina', 'Zamfara', 'Kebbi', 'Jigawa', 'Yobe', 'Borno', 'Adamawa', 'Taraba', 'Gombe', 'Bauchi', 'Ebonyi', 'Ekiti', 'Ondo', 'Osun']

export default function SellPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({ title: '', energySource: 'solar', kwhAvailable: '', pricePerKwh: '', locationState: 'Lagos', locationCity: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/auth/signin'); return }
    setLoading(true); setError('')
    try {
      await addDoc(collection(db, 'listings'), {
        sellerId: user.uid, sellerName: user.email?.split('@')[0], title: formData.title, energySource: formData.energySource,
        kwhAvailable: parseFloat(formData.kwhAvailable), kwhSold: 0, pricePerKwh: parseFloat(formData.pricePerKwh),
        locationState: formData.locationState, locationCity: formData.locationCity, isActive: true, createdAt: new Date().toISOString()
      })
      router.push('/marketplace')
    } catch (err) { setError('Failed to create listing') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-white mb-6">Sell Energy</h1>
        <div className="bg-gray-800 rounded-xl p-6">
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg"><p className="text-red-500 text-sm">{error}</p></div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Title (e.g., Solar Excess Power)" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
            <div className="grid grid-cols-2 gap-4">
              {['solar', 'generator', 'inverter', 'battery'].map(s => (<button key={s} type="button" onClick={() => setFormData({ ...formData, energySource: s })} className={`py-2 rounded-lg capitalize ${formData.energySource === s ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{s}</button>))}
            </div>
            <input type="number" placeholder="Amount (kWh)" value={formData.kwhAvailable} onChange={(e) => setFormData({ ...formData, kwhAvailable: e.target.value })} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
            <input type="number" placeholder="Price per kWh (₦)" value={formData.pricePerKwh} onChange={(e) => setFormData({ ...formData, pricePerKwh: e.target.value })} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
            <div className="grid grid-cols-2 gap-4">
              <select value={formData.locationState} onChange={(e) => setFormData({ ...formData, locationState: e.target.value })} className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white">{NIGERIAN_STATES.map(s => (<option key={s} value={s}>{s}</option>))}</select>
              <input type="text" placeholder="City" value={formData.locationCity} onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })} className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold">{loading ? 'Creating...' : 'List Energy'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}