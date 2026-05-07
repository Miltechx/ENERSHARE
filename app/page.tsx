'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
<<<<<<< HEAD
=======
import { motion } from 'framer-motion'
>>>>>>> 74fb2ebd16d94255088639c16fce612e2408c365
import { Icons } from '@/components/icons'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

<<<<<<< HEAD
  return (
    <div className="min-h-screen bg-white">
=======
  const features = [
    { icon: <Icons.Trade className="w-8 h-8" />, title: "Peer-to-Peer Trading", desc: "Buy and sell electricity directly with your neighbors." },
    { icon: <Icons.Chart className="w-8 h-8" />, title: "AI Dynamic Pricing", desc: "Real-time price optimization based on supply and demand." },
    { icon: <Icons.Lightning className="w-8 h-8" />, title: "Live Smart Meter", desc: "Real-time monitoring of your energy usage." },
    { icon: <Icons.Wallet className="w-8 h-8" />, title: "Instant Payments", desc: "Get paid instantly when you sell energy." },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
>>>>>>> 74fb2ebd16d94255088639c16fce612e2408c365
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

<<<<<<< HEAD
=======
      {/* Hero Section */}
>>>>>>> 74fb2ebd16d94255088639c16fce612e2408c365
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
<<<<<<< HEAD
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 text-center mt-20">
=======

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
          <div><div className="text-3xl font-bold text-green-600">₦4.2T</div><div className="text-gray-500">Market Opportunity</div></div>
          <div><div className="text-3xl font-bold text-green-600">₦50k+</div><div className="text-gray-500">Monthly Earnings</div></div>
          <div><div className="text-3xl font-bold text-green-600">30%</div><div className="text-gray-500">Average Savings</div></div>
          <div><div className="text-3xl font-bold text-green-600">24/7</div><div className="text-gray-500">Energy Trading</div></div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose EnerShare?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-green-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
>>>>>>> 74fb2ebd16d94255088639c16fce612e2408c365
        <p>&copy; {new Date().getFullYear()} EnerShare. All rights reserved.</p>
      </footer>
    </div>
  )
}