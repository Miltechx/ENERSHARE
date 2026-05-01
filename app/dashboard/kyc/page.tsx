'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

export default function KYCPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [nin, setNin] = useState('')
  const [bvn, setBvn] = useState('')
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/auth/signin')
  }, [sessionStatus, router])

  useEffect(() => {
    if (session?.user) {
      checkKycStatus()
    }
  }, [session])

  const checkKycStatus = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('kyc_submissions')
      .select('status')
      .eq('user_id', session?.user?.id)
      .single()

    if (data) {
      setKycStatus(data.status)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase
      .from('kyc_submissions')
      .insert({
        user_id: session?.user?.id,
        nin: nin,
        bvn: bvn,
        status: 'pending',
      })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('KYC submitted successfully! Awaiting verification.')
      setKycStatus('pending')
      setNin('')
      setBvn('')
    }
    setLoading(false)
  }

  if (kycStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm p-4">
          <Logo variant="compact" />
        </nav>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">KYC Verified</h1>
            <p className="text-gray-500">Your identity has been verified. You have full access to all features.</p>
            <Link href="/dashboard" className="inline-block mt-6 text-primary hover:underline">
              Back to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between">
          <Logo variant="compact" />
          <Link href="/dashboard" className="text-gray-600">Back to Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center mb-6">
            <Icons.User className="w-12 h-12 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-800">Identity Verification</h1>
            <p className="text-gray-500 text-sm mt-2">Verify your identity to unlock all features</p>
          </div>

          {kycStatus === 'pending' ? (
            <div className="text-center py-8">
              <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
                Your KYC is pending review. We'll notify you once verified.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {message && (
                <div className={`p-3 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">NIN (National Identification Number)</label>
                <input
                  type="text"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                  placeholder="12345678901"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">11-digit NIN from NIMC</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">BVN (Bank Verification Number)</label>
                <input
                  type="text"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value)}
                  placeholder="12345678901"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">11-digit BVN from your bank</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Why we need this:</strong> Your information is encrypted and used only for regulatory compliance. We never share your data.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
