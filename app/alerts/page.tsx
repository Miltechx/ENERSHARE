'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { NIGERIAN_STATES } from '@/types'
import { Icons } from '@/components/icons'

interface PriceAlert {
  id: string
  userId: string
  state: string
  energySource: string
  maxPricePerKwh: number
  minKwhAvailable: number
  isActive: boolean
  createdAt: any
}

export default function PriceAlertsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    state: '',
    energySource: '',
    maxPricePerKwh: '',
    minKwhAvailable: '1',
  })

  useEffect((): void => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchAlerts()
    }
  }, [user])

  const fetchAlerts = async () => {
    if (!user) return
    try {
      const q = query(collection(db, 'priceAlerts'), where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PriceAlert[]
      setAlerts(alertsData)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (!formData.state) {
      setError('Please select a state')
      setSubmitting(false)
      return
    }

    if (!formData.maxPricePerKwh || parseFloat(formData.maxPricePerKwh) <= 0) {
      setError('Please enter a valid price')
      setSubmitting(false)
      return
    }

    if (alerts.length >= 5) {
      setError('Maximum 5 active alerts allowed')
      setSubmitting(false)
      return
    }

    try {
      await addDoc(collection(db, 'priceAlerts'), {
        userId: user!.uid,
        state: formData.state,
        energySource: formData.energySource || null,
        maxPricePerKwh: parseFloat(formData.maxPricePerKwh),
        minKwhAvailable: parseFloat(formData.minKwhAvailable) || 1,
        isActive: true,
        createdAt: new Date().toISOString(),
      })
      setSuccess('Price alert created successfully')
      setFormData({
        state: '',
        energySource: '',
        maxPricePerKwh: '',
        minKwhAvailable: '1',
      })
      fetchAlerts()
    } catch (err) {
      setError('Failed to create alert')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAlert = async (alertId: string, currentStatus: boolean) => {
    try {
      const alertRef = doc(db, 'priceAlerts', alertId)
      await updateDoc(alertRef, { isActive: !currentStatus })
      fetchAlerts()
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      await deleteDoc(doc(db, 'priceAlerts', alertId))
      fetchAlerts()
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Price Alerts</h1>
        <p className="text-gray-400 mb-6">Get notified when energy prices drop in your area</p>

        {/* Create Alert Form */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Create New Alert</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-green-500 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
              <select
                name="state"
                value={formData.state}
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Energy Source (Optional)</label>
              <select
                name="energySource"
                value={formData.energySource}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Any Source</option>
                <option value="solar">Solar</option>
                <option value="generator">Generator</option>
                <option value="inverter">Inverter</option>
                <option value="battery">Battery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Alert when price drops below (₦/kWh)
              </label>
              <input
                type="number"
                name="maxPricePerKwh"
                value={formData.maxPricePerKwh}
                onChange={handleChange}
                placeholder="100"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Minimum kWh Available
              </label>
              <input
                type="number"
                name="minKwhAvailable"
                value={formData.minKwhAvailable}
                onChange={handleChange}
                placeholder="1"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                step="0.5"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || alerts.length >= 5}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Icons.Lightning className="w-5 h-5" />
                  Create Alert
                </>
              )}
            </button>
            {alerts.length >= 5 && (
              <p className="text-center text-xs text-red-400">Maximum 5 active alerts reached</p>
            )}
          </form>
        </div>

        {/* Alerts List */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Your Alerts</h2>

          {alerts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No alerts created yet</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      {alert.state} • {alert.energySource ? alert.energySource : 'Any'} Energy
                    </p>
                    <p className="text-sm text-gray-400">
                      Below ₦{alert.maxPricePerKwh}/kWh • Min {alert.minKwhAvailable} kWh
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleAlert(alert.id, alert.isActive)}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        alert.isActive
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-gray-600/20 text-gray-400'
                      }`}
                    >
                      {alert.isActive ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Icons.Close className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}