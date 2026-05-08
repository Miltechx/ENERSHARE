'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Icons } from './icons'

export default function ReferralSection() {
  const { profile } = useAuth()
  const [copied, setCopied] = useState(false)

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/signup?ref=${profile?.referralCode}`
    : ''

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnWhatsApp = () => {
    const message = `I've been trading energy with EnerShare — Nigeria's first P2P energy marketplace. Join with my link and we both get rewards: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icons.Lightning className="w-6 h-6 text-green-500" />
        <h3 className="text-lg font-semibold text-white">Referral Program</h3>
      </div>

      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-2">Your Referral Code</p>
        <div className="flex gap-2">
          <code className="flex-1 px-4 py-3 bg-gray-900 rounded-lg text-green-400 font-mono text-center text-lg tracking-wider">
            {profile?.referralCode || 'Loading...'}
          </code>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={copyToClipboard}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          <Icons.Check className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={shareOnWhatsApp}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          <Icons.ArrowRight className="w-4 h-4" />
          Share on WhatsApp
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
        <div>
          <p className="text-gray-500 text-sm">People referred</p>
          <p className="text-2xl font-bold text-white">{profile?.referralCount || 0}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">kWh earned</p>
          <p className="text-2xl font-bold text-green-500">{profile?.referralRewardKwh || 0} kWh</p>
        </div>
      </div>
    </div>
  )
}