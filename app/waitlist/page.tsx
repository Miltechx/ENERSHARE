'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'
import { db } from '@/lib/firebase/client'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { Icons } from '@/components/icons'

export default function WaitlistPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    userType: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [waitlistCount, setWaitlistCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'waitlist'))
        setWaitlistCount(snapshot.size)
      } catch {
        // Non-critical — swallow silently
      }
    }
    fetchCount()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.userType) {
      setError('Please fill in all required fields')
      return
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setSubmitting(true)

    try {
      // Check for duplicate email
      const existing = query(
        collection(db, 'waitlist'),
        where('email', '==', formData.email.toLowerCase().trim())
      )
      const existingSnap = await getDocs(existing)
      if (!existingSnap.empty) {
        setError("You're already on the waitlist! We'll be in touch.")
        setSubmitting(false)
        return
      }

      await addDoc(collection(db, 'waitlist'), {
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        userType: formData.userType,
        createdAt: new Date().toISOString(),
      })

      setSubmitted(true)
      setWaitlistCount(prev => prev + 1)
    } catch (err: any) {
      console.error('Waitlist error:', err)
      if (err?.code === 'permission-denied') {
        setError('Submission blocked by security rules. Please contact support.')
      } else {
        setError('Failed to join the waitlist. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <Icons.Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">You're on the list!</h2>
          <p className="text-gray-400 mb-4">
            You are number{' '}
            <span className="text-green-500 font-bold">#{waitlistCount}</span> on the waitlist.
          </p>
          <p className="text-gray-400 mb-6">
            We'll email you at <span className="text-white">{formData.email}</span> when we launch
            in your area.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackButton />

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icons.Lightning className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join the Waitlist</h1>
          <p className="text-gray-400">
            Be among the first to trade energy in Nigeria. Early members get 30 days free on the
            Producer plan.
          </p>
          {waitlistCount > 0 && (
            <p className="text-sm text-green-500 mt-2">{waitlistCount}+ people already joined</p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name *"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (optional)"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="text"
            name="city"
            placeholder="City (optional)"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">I am a... *</option>
            <option value="solar_owner">Solar Home Owner</option>
            <option value="estate_manager">Estate Manager</option>
            <option value="sme_owner">SME Owner</option>
            <option value="microgrid_operator">Mini-Grid Operator</option>
            <option value="curious">Just Curious</option>
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Icons.Lightning className="w-5 h-5" />
                Join the Waitlist
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}