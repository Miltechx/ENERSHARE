import Link from 'next/link'
import BackButton from '@/components/BackButton'
import { Icons } from '@/components/icons'

const plans = [
  {
    name: 'Consumer',
    icon: 'User',
    price: 'Free',
    subtitle: 'to join',
    fee: '2.5% fee on purchases',
    feeNote: 'Only pay when you buy energy',
    highlight: false,
    cta: 'Get Started Free',
    ctaHref: '/auth/signup',
    features: [
      'Buy energy from local sellers',
      'Real-time energy marketplace',
      'Wallet top-up via card or transfer',
      'Transaction history',
      'Push notifications',
      'Customer support',
    ],
  },
  {
    name: 'Producer',
    icon: 'Solar',
    price: 'Free',
    subtitle: 'to list',
    fee: '2.5% fee on sales',
    feeNote: 'Only pay when you make a sale',
    highlight: true,
    cta: 'Start Selling',
    ctaHref: '/auth/signup',
    features: [
      'Everything in Consumer',
      'List solar, generator, or grid surplus',
      'Set your own price per kWh',
      'Instant earnings to wallet',
      'Withdraw to any Nigerian bank',
      'Sales analytics dashboard',
      'Buyer demand notifications',
    ],
  },
  {
    name: 'Estate / Business',
    icon: 'Trade',
    price: '₦50,000',
    subtitle: 'one-time setup',
    fee: '1.5% fee on transactions',
    feeNote: 'Lower rate for high-volume estates',
    highlight: false,
    cta: 'Contact Sales',
    ctaHref: '/contact',
    features: [
      'Everything in Producer',
      'Multi-unit estate deployment',
      'Dedicated account manager',
      'Custom IoT meter integration',
      'Bulk user onboarding',
      'White-label option available',
      'Priority support & SLA',
    ],
  },
]

const faqs = [
  {
    q: 'When do I get charged the 2.5% fee?',
    a: 'Only when a trade completes successfully. If you top up your wallet or cancel a transaction, no fee is charged.',
  },
  {
    q: 'How do sellers receive their money?',
    a: 'When a buyer purchases your energy, 97.5% of the transaction value is instantly credited to your EnerShare wallet. You can withdraw to any Nigerian bank account at any time.',
  },
  {
    q: 'Is there a monthly or annual fee?',
    a: 'No. Consumer and Producer accounts are completely free to create and maintain. You only pay the 2.5% transaction fee when a successful trade happens.',
  },
  {
    q: 'What is the minimum withdrawal amount?',
    a: 'You can withdraw a minimum of ₦1,000 to any Nigerian bank account. Withdrawals are processed within 1–2 business days.',
  },
  {
    q: 'What does the Estate setup fee cover?',
    a: 'The ₦50,000 one-time fee covers IoT meter configuration, on-site technical visit, bulk user registration, and a dedicated account manager for your estate or business.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <BackButton />

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            No monthly fees. No subscriptions. You only pay when you successfully trade energy —
            and even then, it&apos;s just 2.5%.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? 'bg-gray-800 border-2 border-green-500 relative'
                  : 'bg-gray-800 border border-gray-700'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-black text-xs font-bold px-4 py-1.5 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-6">
                <Icons.Lightning className="w-6 h-6 text-green-500" />
              </div>

              {/* Name & Price */}
              <h2 className="text-2xl font-bold text-white mb-1">{plan.name}</h2>
              <div className="mb-2">
                <span className="text-4xl font-bold text-green-500">{plan.price}</span>
                <span className="text-gray-400 ml-2 text-sm">{plan.subtitle}</span>
              </div>

              {/* Fee callout */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 mb-6">
                <p className="text-green-400 font-semibold text-sm">{plan.fee}</p>
                <p className="text-gray-400 text-xs mt-0.5">{plan.feeNote}</p>
              </div>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={`block w-full text-center py-3 rounded-lg font-semibold transition mb-8 ${
                  plan.highlight
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* How the fee works */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">How the 2.5% Fee Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-3xl font-bold text-white mb-2">₦10,000</div>
              <div className="text-gray-400 text-sm">Buyer pays for 10 kWh at ₦1,000/kWh</div>
            </div>
            <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">₦9,750</div>
              <div className="text-gray-400 text-sm">Seller receives (97.5%) — instantly in wallet</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-3xl font-bold text-white mb-2">₦250</div>
              <div className="text-gray-400 text-sm">EnerShare platform fee (2.5%)</div>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            The fee is automatically deducted at the point of transaction. No manual calculations needed.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition"
            >
              Start for Free
            </Link>
            <Link
              href="/contact"
              className="border border-gray-600 hover:border-green-500 text-gray-300 hover:text-green-500 px-8 py-3 rounded-full font-semibold transition"
            >
              Talk to Us
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}