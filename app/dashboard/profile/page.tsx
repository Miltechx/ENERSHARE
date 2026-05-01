'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session?.user?.id)
      .single()

    if (data) {
      setFullName(data.full_name || '')
      setPhone(data.phone || '')
      setAddress(data.address || '')
      setCity(data.city || '')
      setState(data.state || '')
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        address,
        city,
        state,
      })
      .eq('id', session?.user?.id)

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo variant="compact" />
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary transition">Dashboard</Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-primary transition">Marketplace</Link>
              <Link href="/dashboard/profile" className="text-primary font-semibold">Profile</Link>
              <Link href="/marketplace/sell" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm">
                + Sell Energy
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6
