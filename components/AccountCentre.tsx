'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Icons } from './icons'

interface AccountCentreProps {
  isOpen: boolean
  onClose: () => void
}

export default function AccountCentre({ isOpen, onClose }: AccountCentreProps) {
  const { user, profile, wallet, refreshWallet } = useAuth()
  const router = useRouter()
  const [liveWallet, setLiveWallet] = useState(wallet)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!user) return
    const unsubscribe = onSnapshot(doc(db, 'wallets', user.uid), (doc) => {
      if (doc.exists()) {
        setLiveWallet(doc.data() as any)
      }
    })
    return () => unsubscribe()
  }, [user])

  const handleSignOut = async () => {
    try {
      const token = await auth.currentUser?.getIdToken()
      await fetch('/api/auth/revoke-session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      await signOut(auth)
      router.push('/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
      await signOut(auth)
      router.push('/auth/signin')
    }
  }

  const handleFundWallet = () => {
    onClose()
    router.push('/wallet?action=topup')
  }

  const handleWithdraw = () => {
    onClose()
    router.push('/wallet?action=withdraw')
  }

  if (!isOpen) return null

  const PanelContent = () => (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 bg-gray-700 rounded-full overflow-hidden">
            {profile?.avatarUrl ? (
              <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icons.User className="w-7 h-7 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">{profile?.fullName || user?.email?.split('@')[0]}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400 capitalize">{profile?.role}</span>
              {profile?.kycStatus === 'verified' && (
                <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Icons.Check className="w-3 h-3" /> KYC Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="p-5 border-b border-gray-700 bg-gray-900/50">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400 text-sm flex items-center gap-2">
            <Icons.Wallet className="w-4 h-4" /> Wallet Balance
          </span>
          <Link href="/wallet" onClick={onClose} className="text-xs text-green-500 hover:underline">Details</Link>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Naira Balance</span>
            <span className="text-white font-semibold">₦{liveWallet?.nairaBalance?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">kWh Balance</span>
            <span className="text-white font-semibold">{liveWallet?.kwhBalance || 0} kWh</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={handleFundWallet}
            className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <Icons.Wallet className="w-4 h-4" /> Fund Wallet
          </button>
          <button
            onClick={handleWithdraw}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <Icons.ArrowRight className="w-4 h-4" /> Withdraw
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="p-4 border-b border-gray-700">
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Quick Links</p>
        <div className="space-y-2">
          <Link href="/listings/mine" onClick={onClose} className="flex items-center gap-3 text-gray-300 hover:text-green-500 transition py-1">
            <Icons.Lightning className="w-4 h-4" /> My Listings
          </Link>
          <Link href="/wallet?tab=history" onClick={onClose} className="flex items-center gap-3 text-gray-300 hover:text-green-500 transition py-1">
            <Icons.Chart className="w-4 h-4" /> Transaction History
          </Link>
          <Link href="/meters" onClick={onClose} className="flex items-center gap-3 text-gray-300 hover:text-green-500 transition py-1">
            <Icons.Solar className="w-4 h-4" /> Meter Readings
          </Link>
          <Link href="/favourites" onClick={onClose} className="flex items-center gap-3 text-gray-300 hover:text-green-500 transition py-1">
            <Icons.Star className="w-4 h-4" /> Saved Listings
          </Link>
        </div>
      </div>

      {/* Account Settings */}
      <div className="p-4 border-b border-gray-700">
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Account</p>
        <div className="space-y-2">
          <Link href="/profile" onClick={onClose} className="flex items-center gap-3 text-gray-300 hover:text-green-500 transition py-1">
            <Icons.User className="w-4 h-4" /> Profile & KYC
          </Link>
          <Link href="/profile?tab=security" onClick={onClose} className="flex items-center gap-3 text-gray-300 hover:text-green-500 transition py-1">
            <Icons.Settings className="w-4 h-4" /> Security Settings
          </Link>
          <Link href="/notifications" onClick={onClose} className="flex items-center gap-3 text-gray-300 hover:text-green-500 transition py-1">
            <Icons.Lightning className="w-4 h-4" /> Notifications
          </Link>
          <Link href="/profile?tab=activity" onClick={onClose} className="flex items-center gap-3 text-gray-300 hover:text-green-500 transition py-1">
            <Icons.Chart className="w-4 h-4" /> Activity Log
          </Link>
        </div>
      </div>

      {/* Support */}
      <div className="p-4 border-b border-gray-700">
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Support</p>
        <div className="space-y-2">
          <Link href="/help" onClick={onClose} className="flex items-center gap-3 text-gray-300 hover:text-green-500 transition py-1">
            <Icons.Check className="w-4 h-4" /> Help Center
          </Link>
          <Link href="/contact" onClick={onClose} className="flex items-center gap-3 text-gray-300 hover:text-green-500 transition py-1">
            <Icons.Mail className="w-4 h-4" /> Contact Support
          </Link>
        </div>
      </div>

      {/* Sign Out */}
      <div className="p-4 mt-auto">
        <button
          onClick={handleSignOut}
          className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          <Icons.Close className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />
        <div className="absolute bottom-0 left-0 right-0 h-[90vh] bg-gray-800 rounded-t-2xl overflow-y-auto">
          <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold">Account</h2>
            <button onClick={onClose} className="text-gray-400">
              <Icons.Close className="w-5 h-5" />
            </button>
          </div>
          <PanelContent />
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex justify-end p-2">
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
          <Icons.Close className="w-5 h-5" />
        </button>
      </div>
      <PanelContent />
    </div>
  )
}