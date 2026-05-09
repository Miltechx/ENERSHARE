import BackButton from '@/components/BackButton'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-4xl font-bold text-white mb-6">Terms of Service</h1>
        <div className="bg-gray-800 rounded-xl p-6 space-y-6 text-gray-300">
          <div><h2 className="text-xl font-semibold text-white mb-2">1. Introduction</h2><p>EnerShare is a technology marketplace connecting energy buyers and sellers. We are NOT a licensed DISCO.</p></div>
          <div><h2 className="text-xl font-semibold text-white mb-2">2. Platform Fees</h2><p>EnerShare charges a 2% platform fee on each successful energy transaction. Listing energy is free.</p></div>
          <div><h2 className="text-xl font-semibold text-white mb-2">3. Payment Processing</h2><p>All payments are processed through Paystack. EnerShare does not store payment information.</p></div>
          <div><h2 className="text-xl font-semibold text-white mb-2">4. Dispute Resolution</h2><p>Disputes are resolved through our dispute resolution process. EnerShare makes final decisions.</p></div>
          <div className="pt-4 border-t border-gray-700"><p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p></div>
        </div>
      </div>
    </div>
  )
}
