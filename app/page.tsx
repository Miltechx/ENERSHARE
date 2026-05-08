'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

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
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
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
            <Link
              href="/auth/signup"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg"
            >
              Start Earning Free
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-500 px-8 py-3 rounded-full font-semibold transition"
            >
              Watch Demo
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
            <div>
              <div className="text-3xl font-bold text-green-500">₦4.2T</div>
              <div className="text-gray-500 text-sm mt-1">Market Size</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500">50K+</div>
              <div className="text-gray-500 text-sm mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500">30%</div>
              <div className="text-gray-500 text-sm mt-1">Avg Savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500">24/7</div>
              <div className="text-gray-500 text-sm mt-1">Trading</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose EnerShare?</h2>
            <p className="text-xl text-gray-400">Everything you need to participate in the new energy economy</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Peer-to-Peer Trading</h3>
              <p className="text-gray-400">Buy and sell electricity directly with your neighbors. No middlemen.</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-2">AI Dynamic Pricing</h3>
              <p className="text-gray-400">Our AI analyzes supply and demand to recommend the best prices.</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Payments</h3>
              <p className="text-gray-400">Get paid instantly when you sell energy. Withdraw to your bank.</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">Secure & Transparent</h3>
              <p className="text-gray-400">Blockchain-verified transactions for complete trust and transparency.</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Live Smart Meter</h3>
              <p className="text-gray-400">Real-time monitoring of your generation, consumption, and earnings.</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-white mb-2">Carbon Credits</h3>
              <p className="text-gray-400">Earn additional revenue by selling your carbon offsets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Three simple steps to start trading energy</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Meter</h3>
              <p className="text-gray-400">Link your smart meter or manually enter your energy data.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">List Your Surplus</h3>
              <p className="text-gray-400">Set your price and amount — our AI helps you optimize returns.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Start Earning</h3>
              <p className="text-gray-400">Sell to neighbors or buy from them. Get paid instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400">No hidden fees. Pay only when you trade.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-900 p-8 rounded-xl text-center border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-2">Buyers</h3>
              <p className="text-4xl font-bold text-green-500 mb-4">2%</p>
              <p className="text-gray-400">Transaction fee on each purchase</p>
              <p className="text-sm text-gray-500 mt-4">No subscription fees</p>
            </div>
            <div className="bg-gray-900 p-8 rounded-xl text-center border-2 border-green-500">
              <h3 className="text-xl font-bold text-white mb-2">Sellers</h3>
              <p className="text-4xl font-bold text-green-500 mb-4">2%</p>
              <p className="text-gray-400">Platform fee on each sale</p>
              <p className="text-sm text-gray-500 mt-4">Free to list</p>
            </div>
            <div className="bg-gray-900 p-8 rounded-xl text-center border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-2">Producers</h3>
              <p className="text-4xl font-bold text-green-500 mb-4">Free</p>
              <p className="text-gray-400">First 1000 kWh listed free</p>
              <p className="text-sm text-gray-500 mt-4">No setup costs</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-white mb-2">Do I need a smart meter?</h3>
              <p className="text-gray-400">No. You can manually enter your energy readings. Smart meter integration is optional.</p>
            </div>
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-white mb-2">How do I get paid?</h3>
              <p className="text-gray-400">Funds go directly to your EnerShare wallet. You can withdraw to your bank account anytime.</p>
            </div>
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-white mb-2">Is my data secure?</h3>
              <p className="text-gray-400">Yes. We use bank-level encryption and never share your personal information.</p>
            </div>
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-white mb-2">What if the grid goes down?</h3>
              <p className="text-gray-400">Our platform works with or without grid power. Solar and generator owners can still trade.</p>
            </div>
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-white mb-2">What payment methods are accepted?</h3>
              <p className="text-gray-400">We accept all major cards and bank transfers via Paystack, Nigeria's leading payment gateway.</p>
            </div>
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-white mb-2">Is EnerShare a licensed DISCO?</h3>
              <p className="text-gray-400">No. EnerShare is a technology marketplace that connects buyers and sellers. We do not distribute electricity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-700 to-green-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Join the Energy Revolution?</h2>
          <p className="text-xl text-white/90 mb-8">Start earning from your energy assets today. It's free to join.</p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
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
                <li><a href="#faq" className="hover:text-green-500">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-green-500">About</Link></li>
                <li><Link href="/contact" className="hover:text-green-500">Contact</Link></li>
                <li><a href="#" className="hover:text-green-500">Careers</a></li>
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
            <p>EnerShare is a technology marketplace. We are not a licensed DISCO.</p>
            <p className="mt-2">&copy; {new Date().getFullYear()} EnerShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}