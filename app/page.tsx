'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icons } from '@/components/icons'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Icons.Lightning className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">EnerShare</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/auth/signin" className="text-gray-300 hover:text-green-500 transition">Sign In</Link>
            <Link href="/auth/signup" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 text-center px-4">
        <h1 className="text-5xl font-bold text-white mb-6">
          Trade Energy With{' '}
          <span className="text-green-500">Your Neighbors</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Turn your solar panels, generator, or battery into a revenue stream.
          Buy and sell electricity instantly with people around you.
        </p>
        <Link href="/auth/signup" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold inline-block">
          Start Earning Free
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
          <div><div className="text-3xl font-bold text-green-500">₦4.2T</div><div className="text-gray-500">Market Size</div></div>
          <div><div className="text-3xl font-bold text-green-500">50K+</div><div className="text-gray-500">Active Users</div></div>
          <div><div className="text-3xl font-bold text-green-500">30%</div><div className="text-gray-500">Avg Savings</div></div>
          <div><div className="text-3xl font-bold text-green-500">24/7</div><div className="text-gray-500">Trading</div></div>
        </div>
      </div>
    </div>
  )
}