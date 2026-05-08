'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icons } from './icons'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('enershare_cookie_consent')
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('enershare_cookie_consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('enershare_cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-800 border-t border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <Icons.Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span>
            We use cookies to improve your experience on EnerShare.
            By continuing, you agree to our{' '}
            <Link href="/privacy" className="text-green-500 hover:underline">
              Privacy Policy
            </Link>{' '}
            and the use of essential and analytics cookies.
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}