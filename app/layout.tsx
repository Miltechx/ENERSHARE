import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'EnerShare - Peer-to-Peer Energy Trading Platform',
  description: 'Buy and sell electricity with your neighbors. The future of energy is decentralized.',
  keywords: 'energy trading, p2p energy, solar trading, nigeria energy, renewable energy',
  authors: [{ name: 'EnerShare' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900">
        <AuthProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}