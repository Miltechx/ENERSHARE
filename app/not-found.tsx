'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Icons } from '@/components/icons'

export default function NotFound() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6 relative">
          <Icons.Lightning className="w-full h-full text-gray-700" />
          <div className="absolute inset-0 animate-pulse">
            <Icons.Lightning className="w-full h-full text-green-500 opacity-20" />
          </div>
        </div>
        <h1 className="text-8xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-2">This page doesn't exist or the energy ran out.</p>
        <p className="text-gray-500 mb-8">The page you're looking for cannot be found.</p>
        <Link
          href={user ? '/dashboard' : '/'}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          <Icons.ArrowRight className="w-5 h-5" />
          {user ? 'Go to Dashboard' : 'Go Home'}
        </Link>
      </div>
    </div>
  )
}