'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'

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
          <Logo variant={scrolled ? 'compact' : 'full'} />
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary transition">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary transition">How It Works</a>
            <a href="#stats" className="text-gray-600 hover:text-primary transition">Impact</a>
            <a href="#investors" className="text-gray-600 hover:text-primary transition">Investors</a>
          </div>
          <Link href="/auth/signin" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-green-600 transition shadow-lg">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-white"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-green-100 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-pulse">
            Nigeria's First P2P Energy Marketplace
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Trade Energy With
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Your Neighbors</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            EnerShare turns every solar panel, generator, and grid connection into a revenue stream.
            Sell your surplus, buy from your community, and join Africa's decentralized energy revolution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition shadow-lg transform hover:scale-105">
              Start Earning Today →
            </Link>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-primary hover:text-primary transition">
              Watch Demo
            </button>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-3xl font-bold text-primary">₦4.2T</div>
              <div className="text-gray-500 text-sm">Market Opportunity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-gray-500 text-sm">Target Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📉</div>
              <div className="text-3xl font-bold text-primary">30%</div>
              <div className="text-gray-500 text-sm">Avg Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-gray-500 text-sm">Trading</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EnerShare?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to participate in the new energy economy
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Icons.Trade className="w-8 h-8" />, title: "P2P Trading", desc: "Buy and sell electricity directly with neighbors. No middlemen." },
              { icon: <Icons.Chart className="w-8 h-8" />, title: "AI Pricing", desc: "Real-time price optimization based on supply and demand." },
              { icon: <Icons.Solar className="w-8 h-8" />, title: "Multi-Source", desc: "Solar, Generator, Grid, Battery — all supported." },
              { icon: <Icons.Wallet className="w-8 h-8" />, title: "Instant Payments", desc: "Get paid instantly when you sell energy." },
              { icon: <Icons.Lightning className="w-8 h-8" />, title: "Smart Meter", desc: "Real-time monitoring of generation and usage." },
              { icon: <Icons.Carbon className="w-8 h-8" />, title: "Carbon Credits", desc: "Earn additional revenue from carbon offsets." },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-2">
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Preview */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">See It In Action</h2>
            <p className="text-xl text-gray-600">Live demo — click and experience the platform</p>
          </div>
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-2 flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="flex-1 text-center text-gray-400 text-sm">EnerShare Dashboard Preview</div>
            </div>
            <div className="p-1">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <p className="text-sm">Wallet Balance</p>
                    <p className="text-2xl font-bold">₦12,450</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-white">
                    <p className="text-sm">Energy Sold</p>
                    <p className="text-2xl font-bold">342 kWh</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-white">
                    <p className="text-sm">Carbon Saved</p>
                    <p className="text-2xl font-bold">187 kg</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-white">
                    <p className="text-sm">Active Trades</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/auth/signup" className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition inline-flex items-center space-x-2">
              <span>Try Live Demo</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Investors Section */}
      <section id="investors" className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">Built for Scale</h2>
              <p className="text-xl text-gray-300 mb-6">
                EnerShare is addressing a ₦4.2 trillion market opportunity with a clear path to exit.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3"><Icons.Check className="w-5 h-5 text-primary" /><span>5-year projected valuation: ₦18-35 Billion</span></div>
                <div className="flex items-center space-x-3"><Icons.Check className="w-5 h-5 text-primary" /><span>Break-even by Month 22 post-launch</span></div>
                <div className="flex items-center space-x-3"><Icons.Check className="w-5 h-5 text-primary" /><span>Strategic acquisition targets: MTN, Airtel, Engie</span></div>
                <div className="flex items-center space-x-3"><Icons.Check className="w-5 h-5 text-primary" /><span>Pan-African expansion ready</span></div>
              </div>
              <button className="mt-8 bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition">
                View Investor Deck →
              </button>
            </div>
            <div className="bg-gray-700/50 rounded-2xl p-8 backdrop-blur">
              <h3 className="text-2xl font-bold text-center mb-6">Projected Growth</h3>
              <div className="space-y-4">
                {[{ year: "Year 1", users: "5,000", revenue: "₦18M" }, { year: "Year 2", users: "50,000", revenue: "₦216M" }, { year: "Year 3", users: "150,000", revenue: "₦810M" }, { year: "Year 5", users: "750,000", revenue: "₦5.4B" }].map((item) => (
                  <div key={item.year} className="flex justify-between items-center border-b border-gray-600 py-3">
                    <span className="font-semibold">{item.year}</span>
                    <span>{item.users} users</span>
                    <span className="text-primary">{item.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-blue-500">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Join the Energy Revolution?</h2>
          <p className="text-xl mb-8 opacity-90">Start earning from your energy assets today. It's free to join.</p>
          <Link href="/auth/signup" className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:shadow-lg transition inline-flex items-center space-x-2">
            <span>Create Free Account</span>
            <Icons.ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div><Logo variant="compact" className="text-white" /><p className="text-sm mt-3">Building Africa's decentralized energy future.</p></div>
            <div><h4 className="text-white font-semibold mb-4">Product</h4><ul className="space-y-2 text-sm"><li><a href="#features" className="hover:text-white">Features</a></li><li><a href="#pricing" className="hover:text-white">Pricing</a></li><li><a href="#" className="hover:text-white">Smart Meters</a></li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Company</h4><ul className="space-y-2 text-sm"><li><a href="#" className="hover:text-white">About</a></li><li><a href="#investors" className="hover:text-white">Investors</a></li><li><a href="#" className="hover:text-white">Careers</a></li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Legal</h4><ul className="space-y-2 text-sm"><li><a href="#" className="hover:text-white">Privacy</a></li><li><a href="#" className="hover:text-white">Terms</a></li><li><a href="#" className="hover:text-white">Regulatory</a></li></ul></div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} EnerShare. Peer-to-Peer Energy Trading Platform for Nigeria & Pan-Africa.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
