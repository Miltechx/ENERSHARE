'use client'
import BackButton from '@/components/BackButton'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore'
import { MeterReading, MeterType } from '@/types'

export default function MetersPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [readings, setReadings] = useState<MeterReading[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    readingKwh: '',
    meterType: 'solar' as MeterType,
    capacityKw: '',
    readingDate: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
    if (!authLoading && user && profile?.role === 'consumer') {
      router.push('/dashboard')
    }
  }, [user, authLoading, profile, router])

  useEffect(() => {
    if (user) {
      fetchReadings()
    }
  }, [user])

  const fetchReadings = async () => {
    if (!user) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'meterReadings'),
        where('userId', '==', user.uid),
        orderBy('readingDate', 'desc'),
        limit(30)
      )
      const snapshot = await getDocs(q)
      const readingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MeterReading[]
      setReadings(readingsData)
    } catch (error) {
      console.error('Error fetching meter readings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    const readingKwh = parseFloat(formData.readingKwh)
    if (isNaN(readingKwh) || readingKwh <= 0) {
      setError('Please enter a valid reading')
      setSubmitting(false)
      return
    }

    try {
      await addDoc(collection(db, 'meterReadings'), {
        userId: user!.uid,
        readingKwh,
        meterType: formData.meterType,
        capacityKw: formData.capacityKw ? parseFloat(formData.capacityKw) : null,
        readingDate: formData.readingDate,
        verified: false,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      })

      setSuccess('Reading submitted successfully')
      setFormData({
        readingKwh: '',
        meterType: 'solar',
        capacityKw: '',
        readingDate: new Date().toISOString().split('T')[0],
        notes: '',
      })
      fetchReadings()
    } catch (err) {
      setError('Failed to submit reading')
    } finally {
      setSubmitting(false)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Meter Readings</h1>
          <p className="text-gray-400 mt-1">Track your energy generation and consumption</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Reading Form */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Submit Reading</h2>

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
                <label className="block text-sm font-medium text-gray-300 mb-1">Meter Type</label>
                <select
                  value={formData.meterType}
                  onChange={(e) => setFormData({ ...formData, meterType: e.target.value as MeterType })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="solar">Solar Meter</option>
                  <option value="generator">Generator Meter</option>
                  <option value="inverter">Inverter Meter</option>
                  <option value="grid">Grid Meter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reading (kWh)</label>
                <input
                  type="number"
                  value={formData.readingKwh}
                  onChange={(e) => setFormData({ ...formData, readingKwh: e.target.value })}
                  placeholder="0.00"
                  step="0.1"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">System Capacity (kW) - Optional</label>
                <input
                  type="number"
                  value={formData.capacityKw}
                  onChange={(e) => setFormData({ ...formData, capacityKw: e.target.value })}
                  placeholder="3.5"
                  step="0.1"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reading Date</label>
                <input
                  type="date"
                  value={formData.readingDate}
                  onChange={(e) => setFormData({ ...formData, readingDate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Any additional notes about this reading"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Reading'}
              </button>
            </form>
          </div>

          {/* Reading History */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Readings</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : readings.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No readings recorded yet</p>
            ) : (
              <div className="space-y-3">
                {readings.map((reading) => (
                  <div key={reading.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium capitalize">{reading.meterType} Meter</p>
                      <p className="text-gray-400 text-sm">{reading.readingDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">{reading.readingKwh} kWh</p>
                      {reading.capacityKw && (
                        <p className="text-gray-500 text-xs">{reading.capacityKw} kW capacity</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}