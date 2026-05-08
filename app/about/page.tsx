'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-white mb-6">About EnerShare</h1>

        <div className="space-y-8 text-gray-300">
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-3">Our Mission</h2>
            <p className="leading-relaxed">
              To democratize energy access across Africa by creating a decentralized marketplace
              where every household can buy, sell, and trade electricity.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-3">The Problem</h2>
            <p className="leading-relaxed">
              Nigeria has over 220 million people but less than 5,000MW of grid capacity.
              Solar and generator owners waste surplus energy while neighbors pay 30-60% more than necessary.
              There is no existing platform for peer-to-peer energy trading.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-3">Our Solution</h2>
            <p className="leading-relaxed">
              EnerShare is a peer-to-peer energy marketplace that connects energy producers with consumers.
              We enable households, businesses, and microgrid operators to buy, sell, and transfer
              electricity units in real-time, creating a new digital energy economy.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-3">The Team</h2>
            <p className="leading-relaxed">
              We are a passionate team of energy, technology, and finance experts committed to
              solving Africa's energy crisis through innovation and decentralization.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/auth/signup" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
            Join the Energy Revolution
          </Link>
        </div>
      </div>
    </div>
  )
}