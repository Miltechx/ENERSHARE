'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icons } from '@/components/icons'

interface Transaction {
  id: string
  buyer_name?: string
  seller_name?: string
  amount_kwh: number
  price_per_kwh_ngn: number
  total_amount: number
  fee_ngn: number
  status: string
  created_at: string
}

export default function History() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/auth/signin')
  }, [sessionStatus, router])

  useEffect(() => {
    if (session?.user) {
      fetchTransactions()
    }
  }, [session, filter])

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/user/transactions?type=${filter}`)
      const data = await res.json()
      setTransactions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalEarned = transactions
    .filter(t => t.status === 'completed' && t.seller_name)
    .reduce((sum, t) => sum + (t.total_amount - t.fee_ngn), 0)

  const totalSpent = transactions
    .filter(t => t.status === 'completed' && t.buyer_name)
    .reduce((sum, t) => sum + t.total_amount, 0)

  const totalFees = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.fee_ngn, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo variant="compact" />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary
