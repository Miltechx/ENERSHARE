export default function TermsPage() {
import BackButton from '@/components/BackButton'
  return (
    <div className="min-h-screen bg-gray-900">
        <BackButton />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-white mb-6">Terms of Service</h1>

        <div className="bg-gray-800 rounded-xl p-6 space-y-6 text-gray-300">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">1. Introduction</h2>
            <p>Welcome to EnerShare. By using our platform, you agree to these terms. EnerShare is a technology marketplace that connects energy buyers and sellers. We are NOT a licensed electricity distribution company (DISCO).</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">2. Eligibility</h2>
            <p>You must be at least 18 years old and a resident of Nigeria to use our platform. All users must complete KYC verification before trading.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">3. Platform Fees</h2>
            <p>EnerShare charges a 2% platform fee on each successful energy transaction. This fee is deducted automatically from the seller's payout. Listing energy for sale is free.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">4. Payment Processing</h2>
            <p>All payments are processed through Paystack, a licensed payment gateway. EnerShare does not store your payment information.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">5. Dispute Resolution</h2>
            <p>Any disputes between users shall be resolved through our dispute resolution process. EnerShare reserves the right to make final decisions on disputes.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">6. Limitation of Liability</h2>
            <p>EnerShare is not liable for any damages arising from the use of our platform. We do not guarantee the quality or reliability of energy sold by third parties.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">7. Data Protection</h2>
            <p>We collect and process your data in accordance with the Nigeria Data Protection Regulation (NDPR). See our Privacy Policy for details.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">8. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-400 mt-2">Contact: legal@enershare.ng</p>
          </div>
        </div>
      </div>
    </div>
  )
}