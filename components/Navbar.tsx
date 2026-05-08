'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import AccountCentre from './AccountCentre'
import { Icons } from './icons'

export default function Navbar() {
  const { user, signOut, profile } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountCentreOpen, setAccountCentreOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size)
    })
    return () => unsubscribe()
  }, [user])

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', roles: ['consumer', 'producer', 'retailer', 'admin'] },
    { href: '/marketplace', label: 'Marketplace', roles: ['consumer', 'producer', 'retailer'] },
    { href: '/wallet', label: 'Wallet', roles: ['consumer', 'producer', 'retailer'] },
    { href: '/listings/mine', label: 'My Listings', roles: ['producer', 'retailer'] },
    { href: '/listings/autosell', label: 'Auto-Sell', roles: ['producer', 'retailer'] },
    { href: '/alerts', label: 'Alerts', roles: ['consumer', 'producer', 'retailer'] },
    { href: '/analytics', label: 'Analytics', roles: ['consumer', 'producer', 'retailer'] },
    { href: '/disputes', label: 'Disputes', roles: ['consumer', 'producer', 'retailer'] },
  ]

  const filteredLinks = navLinks.filter(
    link => link.roles.includes(profile?.role || 'consumer')
  )

  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Icons.Lightning className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">EnerShare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {filteredLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-300 hover:text-green-500 transition text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-300 hover:text-green-500 transition text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => setAccountCentreOpen(true)}
                  className="flex items-center gap-2 text-gray-300 hover:text-green-500 transition"
                >
                  <div className="relative w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Icons.User className="w-4 h-4 text-gray-300" />
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-sm">Account</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-300 hover:text-green-500 transition">Sign In</Link>
                <Link href="/auth/signup" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <Icons.Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 border-b border-gray-700 py-4">
            <div className="flex flex-col gap-3 px-4">
              {user ? (
                <>
                  {filteredLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-gray-300 hover:text-green-500 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link href="/admin" className="text-gray-300 hover:text-green-500 py-2" onClick={() => setMobileMenuOpen(false)}>
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setAccountCentreOpen(true)
                    }}
                    className="text-gray-300 hover:text-green-500 py-2 text-left"
                  >
                    Account
                  </button>
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="text-red-400 hover:text-red-300 py-2 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-300 hover:text-green-500 py-2" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="bg-green-600 text-white px-4 py-2 rounded-lg text-center" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Account Centre Slide-over */}
      <AccountCentre isOpen={accountCentreOpen} onClose={() => setAccountCentreOpen(false)} />
    </>
  )
}