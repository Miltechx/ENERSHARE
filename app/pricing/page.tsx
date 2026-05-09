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
          <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700">
            <Icons.User className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Consumer</h2>
            <p className="text-4xl font-bold text-green-500 mb-4">Free</p>
            <Link href="/auth/signup" className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition">Get Started</Link>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8 text-center border-2 border-green-500">
            <Icons.Solar className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Producer</h2>
            <p className="text-4xl font-bold text-green-500 mb-4">₦5,000<span className="text-lg text-gray-400">/month</span></p>
            <Link href="/auth/signup" className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition">Become a Producer</Link>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700">
            <Icons.Trade className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Retailer</h2>
            <p className="text-4xl font-bold text-green-500 mb-4">₦15,000<span className="text-lg text-gray-400">/month</span></p>
            <Link href="/contact" className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition">Contact Sales</Link>
          </div>
        </div>
        <div className="text-center mt-12 text-gray-400"><p>All plans include a 2% transaction fee on each successful trade.</p></div>
      </div>
    </div>
  )
}
