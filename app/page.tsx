'use client'
import BackButton from '@/components/BackButton'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Icons } from '@/components/icons'

export default function LandingPage() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900">
        <BackButton />
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Icons.Lightning className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">EnerShare</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-green-500 transition">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-green-500 transition">How It Works</a>
            <a href="#pricing" className="text-gray-300 hover:text-green-500 transition">Pricing</a>
            <a href="#faq" className="text-gray-300 hover:text-green-500 transition">FAQ</a>
          </div>
          <div className="flex gap-3">
            {user ? (
              <Link href="/dashboard" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-300 hover:text-white px-4 py-2 transition">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-gray-900 to-gray-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Trade Energy With
            <span className="text-green-500 block mt-2">Your Neighbors</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Turn your solar panels, generator, or battery into a revenue stream.
            Buy and sell electricity instantly with people around you. Save up to 30% or earn ₦50k+ monthly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? "/dashboard" : "/auth/signup"} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg">
              {user ? "Go to Dashboard" : "Start Earning Free"}
            </Link>
            <a href="#how-it-works" className="border-2 border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-500 px-8 py-3 rounded-full font-semibold transition">
              Learn More
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
            <div><div className="text-3xl font-bold text-green-500">₦4.2T</div><div className="text-gray-500 text-sm mt-1">Market Size</div></div>
            <div><div className="text-3xl font-bold text-green-500">50K+</div><div className="text-gray-500 text-sm mt-1">Active Users</div></div>
            <div><div className="text-3xl font-bold text-green-500">30%</div><div className="text-gray-500 text-sm mt-1">Avg Savings</div></div>
            <div><div className="text-3xl font-bold text-green-500">24/7</div><div className="text-gray-500 text-sm mt-1">Trading</div></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose EnerShare?</h2>
            <p className="text-xl text-gray-400">Everything you need to participate in the new energy economy</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition">
              <Icons.Trade className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Peer-to-Peer Trading</h3>
              <p className="text-gray-400">Buy and sell electricity directly with your neighbors. No middlemen.</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition">
              <Icons.Chart className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">AI Dynamic Pricing</h3>
              <p className="text-gray-400">Our AI analyzes supply and demand to recommend the best prices.</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition">
              <Icons.Wallet className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Instant Payments</h3>
              <p className="text-gray-400">Get paid instantly when you sell energy. Withdraw to your bank.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Icons.Lightning className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg">EnerShare</span>
              </div>
              <p className="text-sm">Building Africa's decentralized energy future.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-green-500">Features</a></li>
                <li><a href="#pricing" className="hover:text-green-500">Pricing</a></li>
                <li><Link href="/waitlist" className="hover:text-green-500">Join Waitlist</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-green-500">About</Link></li>
                <li><Link href="/contact" className="hover:text-green-500">Contact</Link></li>
                <li><Link href="/help" className="hover:text-green-500">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-green-500">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-green-500">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} EnerShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}