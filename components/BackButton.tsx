'use client'

import { useRouter, usePathname } from 'next/navigation'

// Pages where "back" should go to the dashboard instead of browser history
const DASHBOARD_CHILDREN = ['/wallet', '/marketplace', '/listings', '/profile', '/kyc', '/settings']

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()

  const handleBack = () => {
    // If we're on a top-level app page, go to dashboard
    const isDashboardChild = DASHBOARD_CHILDREN.some(p => pathname.startsWith(p))
    if (isDashboardChild) {
      router.push('/dashboard')
    } else {
      router.back()
    }
  }

  // Don't render on auth pages or the homepage
  if (
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname === '/dashboard'
  ) {
    return null
  }

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-4 group"
    >
      <svg
        className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span className="text-sm">Back</span>
    </button>
  )
}