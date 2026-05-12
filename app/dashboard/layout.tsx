'use client'

import { useAuth } from '@/lib/auth-context'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const navItems = [
  { name: 'Overview',       href: '/dashboard',      roles: ['consumer', 'producer', 'retailer', 'admin'] },
  { name: 'Marketplace',   href: '/marketplace',    roles: ['consumer', 'producer', 'retailer'] },
  { name: 'Wallet',        href: '/wallet',         roles: ['consumer', 'producer', 'retailer'] },
  { name: 'My Listings',   href: '/listings/mine',  roles: ['consumer', 'producer', 'retailer', 'admin'] },
  { name: 'Meter Readings',href: '/meters',         roles: ['producer', 'retailer'] },
  { name: 'Notifications', href: '/notifications',  roles: ['consumer', 'producer', 'retailer'] },
  { name: 'Profile',       href: '/profile',        roles: ['consumer', 'producer', 'retailer'] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/signin')
  }, [user, loading, router])

  useEffect(() => { setOpen(false) }, [pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    )
  }

  if (!user) return null

  const filteredNav = navItems.filter(item =>
    item.roles.includes(profile?.role || 'consumer')
  )

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* TOP BAR - mobile only */}
      <header className="md:hidden sticky top-0 z-30 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 h-14 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-600 rounded-md flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-white font-bold text-base">EnerShare</span>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="text-gray-300 hover:text-white p-2 -mr-2"
          aria-label="Toggle menu"
        >
          {open
            ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          }
        </button>
      </header>

      {/* MOBILE FULLSCREEN MENU */}
      {open && (
        <div className="md:hidden fixed inset-0 top-14 z-20 bg-gray-900/98 backdrop-blur-sm overflow-y-auto">
          <nav className="px-4 py-4 space-y-1">
            {filteredNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3.5 rounded-lg text-base font-medium transition ${
                  isActive(item.href)
                    ? 'bg-green-600/20 text-green-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {profile?.is_admin && (
              <Link
                href="/admin"
                className="flex items-center px-4 py-3.5 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition"
              >
                Admin
              </Link>
            )}
            <div className="pt-4 border-t border-gray-800 mt-4">
              <button
                onClick={handleSignOut}
                className="w-full text-left flex items-center px-4 py-3.5 rounded-lg text-base font-medium text-red-400 hover:bg-gray-800 transition"
              >
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* BODY */}
      <div className="flex flex-1">

        {/* Desktop sidebar - hidden on mobile via 'hidden md:flex' */}
        <aside className="hidden md:flex w-56 shrink-0 bg-gray-800 border-r border-gray-700 flex-col h-screen sticky top-0">
          <div className="p-4 border-b border-gray-700 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-white font-bold text-lg">EnerShare</span>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {filteredNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'bg-green-600/20 text-green-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {profile?.is_admin && (
              <Link
                href="/admin"
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive('/admin')
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="p-3 border-t border-gray-700 shrink-0">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-600/10 transition"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Page content — full width on mobile */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}