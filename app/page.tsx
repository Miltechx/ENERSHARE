'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Logo variant={scrolled ? 'compact' : 'full'} />
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary transition">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary transition">How It Works</a>
            <a href="#investors" className="text-gray-600 hover:text-primary transition">Investors</a>
          </div>
          <Link href="/auth/signin" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-green-600 transition shadow-lg">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-white"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-green-100 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-pulse">
            Nigeria's First P2P Energy Marketplace
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Trade Energy With
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Your Neighbors</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            EnerShare enables households, businesses, and microgrid operators to buy, sell, store, and transfer electricity units in real-time across Nigeria and Pan-Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition shadow-lg transform hover:scale-105">
              Start Earning Today →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            <div className="text-center"><div className="text-3xl mb-2">💰</div><div className="text-3xl font-bold text-primary">₦4.2T</div><div className="text-gray-500 text-sm">Market Opportunity</div></div>
            <div className="text-center"><div className="text-3xl mb-2">👥</div><div className="text-3xl font-bold text-primary">50K+</div><div className="text-gray-500 text-sm">Target Users</div></div>
            <div className="text-center"><div className="text-3xl mb-2">📉</div><div className="text-3xl font-bold text-primary">30%</div><div className="text-gray-500 text-sm">Avg Savings</div></div>
            <div className="text-center"><div className="text-3xl mb-2">⚡</div><div className="text-3xl font-bold text-primary">24/7</div><div className="text-gray-500 text-sm">Trading</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
