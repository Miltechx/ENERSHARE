'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Icons } from '@/components/icons'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    { icon: <Icons.Trade className="w-8 h-8" />, title: "Peer-to-Peer Trading", desc: "Buy and sell electricity directly with your neighbors. No middlemen, better prices." },
    { icon: <Icons.Chart className="w-8 h-8" />, title: "AI Dynamic Pricing", desc: "Our AI analyzes supply and demand in real-time to recommend the best prices." },
    { icon: <Icons.Lightning className="w-8 h-8" />, title: "Live Smart Meter", desc: "Real-time monitoring of your generation, consumption, and earnings." },
    { icon: <Icons.Solar className="w-8 h-8" />, title: "Multi-Source Support", desc: "Solar, Generator, Grid, Battery — all energy sources are supported." },
    { icon: <Icons.Wallet className="w-8 h-8" />, title: "Instant Payments", desc: "Get paid instantly when you sell energy. Withdraw to your bank account." },
    { icon: <Icons.Carbon className="w-8 h-8" />, title: "Carbon Credits", desc: "Earn additional revenue by selling your carbon offsets." },
  ]

  const steps = [
    { number: "01", icon: <Icons.User className="w-8 h-8" />, title: "Sign Up Free", desc: "Create your account in 2 minutes" },
    { number: "02", icon: <Icons.Lightning className="w-8 h-8" />, title: "List Your Energy", desc: "Set your price and amount" },
    { number: "03", icon: <Icons.Wallet className="w-8 h-8" />, title: "Start Earning", desc: "Get paid instantly when you sell" },
  ]

  const testimonials = [
    { name: "Oluwaseun Adeleke", role: "Solar Owner, Lekki", text: "I've earned over ₦50,000 selling my excess solar power. EnerShare changed everything.", rating: 5, initial: "O" },
    { name: "Chidi Nwosu", role: "Homeowner, VI", text: "Buying energy from my neighbor is cheaper than PHCN. Best decision ever.", rating: 5, initial: "C" },
    { name: "Amara Okonkwo", role: "Business Owner, Ikeja", text: "Our generator diesel costs dropped by 40%. The platform is seamless.", rating: 5, initial: "A" },
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icons.Lightning className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              EnerShare
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition font-medium">How It Works</a>
            <a href="#stats" className="text-gray-600 hover:text-green-600 transition font-medium">Impact</a>
            <a href="#testimonials" className="text-gray-600 hover:text-green-600 transition font-medium">Success Stories</a>
          </div>
          <Link href="/auth/signin" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">Now Live in Lagos, Abuja, Port Harcourt</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Trade Energy With
                <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent block lg:inline"> Your Neighbors</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                Turn your solar panels, generator, or battery into a revenue stream.
                Buy and sell electricity instantly with people around you. Save 30% or earn ₦50k+ monthly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Start Earning Free
                </Link>
                <a href="#how-it-works" className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-green-500 hover:text-green-500 transition">
                  Watch Demo
                </a>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20"
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">₦4.2T</div>
                <div className="text-gray-500 text-sm mt-1">Market Opportunity</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">₦50k+</div>
                <div className="text-gray-500 text-sm mt-1">Monthly Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">30%</div>
                <div className="text-gray-500 text-sm mt-1">Average Savings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">24/7</div>
                <div className="text-gray-500 text-sm mt-1">Energy Trading</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EnerShare?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to participate in the new energy economy
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-green-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple 3-Step Process</h2>
            <p className="text-xl text-gray-600">Start trading energy in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((item, idx) => (
              <div key={idx} className="text-center relative">
                {idx < 2 && <div className="hidden md:block absolute top-1/3 -right-6 text-4xl text-gray-300">→</div>}
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white text-3xl font-bold">{item.number}</span>
                </div>
                <div className="text-green-600 mb-3 flex justify-center">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Impact Section */}
      <section id="stats" className="py-24 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Making Real Impact</h2>
              <p className="text-xl text-gray-300 mb-8">
                EnerShare is transforming how Nigerians access and trade energy.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3"><Icons.Check className="w-5 h-5 text-green-400" /><span>₦50M+ in energy trades processed</span></div>
                <div className="flex items-center space-x-3"><Icons.Check className="w-5 h-5 text-green-400" /><span>5,000+ active users across Lagos</span></div>
                <div className="flex items-center space-x-3"><Icons.Check className="w-5 h-5 text-green-400" /><span>100+ solar/generator owners earning</span></div>
                <div className="flex items-center space-x-3"><Icons.Check className="w-5 h-5 text-green-400" /><span>30% average reduction in electricity bills</span></div>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-2xl p-8 backdrop-blur border border-gray-600">
              <div className="text-center mb-6">
                <Icons.Chart className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold">Live Energy Price</h3>
                <p className="text-gray-400">Powered by AI</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400">₦94/kWh</div>
                <p className="text-gray-400 mt-2">Current market average</p>
                <div className="mt-4 flex justify-center space-x-4 text-sm">
                  <span className="text-green-400">↑ 3%</span>
                  <span>vs yesterday</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real stories from real people</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (<Icons.Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-500 to-blue-500">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Join the Energy Revolution?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start earning from your energy assets today. It's free to join.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Create Free Account
            </Link>
            <Link href="/marketplace" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition">
              Browse Marketplace
            </Link>
          </div>
          <p className="text-sm mt-6 opacity-75">No credit card required • Free to list • 2% transaction fee</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Icons.Lightning className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg">EnerShare</span>
              </div>
              <p className="text-sm">Building Africa's decentralized energy future.</p>
              <p className="text-xs mt-2">Nigeria & Pan-Africa</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm"><li><a href="#features" className="hover:text-white">Features</a></li><li><a href="#how-it-works" className="hover:text-white">How It Works</a></li><li><a href="#" className="hover:text-white">Smart Meters</a></li><li><a href="#" className="hover:text-white">Pricing</a></li></ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm"><li><a href="#" className="hover:text-white">About</a></li><li><a href="#" className="hover:text-white">Investors</a></li><li><a href="#" className="hover:text-white">Careers</a></li><li><a href="#" className="hover:text-white">Blog</a></li></ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm"><li><a href="#" className="hover:text-white">Privacy</a></li><li><a href="#" className="hover:text-white">Terms</a></li><li><a href="#" className="hover:text-white">Regulatory</a></li></ul>
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
