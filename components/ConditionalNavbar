'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

// Routes where the global Navbar should NOT appear
// (these pages have their own sidebar/app shell navigation)
const APP_ROUTES = [
  '/dashboard',
  '/wallet',
  '/marketplace',
  '/profile',
  '/admin',
  '/meters',
  '/notifications',
  '/onboarding',
  '/listings',
]

export default function ConditionalNavbar() {
  const pathname = usePathname()
  const isAppRoute = APP_ROUTES.some(route => pathname.startsWith(route))

  if (isAppRoute) return null
  return <Navbar />
}