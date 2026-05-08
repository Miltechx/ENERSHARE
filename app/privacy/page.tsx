export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>

        <div className="bg-gray-800 rounded-xl p-6 space-y-6 text-gray-300">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">1. Information We Collect</h2>
            <p>We collect personal information including your name, email, phone number, address, NIN/BVN for KYC, and energy usage data from your meter readings.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">2. How We Use Your Information</h2>
            <p>Your information is used to facilitate energy trades, verify your identity, process payments, comply with regulations, and improve our platform.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">3. Data Protection</h2>
            <p>We implement industry-standard security measures including encryption, access controls, and regular security audits. Your financial information is processed by Paystack and never stored by us.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">4. NDPR Compliance</h2>
            <p>We comply with the Nigeria Data Protection Regulation (NDPR). Your data is collected with consent, used lawfully, and you have the right to request deletion.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">5. Third-Party Sharing</h2>
            <p>We share data only with necessary service providers (Paystack for payments, Firebase for hosting) and regulatory authorities when required by law.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your data. Contact our Data Protection Officer at dpo@enershare.ng.</p>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-400 mt-2">Data Protection Officer: dpo@enershare.ng</p>
          </div>
        </div>
      </div>
    </div>
  )
}