'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Icons.Lightning className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">EnerShare</span>
          </div>
          <Link href="/auth/signin" className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="pt-32 text-center px-6">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Trade Energy With{' '}
          <span className="text-green-600">Your Neighbors</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Turn your solar panels, generator, or battery into a revenue stream.
          Buy and sell electricity instantly with people around you.
        </p>
        <Link href="/auth/signup" className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 inline-block">
          Start Earning Free →
        </Link>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 text-center mt-20">
        <p>&copy; {new Date().getFullYear()} EnerShare. All rights reserved.</p>
      </footer>
    </div>
  )
}