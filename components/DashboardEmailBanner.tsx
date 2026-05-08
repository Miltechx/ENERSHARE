'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { Icons } from './icons'

export default function DashboardEmailBanner() {
  const { user } = useAuth()
  const [cooldown, setCooldown] = useState(0)

  if (!user || user.emailVerified) return null

  const handleResend = async () => {
    if (cooldown > 0) return
    try {
      await sendEmailVerification(user)
      setCooldown(60)
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Failed to resend:', error)
    }
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Icons.Lightning className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-300">
            Your email is not verified. Some features are locked.
          </span>
        </div>
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-sm text-green-500 hover:underline disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
        </button>
      </div>
    </div>
  )
}