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

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/marketplace', label: 'Marketplace', authRequired: true },
    { href: '/dashboard', label: 'Dashboard', authRequired: true },
    { href: '/wallet', label: 'Wallet', authRequired: true },
    { href: '/pricing', label: 'Pricing' },
    { href: '/faq', label: 'FAQ' },
    { href: '/waitlist', label: 'Waitlist' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  const filteredLinks = navLinks.filter(link => 
    !link.authRequired || (link.authRequired && user)
  )

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
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
          {filteredLinks.map((link) => (
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
              {profile?.role === 'admin' && (
                <Link href="/admin" className="text-gray-300 hover:text-green-500 transition text-sm font-medium">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 transition text-sm font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="text-gray-300 hover:text-green-500 transition text-sm font-medium">
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
          className="md:hidden text-white focus:outline-none"
        >
          <Icons.Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-b border-gray-700 py-4">
          <div className="flex flex-col gap-3 px-4">
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
            
            {user ? (
              <>
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="text-gray-300 hover:text-green-500 py-2" onClick={() => setMobileMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout()
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
  )
}