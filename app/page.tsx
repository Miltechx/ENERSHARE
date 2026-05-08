'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-xl text-gray-800">EnerShare</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition">How It Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-green-600 transition">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-green-600 transition">FAQ</a>
          </div>
          <div className="flex space-x-4">
            <Link href="/auth/signin" className="text-gray-600 hover:text-green-600 transition">Sign In</Link>
            <Link href="/auth/signup" className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Trade Energy With{' '}
            <span className="text-green-600">Your Neighbors</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Turn your solar panels, generator, or battery into a revenue stream.
            Buy and sell electricity instantly with people around you. Save up to 30% or earn ₦50k+ monthly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition shadow-lg">
              Start Earning Free →
            </Link>
            <a href="#how-it-works" className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-green-600 hover:text-green-600 transition">
              Watch Demo
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
            <div><div className="text-3xl font-bold text-green-600">₦4.2T</div><div className="text-gray-500">Market Size</div></div>
            <div><div className="text-3xl font-bold text-green-600">50K+</div><div className="text-gray-500">Active Users</div></div>
            <div><div className="text-3xl font-bold text-green-600">30%</div><div className="text-gray-500">Savings</div></div>
            <div><div className="text-3xl font-bold text-green-600">24/7</div><div className="text-gray-500">Trading</div></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose EnerShare?</h2>
            <p className="text-xl text-gray-600">Everything you need to participate in the new energy economy</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Peer-to-Peer Trading</h3>
              <p className="text-gray-600">Buy and sell electricity directly with your neighbors. No middlemen.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI Dynamic Pricing</h3>
              <p className="text-gray-600">Our AI analyzes supply and demand to recommend the best prices.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Live Smart Meter</h3>
              <p className="text-gray-600">Real-time monitoring of your generation, consumption, and earnings.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Instant Payments</h3>
              <p className="text-gray-600">Get paid instantly when you sell energy. Withdraw to your bank.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Secure & Transparent</h3>
              <p className="text-gray-600">Blockchain-verified transactions for complete trust and transparency.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">Carbon Credits</h3>
              <p className="text-gray-600">Earn additional revenue by selling your carbon offsets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to start trading energy</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Your Meter</h3>
              <p className="text-gray-600">Link your smart meter or manually enter your energy data.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">List Your Surplus</h3>
              <p className="text-gray-600">Set your price and amount — our AI helps you optimize returns.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Start Earning</h3>
              <p className="text-gray-600">Sell to neighbors or buy from them. Get paid instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">No hidden fees. Pay only when you trade.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">Buyers</h3>
              <p className="text-3xl font-bold text-green-600 mb-4">2%</p>
              <p className="text-gray-600">Transaction fee on each purchase</p>
              <p className="text-sm text-gray-400 mt-4">No subscription fees</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center border-2 border-green-600">
              <h3 className="text-xl font-bold mb-2">Sellers</h3>
              <p className="text-3xl font-bold text-green-600 mb-4">2%</p>
              <p className="text-gray-600">Platform fee on each sale</p>
              <p className="text-sm text-gray-400 mt-4">Free to list</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">Producers</h3>
              <p className="text-3xl font-bold text-green-600 mb-4">Free</p>
              <p className="text-gray-600">First 1000 kWh listed free</p>
              <p className="text-sm text-gray-400 mt-4">No setup costs</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold mb-2">Do I need a smart meter?</h3>
              <p className="text-gray-600">No. You can manually enter your energy readings. Smart meter integration is optional.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold mb-2">How do I get paid?</h3>
              <p className="text-gray-600">Funds go directly to your EnerShare wallet. You can withdraw to your bank account anytime.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold mb-2">Is my data secure?</h3>
              <p className="text-gray-600">Yes. We use bank-level encryption and never share your personal information.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold mb-2">What if the grid goes down?</h3>
              <p className="text-gray-600">Our platform works with or without grid power. Solar and generator owners can still trade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join the Energy Revolution?</h2>
          <p className="text-xl mb-8">Start earning from your energy assets today. It's free to join.</p>
          <Link href="/auth/signup" className="inline-block bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">⚡</span>
                <span className="font-bold text-white text-lg">EnerShare</span>
              </div>
              <p className="text-sm">Building Africa's decentralized energy future.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Investors</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
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
