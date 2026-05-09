import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const metadata = {
  title: 'EnerShare',
  description: 'Peer-to-Peer Energy Trading Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}