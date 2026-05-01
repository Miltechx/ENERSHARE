'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

export default function ReferralPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [referralCode, setReferralCode] = useState('')
  const [referralCount, setReferralCount] = useState(0)
  const [totalBonus, setTotalBonus] = useState(0)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/auth/signin')
  }, [sessionStatus, router])

  useEffect(() => {
    if (session?.user) {
      fetchReferralData()
    }
  }, [session])

  const fetchReferralData = async () => {
    const supabase = createClient()

    // Get or create referral code
    let { data: referral } = await supabase
      .from('referrals')
      .select('referral_code, total_referrals, total_bonus')
      .eq('user_id', session?.user?.id)
      .single()

    if (referral) {
      setReferralCode(referral.referral_code)
      setReferralCount(referral.total_referrals || 0)
      setTotalBonus(referral.total_bonus || 0)
    } else {
      // Create referral code
      const res = await fetch('/api/referral/create', { method: 'POST' })
      const data = await res.json()
      setReferralCode(data.referral_code)
    }
    setLoading(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/signup?ref=${referralCode}`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo variant="compact" />
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary transition">Dashboard</Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-primary transition">Marketplace</Link>
              <Link href="/dashboard/referral" className="text-primary font-semibold">Refer & Earn</Link>
              <Link href="/marketplace/sell" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm">
                + Sell Energy
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Refer & Earn ₦1,000</h1>
          <p className="text-white/80">Invite friends to EnerShare and earn ₦1,000 for each friend who joins and completes KYC</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Icons.User className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{referralCount}</p>
            <p className="text-gray-500 text-sm">Friends Joined</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Icons.Wallet className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">₦{totalBonus.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">Total Earned</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Icons.Lightning className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-primary">₦1,000</p>
            <p className="text-gray-500 text-sm">Per Referral</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Referral Link</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            <button
              onClick={copyToClipboard}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Share this link with friends. When they sign up and complete KYC, you both get ₦1,000!
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <p className="font-semibold">Share Your Link</p>
              <p className="text-sm text-gray-500">Send your unique referral link to friends</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <p className="font-semibold">Friend Signs Up</p>
              <p className="text-sm text-gray-500">They create an account using your link</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <p className="font-semibold">Both Get ₦1,000</p>
              <p className="text-sm text-gray-500">After they complete KYC verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
