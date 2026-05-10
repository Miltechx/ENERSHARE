import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import ConditionalNavbar from '@/components/ConditionalNavbar'

export const metadata: Metadata = {
  title: 'EnerShare - Peer-to-Peer Energy Trading Platform',
  description: 'Buy and sell electricity with your neighbors',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EnerShare',
  },
  formatDetection: {
    telephone: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes, viewport-fit=cover"
        />
      </head>
      <body className="bg-gray-900 text-white antialiased">
        <AuthProvider>
          {/*
            ConditionalNavbar renders the global Navbar only on public/marketing
            pages (home, about, pricing, faq, waitlist, contact, auth).
            Dashboard, wallet, marketplace, admin etc. have their own navigation
            and do not need the global Navbar.
          */}
          <ConditionalNavbar />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}