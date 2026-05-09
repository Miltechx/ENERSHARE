import BackButton from '@/components/BackButton'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <div className="bg-gray-800 rounded-xl p-6 space-y-6 text-gray-300">
          <div><h2 className="text-xl font-semibold text-white mb-2">1. Information We Collect</h2><p>We collect personal information including your name, email, phone number, address, NIN/BVN for KYC, and energy usage data.</p></div>
          <div><h2 className="text-xl font-semibold text-white mb-2">2. How We Use Your Information</h2><p>Your information is used to facilitate energy trades, verify your identity, process payments, and comply with regulations.</p></div>
          <div><h2 className="text-xl font-semibold text-white mb-2">3. Data Protection</h2><p>We use bank-level encryption and regular security audits. Financial data is processed by Paystack.</p></div>
          <div><h2 className="text-xl font-semibold text-white mb-2">4. NDPR Compliance</h2><p>We comply with the Nigeria Data Protection Regulation (NDPR). You have the right to request deletion.</p></div>
          <div className="pt-4 border-t border-gray-700"><p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p></div>
        </div>
      </div>
    </div>
  )
}
