'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function UserMenu() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (!session) {
    return (
      <div className="flex space-x-4">
        <Link href="/auth/signin" className="text-gray-600 hover:text-green-600">Sign In</Link>
        <Link href="/auth/signup" className="bg-green-600 text-white px-4 py-2 rounded-lg">Sign Up</Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-green-600"
      >
        <span>{session.user?.email?.split('@')[0]}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
          <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Dashboard</Link>
          <Link href="/dashboard/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
          <Link href="/dashboard/wallet" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Wallet</Link>
          <Link href="/dashboard/referral" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Referrals</Link>
          <hr className="my-1" />
          <button onClick={() => signOut()} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
