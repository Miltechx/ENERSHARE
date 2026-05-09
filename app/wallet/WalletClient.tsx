'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { Transaction } from '@/types'

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic'

export default function WalletPage() {
  const { user, wallet, loading: authLoading, refreshWallet } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'balance' | 'topup' | 'withdraw' | 'history'>('balance')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [topupAmount, setTopupAmount] = useState('')
  const [topupLoading, setTopupLoading] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user])

  const fetchTransactions = async () => {
    if (!user) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'transactions'),
        where('buyerId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      const snapshot = await getDocs(q)
      const txData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]
      setTransactions(txData)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount)
    if (isNaN(amount) || amount < 500) {
      setError('Minimum top-up amount is ₦500')
      return
    }

    setTopupLoading(true)
    setError('')
    setSuccess('')

    try {
      const initRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountNaira: amount,
          email: user?.email,
          metadata: { type: 'deposit' },
        }),
      })

      const initData = await initRes.json()
      if (!initData.success) {
        throw new Error(initData.error || 'Failed to initialize payment')
      }

      const PaystackPop = (await import('@paystack/inline-js')).default
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user?.email!,
        amount: amount * 100,
        ref: initData.reference,
        onSuccess: async (transaction: any) => {
          const verifyRes = await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: transaction.reference }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            await refreshWallet()
            setSuccess(`Successfully added ₦${amount.toLocaleString()} to your wallet`)
            setTopupAmount('')
            fetchTransactions()
          }
        },
        onCancel: () => {
          setError('Payment was cancelled')
        },
      })
      handler.openIframe()
    } catch (err: any) {
      setError(err.message || 'Top-up failed')
    } finally {
      setTopupLoading(false)
    }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount < 1000) {
      setError('Minimum withdrawal amount is ₦1,000')
      return
    }
    if (amount > (wallet?.nairaBalance || 0)) {
      setError('Insufficient balance')
      return
    }
    if (!bankName || !accountNumber) {
      setError('Please fill in all bank details')
      return
    }

    setWithdrawLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountNaira: amount,
          bankName,
          accountNumber,
          accountName: accountName || 'Self',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(`Withdrawal request submitted for ₦${amount.toLocaleString()}`)
        setWithdrawAmount('')
        setBankName('')
        setAccountNumber('')
        setAccountName('')
        await refreshWallet()
      } else {
        setError(data.error || 'Withdrawal failed')
      }
    } catch (err) {
      setError('Withdrawal failed. Please try again.')
    } finally {
      setWithdrawLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  const totalBalance = (wallet?.nairaBalance || 0) + (wallet?.kwhBalance || 0)

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Wallet</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
            <p className="text-green-100 text-sm">TOTAL BALANCE</p>
            <p className="text-3xl font-bold text-white mt-1">
              ₦{wallet?.nairaBalance.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">KWH BALANCE</p>
            <p className="text-2xl font-bold text-white mt-1">
              {wallet?.kwhBalance || 0} kWh
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">TOTAL EARNED</p>
            <p className="text-2xl font-bold text-white mt-1">
              ₦{wallet?.totalEarned.toLocaleString() || 0}
            </p>
          </div>
        </div>

        <div className="flex space-x-2 border-b border-gray-700 mb-6">
          {['balance', 'topup', 'withdraw', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'balance' && 'Balance'}
              {tab === 'topup' && 'Top Up'}
              {tab === 'withdraw' && 'Withdraw'}
              {tab === 'history' && 'History'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-green-500 text-sm">{success}</p>
          </div>
        )}

        {activeTab === 'topup' && (
          <div className="bg-gray-800 rounded-xl p-6 max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Add Funds</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amount (₦)
              </label>
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="500"
                min="500"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <p className="text-xs text-gray-400 mt-1">Minimum: ₦500</p>
            </div>
            <button
              onClick={handleTopup}
              disabled={topupLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {topupLoading ? 'Processing...' : 'Add Funds'}
            </button>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="bg-gray-800 rounded-xl p-6 max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Withdraw Funds</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="1000"
                  min="1000"
                  max={wallet?.nairaBalance || 0}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bank Name
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select Bank</option>
                  <option value="GTBank">GTBank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="First Bank">First Bank</option>
                  <option value="UBA">UBA</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {withdrawLoading ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No transactions yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300">Date</th>
                    <th className="text-left p-4 text-gray-300">Description</th>
                    <th className="text-left p-4 text-gray-300">Amount</th>
                    <th className="text-left p-4 text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-gray-700">
                      <td className="p-4 text-gray-400 text-sm">
                        {tx.createdAt?.toDate().toLocaleDateString()}
                      </td>
                      <td className="p-4 text-white">
                        {tx.type === 'purchase' ? 'Energy Purchase' : 
                         tx.type === 'deposit' ? 'Wallet Top-up' : 
                         tx.type === 'withdrawal' ? 'Withdrawal' : 'Energy Sale'}
                      </td>
                      <td className="p-4">
                        <span className={tx.type === 'purchase' ? 'text-red-400' : 'text-green-400'}>
                          {tx.type === 'purchase' ? '-' : '+'}₦{tx.totalNaira.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}