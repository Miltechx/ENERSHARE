import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EnerShare - Peer-to-Peer Energy Trading Platform | Nigeria & Pan-Africa',
  description: 'EnerShare enables households, businesses, and microgrid operators to buy, sell, store, and transfer electricity units in real-time across Nigeria and Pan-Africa.',
  keywords: 'energy trading, P2P energy, solar trading, Nigeria energy, renewable energy, microgrid',
  authors: [{ name: 'EnerShare' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
