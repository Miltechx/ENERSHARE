'use client'
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white shadow-md py-3 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="font-bold text-xl text-green-600">⚡ EnerShare</span>
          <Link href="/auth/signin" className="bg-green-600 text-white px-6 py-2 rounded-full">
            Get Started
          </Link>
        </div>
      </nav>
      <div className="pt-32 text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Trade Energy With <span className="text-green-600">Your Neighbors</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          EnerShare enables households, businesses, and microgrid operators
          to buy, sell, and transfer electricity in real-time.
        </p>
        <Link href="/auth/signup" className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold">
          Start Earning Today →
        </Link>
      </div>
    </div>
  )
}
