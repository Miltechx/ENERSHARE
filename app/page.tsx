'use client'

import Link from 'next/link'
import { Icons } from '@/components/icons'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900">

      {/* Hero Section — pt-24 accounts for the fixed global Navbar height */}
      <section className="relative pt-24 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Trade Energy With{' '}
            <span className="text-green-500">Your Neighbors</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Turn your solar panels, generator, or battery into a revenue stream.
            Buy and sell electricity instantly with people around you. Save up to 30% or earn ₦50k+ monthly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition inline-flex items-center justify-center gap-2"
            >
              <Icons.Lightning className="w-5 h-5" />
              Start Earning Free
            </Link>
            <Link
              href="/marketplace"
              className="border border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-500 px-8 py-3 rounded-full font-semibold transition"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-500">₦4.2T</div>
              <div className="text-gray-500 mt-1">Market Size</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-500">50K+</div>
              <div className="text-gray-500 mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-500">30%</div>
              <div className="text-gray-500 mt-1">Average Savings</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-500">24/7</div>
              <div className="text-gray-500 mt-1">Trading</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose EnerShare?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Lightning className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Peer-to-Peer Trading</h3>
              <p className="text-gray-400">Buy and sell electricity directly with your neighbors. No middlemen.</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Chart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Dynamic Pricing</h3>
              <p className="text-gray-400">Our AI analyzes supply and demand to recommend the best prices.</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant Payments</h3>
              <p className="text-gray-400">Get paid instantly when you sell energy. Withdraw to your bank.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join the Energy Revolution?</h2>
          <p className="text-gray-400 mb-8">Start earning from your energy assets today. It&apos;s free to join.</p>
          <Link
            href="/auth/signup"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition inline-flex items-center gap-2"
          >
            <Icons.Lightning className="w-5 h-5" />
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800 text-center text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto">
          <p>&copy; {new Date().getFullYear()} EnerShare. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="hover:text-green-500">Privacy</Link>
            <Link href="/terms" className="hover:text-green-500">Terms</Link>
            <Link href="/contact" className="hover:text-green-500">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}