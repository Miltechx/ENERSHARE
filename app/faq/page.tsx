'use client'

import { useState } from 'react'
import BackButton from '@/components/BackButton'
import { Icons } from '@/components/icons'

const faqs = [
  {
    question: "What is EnerShare?",
    answer: "EnerShare is Nigeria's first peer-to-peer energy trading platform. It connects energy producers (solar/generator owners) with consumers who need electricity."
  },
  {
    question: "How do I start selling energy?",
    answer: "Sign up as a Producer, complete KYC verification, connect your smart meter or manually enter readings, then list your surplus energy for sale."
  },
  {
    question: "How do I buy energy?",
    answer: "Sign up as a Consumer, browse the marketplace, select a listing, enter the amount you need, and complete payment via Paystack."
  },
  {
    question: "What is the platform fee?",
    answer: "EnerShare charges a 2% platform fee on each successful transaction. This fee is deducted from the seller's payout."
  },
  {
    question: "How do I withdraw my earnings?",
    answer: "Go to Wallet → Withdraw, enter your bank details and amount. Withdrawals are processed within 1-2 business days."
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use bank-level encryption and comply with NDPR regulations. Your personal information is never shared."
  },
  {
    question: "Do I need a smart meter?",
    answer: "No. You can manually enter your energy readings. Smart meter integration is optional and will be available in Phase 2."
  },
  {
    question: "What payment methods are accepted?",
    answer: "Paystack accepts all Nigerian cards, bank transfers, and USSD from major banks."
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton />
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-400">Find answers to common questions about EnerShare</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-700 transition"
              >
                <span className="text-white font-medium">{faq.question}</span>
                <Icons.ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openIndex === index ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5">
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Icons.Mail className="w-5 h-5" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}