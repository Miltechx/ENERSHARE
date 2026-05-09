'use client'
import BackButton from "@/components/BackButton"

import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

interface DashboardNavItem {
  name: string
  href: string
  icon: string
  roles: string[]
}

const navItems: DashboardNavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: '', roles: ['consumer', 'producer', 'retailer', 'admin'] },
  { name: 'Marketplace', href: '/marketplace', icon: '', roles: ['consumer', 'producer', 'retailer'] },
  { name: 'Wallet', href: '/wallet', icon: '', roles: ['consumer', 'producer', 'retailer'] },
  { name: 'My Listings', href: '/listings/mine', icon: '', roles: ['producer', 'retailer'] },
  { name: 'Meter Readings', href: '/meters', icon: '', roles: ['producer', 'retailer'] },
  { name: 'Notifications', href: '/notifications', icon: '', roles: ['consumer', 'producer', 'retailer'] },
  { name: 'Profile', href: '/profile', icon: '', roles: ['consumer', 'producer', 'retailer'] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const filteredNav = navItems.filter(item => item.roles.includes(profile?.role || 'consumer'))

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-screen sticky top-0">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-white font-bold text-xl">EnerShare</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {filteredNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition ${
                  pathname === item.href ? 'bg-gray-700 text-green-500' : ''
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
            <button className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-gray-300 hover:bg-gray-700 transition">
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}