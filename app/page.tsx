'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-md py-3 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Logo variant="compact" />
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary transition">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary transition">
              How It Works
            </a>
            <a href="#investors" className="text-gray-600 hover:text-primary transition">
              Investors
            </a>
          </div>
          <Link
            href="/auth/signin"
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-green-600 transition shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 text-center px-4">
        <div className="inline-block bg-green-100 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
          Nigeria's First P2P Energy Marketplace
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
          Trade Energy With{' '}
          <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Your Neighbors
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          EnerShare enables households, businesses, and microgrid operators
          to buy, sell, store, and transfer electricity units in real-time
          across Nigeria and Pan-Africa.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition shadow-lg inline-block"
          >
            Start Earning Today →
          </Link>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-primary hover:text-primary transition"
          >
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">₦4.2T</div>
            <div className="text-gray-500 text-sm">Market Opportunity</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">50K+</div>
            <div className="text-gray-500 text-sm">Target Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">30%</div>
            <div className="text-gray-500 text-sm">Average Savings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-gray-500 text-sm">Energy Trading</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EnerShare?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to participate in the new energy economy
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-primary mb-4">
                <Icons.Trade className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Peer-to-Peer Trading</h3>
              <p className="text-gray-500">Buy and sell electricity directly with your neighbors. No middlemen, better prices.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-primary mb-4">
                <Icons.Chart className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">AI Dynamic Pricing</h3>
              <p className="text-gray-500">Our AI analyzes supply and demand in real-time to recommend the best prices.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-primary mb-4">
                <Icons.Solar className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Multi-Source Support</h3>
              <p className="text-gray-500">Solar, Generator, Grid, Battery — all energy sources are supported.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-primary mb-4">
                <Icons.Wallet className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Instant Payments</h3>
              <p className="text-gray-500">Get paid instantly when you sell energy. Withdraw to your bank account.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-primary mb-4">
                <Icons.Lightning className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Meter Ready</h3>
              <p className="text-gray-500">Real-time monitoring of your generation, consumption, and earnings.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-primary mb-4">
                <Icons.Carbon className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Carbon Credits</h3>
              <p className="text-gray-500">Earn additional revenue by selling your carbon offsets.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to start trading energy</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Connect Your Meter</h3>
              <p className="text-gray-500">Link your smart meter or manually enter your energy data.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">List Your Surplus</h3>
              <p className="text-gray-500">Set your price and amount — our AI helps you optimize.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Start Trading</h3>
              <p className="text-gray-500">Sell to neighbors or buy from them. Get paid instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investors Section */}
      <div id="investors" className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">Built for Scale</h2>
              <p className="text-xl text-gray-300 mb-6">
                EnerShare is addressing a ₦4.2 trillion market opportunity with a clear path to exit.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Icons.Check className="w-5 h-5 text-primary" />
                  <span>5-year projected valuation: ₦18-35 Billion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icons.Check className="w-5 h-5 text-primary" />
                  <span>Break-even by Month 22 post-launch</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icons.Check className="w-5 h-5 text-primary" />
                  <span>Strategic acquisition targets: MTN, Airtel, Engie</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icons.Check className="w-5 h-5 text-primary" />
                  <span>Pan-African expansion ready</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-2xl p-8 backdrop-blur">
              <h3 className="text-2xl font-bold text-center mb-6">Projected Growth</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-600 py-3">
                  <span className="font-semibold">Year 1</span>
                  <span>5,000 users</span>
                  <span className="text-primary">₦18M</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-600 py-3">
                  <span className="font-semibold">Year 2</span>
                  <span>50,000 users</span>
                  <span className="text-primary">₦216M</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-600 py-3">
                  <span className="font-semibold">Year 3</span>
                  <span>150,000 users</span>
                  <span className="text-primary">₦810M</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-semibold">Year 5</span>
                  <span>750,000 users</span>
                  <span className="text-primary">₦5.4B</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-green-500 to-blue-500">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Join the Energy Revolution?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start earning from your energy assets today. It's free to join.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-primary px-8 py-3 rounded-full font-semibold hover:shadow-lg transition"
          >
            Create Free Account →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Logo variant="compact" className="text-white" />
              <p className="text-sm mt-3">Building Africa's decentralized energy future.</p>
              <p className="text-xs mt-2">Nigeria & Pan-Africa</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Smart Meters</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#investors" className="hover:text-white">Investors</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Regulatory</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} EnerShare. Peer-to-Peer Energy Trading Platform for Nigeria & Pan-Africa.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
