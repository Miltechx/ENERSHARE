'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Icons } from '@/components/icons'

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic'

const faqCategories = [
  {
    name: 'Getting Started',
    articles: [
      { q: 'What is EnerShare and how does it work?', a: 'EnerShare is Nigeria\'s first peer-to-peer energy trading platform. It connects energy producers (solar/generator owners) with consumers who need electricity. Producers list their surplus energy, consumers buy it, and the platform handles payments and delivery.' },
      { q: 'How do I sign up and set up my account?', a: 'Click "Get Started" on the homepage, fill in your details, verify your email, complete the onboarding wizard to set your location and role, and you\'re ready to trade.' },
      { q: 'What documents do I need for KYC verification?', a: 'You need your NIN (National Identification Number). For producers, additional verification may be required.' },
      { q: 'What Nigerian states is EnerShare available in?', a: 'EnerShare is available nationwide. Listings are filtered by state so you only see nearby energy.' },
    ],
  },
  {
    name: 'Trading Energy',
    articles: [
      { q: 'How do I list my energy for sale?', a: 'Go to "My Listings" → "Create Listing". Enter your energy source, amount available (kWh), price per kWh, and location. Your listing will appear in the marketplace.' },
      { q: 'How do I buy energy from a seller?', a: 'Browse the marketplace, find a listing that matches your needs, click "Buy Now", enter the amount you want, and complete payment via Paystack.' },
      { q: 'What is the 2% platform fee?', a: 'The 2% fee is deducted from the seller\'s payout. Buyers pay the full price shown. The fee covers payment processing and platform maintenance.' },
    ],
  },
  {
    name: 'Wallet & Payments',
    articles: [
      { q: 'How do I fund my EnerShare wallet?', a: 'Click your avatar → "Fund Wallet", enter the amount (min ₦500), and complete payment via Paystack using card, bank transfer, or USSD.' },
      { q: 'How do I withdraw my earnings?', a: 'Click your avatar → "Withdraw", enter the amount, your bank details, and submit. Withdrawals take 1-2 business days.' },
      { q: 'What payment methods are accepted?', a: 'Paystack accepts all Nigerian cards, bank transfers, and USSD from major banks.' },
    ],
  },
  {
    name: 'Account & KYC',
    articles: [
      { q: 'Why do I need to verify my identity (KYC)?', a: 'KYC is required by Nigerian financial regulations to prevent fraud and ensure platform safety. Your information is encrypted and secure.' },
      { q: 'My KYC was rejected — what do I do?', a: 'Check the rejection reason in your profile, correct the information, and resubmit. Contact support if you need help.' },
    ],
  },
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Getting Started')
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)

  const allArticles = faqCategories.flatMap(cat =>
    cat.articles.map(article => ({ ...article, category: cat.name }))
  )

  const filteredArticles = searchTerm
    ? allArticles.filter(a =>
        a.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqCategories.find(c => c.name === activeCategory)?.articles || []

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Help Center</h1>
          <p className="text-gray-400">Find answers to common questions</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {!searchTerm && (
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-3">
            {faqCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeCategory === cat.name
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {filteredArticles.map((article, idx) => (
            <div key={idx} className="bg-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedArticle(expandedArticle === `${article.category}-${idx}` ? null : `${article.category}-${idx}`)}
                className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-700 transition"
              >
                <span className="text-white font-medium">{article.q}</span>
                <Icons.ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedArticle === `${article.category}-${idx}` ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {expandedArticle === `${article.category}-${idx}` && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-700">
                  <p className="text-gray-400 leading-relaxed">{article.a}</p>
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-700">
                    <span className="text-sm text-gray-500">Was this helpful?</span>
                    <button className="text-green-500 hover:text-green-400">Yes</button>
                    <button className="text-red-500 hover:text-red-400">No</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              <Icons.Mail className="w-4 h-4" /> Email Support
            </Link>
            <a
              href="https://wa.me/2349031617937"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              <Icons.ArrowRight className="w-4 h-4" /> WhatsApp Us
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-3">Response time: within 24 hours</p>
        </div>
      </div>
    </div>
  )
}