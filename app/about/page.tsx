import BackButton from '@/components/BackButton'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-4xl font-bold text-white mb-6">About EnerShare</h1>
        <div className="bg-gray-800 rounded-xl p-6 mb-6"><h2 className="text-2xl font-semibold text-white mb-3">Our Mission</h2><p>To democratize energy access across Africa by creating a decentralized marketplace where every household can trade electricity.</p></div>
        <div className="bg-gray-800 rounded-xl p-6 mb-6"><h2 className="text-2xl font-semibold text-white mb-3">The Problem</h2><p>Nigeria has 220M+ people but less than 5,000MW grid capacity. Solar/generator owners waste surplus while neighbors pay 30-60% more.</p></div>
        <div className="bg-gray-800 rounded-xl p-6"><h2 className="text-2xl font-semibold text-white mb-3">Our Solution</h2><p>EnerShare is a P2P energy marketplace connecting producers with consumers in real-time.</p></div>
        <div className="mt-8 text-center"><Link href="/auth/signup" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">Join the Energy Revolution</Link></div>
      </div>
    </div>
  )
}
