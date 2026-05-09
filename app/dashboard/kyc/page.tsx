'use client'
import BackButton from "@/components/BackButton"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import BackButton from '@/components/BackButton'
import { Icons } from '@/components/icons'

export default function KYCPage() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const [nin, setNin] = useState('')
  const [bvn, setBvn] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [kycStatus, setKycStatus] = useState('pending')

  useEffect(() => {
    if (profile?.kycStatus) {
      setKycStatus(profile.kycStatus)
    }
    if (profile?.nin) {
      setNin(profile.nin)
    }
    if (profile?.bvn) {
      setBvn(profile.bvn)
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!nin || nin.length !== 11) {
      setError('Please enter a valid 11-digit NIN')
      setLoading(false)
      return
    }

    if (!bvn || bvn.length !== 11) {
      setError('Please enter a valid 11-digit BVN')
      setLoading(false)
      return
    }

    try {
      const userRef = doc(db, 'users', user!.uid)
      await updateDoc(userRef, {
        nin: nin,
        bvn: bvn,
        kycStatus: 'submitted',
        updatedAt: new Date().toISOString(),
      })
      await refreshProfile()
      setMessage('KYC submitted successfully! Awaiting verification.')
      setKycStatus('submitted')
    } catch (err) {
      setError('Failed to submit KYC. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (kycStatus === 'verified') {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <BackButton />
          <div className="bg-green-500/10 border border-green-500 rounded-xl p-8 text-center">
            <Icons.Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">KYC Verified</h2>
            <p className="text-gray-400">Your identity has been verified. You have full access to all features.</p>
          </div>
        </div>
      </div>
    )
  }

  if (kycStatus === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <BackButton />
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-8 text-center">
            <Icons.Lightning className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">KYC Pending Review</h2>
            <p className="text-gray-400">Your documents are being reviewed. We'll notify you once verified.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackButton />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">KYC Verification</h1>
          <p className="text-gray-400 mt-1">Verify your identity to unlock all features</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <p className="text-gray-300 text-sm mb-2">Why we need this</p>
            <p className="text-gray-400 text-sm">
              KYC is required by Nigerian financial regulations to prevent fraud and ensure platform safety.
              Your information is encrypted and secure.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-green-500 text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                NIN (National Identification Number)
              </label>
              <input
                type="text"
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                placeholder="12345678901"
                maxLength={11}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">11-digit NIN from NIMC</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                BVN (Bank Verification Number)
              </label>
              <input
                type="text"
                value={bvn}
                onChange={(e) => setBvn(e.target.value)}
                placeholder="12345678901"
                maxLength={11}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">11-digit BVN from your bank</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}