'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { auth } from '@/lib/firebase/client'
import { sendEmailVerification } from 'firebase/auth'
import { Icons } from './icons'

interface VerificationGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function VerificationGate({ children, fallback }: VerificationGateProps) {
  const { user } = useAuth()
  const [isVerified, setIsVerified] = useState(user?.emailVerified || false)
  const [cooldown, setCooldown] = useState(0)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (user) {
      setIsVerified(user.emailVerified)
    }
  }, [user])

  const handleResend = async () => {
    if (!user || cooldown > 0) return
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
      console.error('Failed to resend verification email:', error)
    }
  }

  const handleRefresh = async () => {
    if (!user) return
    setChecking(true)
    try {
      await user.reload()
      setIsVerified(user.emailVerified)
    } catch (error) {
      console.error('Failed to reload user:', error)
    } finally {
      setChecking(false)
    }
  }

  if (!user || isVerified) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Icons.Lightning className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-yellow-500 font-medium">Verify your email to unlock trading</p>
          <p className="text-gray-400 text-sm mt-1">
            We sent a verification link to <span className="text-white">{user.email}</span>
          </p>
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="text-sm text-green-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="text-sm text-green-500 hover:underline"
            >
              {checking ? 'Checking...' : 'I\'ve verified — Refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}