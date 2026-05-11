'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Icons } from './icons'

export default function Navbar() {
  const { user, signOut, profile } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Public links always visible; auth-required links only shown when signed in
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/marketplace', label: 'Marketplace', authRequired: true },
    { href: '/dashboard', label: 'Dashboard', authRequired: true },
    { href: '/wallet', label: 'Wallet', authRequired: true },
    { href: '/pricing', label: 'Pricing' },
    { href: '/faq', label: 'FAQ' },
    { href: '/waitlist', label: 'Waitlist' },
  ]

  const filteredLinks = navLinks.filter(link => !link.authRequired || user)

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  const closeMobile = () => setMobileMenuOpen(false)

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Icons.Lightning className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg sm:text-xl text-white">EnerShare</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {filteredLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:text-green-500 transition text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              {/* Only admins see the Admin link */}
              {profile?.is_admin && (
                <Link
                  href="/admin"
                  className="text-purple-400 hover:text-purple-300 transition text-sm font-medium"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 transition text-sm font-medium min-h-[44px]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-gray-300 hover:text-green-500 transition text-sm font-medium min-h-[44px] inline-flex items-center"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <Icons.Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-b border-gray-700 py-4 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-1 px-4">
            {filteredLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-green-500 py-3 px-2 text-base min-h-[44px] flex items-center rounded-lg"
                onClick={closeMobile}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                {/* Admin link only for admins */}
                {profile?.is_admin && (
                  <Link
                    href="/admin"
                    className="text-purple-400 hover:text-purple-300 py-3 px-2 text-base min-h-[44px] flex items-center rounded-lg"
                    onClick={closeMobile}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); closeMobile() }}
                  className="text-red-400 hover:text-red-300 py-3 px-2 text-left text-base min-h-[44px] flex items-center rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-gray-300 hover:text-green-500 py-3 px-2 text-base min-h-[44px] flex items-center rounded-lg"
                  onClick={closeMobile}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-green-600 text-white px-4 py-3 rounded-lg text-center text-base min-h-[44px] mt-1"
                  onClick={closeMobile}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}