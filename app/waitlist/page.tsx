'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase/client'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { Icons } from '@/components/icons'
import Link from 'next/link'

export default function WaitlistPage() {
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
      const snapshot = await getDocs(collection(db, 'waitlist'))
      setWaitlistCount(snapshot.size)
    }
    fetchCount()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!formData.fullName || !formData.email || !formData.userType) {
      setError('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    try {
      const emailQuery = query(collection(db, 'waitlist'), where('email', '==', formData.email))
      const existing = await getDocs(emailQuery)
      if (!existing.empty) {
        setError('You are already on the waitlist!')
        setSubmitting(false)
        return
      }

      const params = new URLSearchParams(window.location.search)
      const refCode = params.get('ref')

      await addDoc(collection(db, 'waitlist'), {
        ...formData,
        referredBy: refCode || null,
        createdAt: new Date().toISOString(),
      })

      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const userTypes = [
    { value: 'solar_owner', label: 'Solar Home Owner' },
    { value: 'estate_manager', label: 'Estate Manager' },
    { value: 'sme_owner', label: 'SME Owner' },
    { value: 'microgrid_operator', label: 'Mini-Grid Operator' },
    { value: 'curious', label: 'Just Curious' },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icons.Lightning className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Be First to Trade Energy in Nigeria
          </h1>
          <p className="text-gray-400">
            Join thousands waiting to monetize their solar and inverter power.
            Early members get 30 days free on Producer plan.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-500/10 border border-green-500 rounded-xl p-8 text-center">
            <Icons.Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-1">You're on the list!</p>
            <p className="text-gray-400">
              You are number <span className="text-green-500 font-bold">#{waitlistCount + 1}</span> on the waitlist.
              We'll email you when we launch in your area.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">I am a</label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              >
                <option value="">Select...</option>
                {userTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Icons.Lightning className="w-5 h-5" /> Join the Waitlist
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}