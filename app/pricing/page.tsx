'use client'

import Link from 'next/link'
import BackButton from '@/components/BackButton'
import { Icons } from '@/components/icons'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackButton />
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-400">No hidden fees. Pay only when you trade.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Consumer Plan */}
          <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Consumer</h2>
            <p className="text-4xl font-bold text-green-500 mb-4">Free</p>
            <ul className="space-y-3 text-left text-gray-400 mb-8">
              <li className="flex items-center gap-2">✓ Buy energy from producers</li>
              <li className="flex items-center gap-2">✓ Real-time pricing</li>
              <li className="flex items-center gap-2">✓ Transaction history</li>
              <li className="flex items-center gap-2">✓ No monthly fees</li>
            </ul>
            <Link href="/auth/signup" className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition">
              Get Started
            </Link>
          </div>

          {/* Producer Plan */}
          <div className="bg-gray-800 rounded-2xl p-8 text-center border-2 border-green-500">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.Solar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Producer</h2>
            <p className="text-4xl font-bold text-green-500 mb-4">₦5,000<span className="text-lg text-gray-400">/month</span></p>
            <ul className="space-y-3 text-left text-gray-400 mb-8">
              <li className="flex items-center gap-2">✓ List unlimited energy</li>
              <li className="flex items-center gap-2">✓ AI pricing recommendations</li>
              <li className="flex items-center gap-2">✓ Smart meter integration</li>
              <li className="flex items-center gap-2">✓ Priority support</li>
            </ul>
            <Link href="/auth/signup" className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition">
              Become a Producer
            </Link>
          </div>

          {/* Retailer Plan */}
          <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.Trade className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Retailer</h2>
            <p className="text-4xl font-bold text-green-500 mb-4">₦15,000<span className="text-lg text-gray-400">/month</span></p>
            <ul className="space-y-3 text-left text-gray-400 mb-8">
              <li className="flex items-center gap-2">✓ Everything in Producer</li>
              <li className="flex items-center gap-2">✓ Bulk purchase discounts</li>
              <li className="flex items-center gap-2">✓ Resell to multiple buyers</li>
              <li className="flex items-center gap-2">✓ Dedicated account manager</li>
            </ul>
            <Link href="/auth/signup" className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition">
              Contact Sales
            </Link>
          </div>
        </div>

        <div className="text-center mt-12 text-gray-400">
          <p>All plans include a 2% transaction fee on each successful trade.</p>
        </div>
      </div>
    </div>
  )
}