'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { auth, db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import BackButton from '@/components/BackButton'
import { Icons } from '@/components/icons'

// Correct Paystack bank codes for Nigeria (verified against Paystack API)
const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank Plc' },
  { code: '023', name: 'Citibank Nigeria' },
  { code: '063', name: 'Diamond Bank (Access Bank)' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '070', name: 'Fidelity Bank Plc' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '526', name: 'Kuda Bank' },
  { code: '014', name: 'MainStreet Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '302', name: 'Taj Bank' },
  { code: '102', name: 'Titan Trust Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '215', name: 'Unity Bank Plc' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
  // Fintechs / Microfinance
  { code: '100004', name: 'Opay (OPay Digital Services)' },
  { code: '100033', name: 'Palmpay' },
  { code: '50515', name: 'Moniepoint Microfinance Bank' },
  { code: '100025', name: 'Kuda Microfinance Bank' },
  { code: '090110', name: 'VFD Microfinance Bank' },
  { code: '090317', name: 'Fairmoney Microfinance Bank' },
  { code: '100026', name: 'Carbon (OneFi)' },
  { code: '035A', name: 'ALAT by Wema' },
  { code: '090001', name: 'AsoSavings & Loans' },
  { code: '090003', name: 'Jubilee Life Mortgage Bank' },
  { code: '090006', name: 'SafeTrust Mortgage Bank' },
  { code: '090107', name: 'FBNQuest Merchant Bank' },
  { code: '090115', name: 'TCF Microfinance Bank' },
  { code: '090175', name: 'Rubies Microfinance Bank' },
  { code: '090267', name: 'Kuda Bank (MFB)' },
  { code: '090325', name: 'Sparkle Microfinance Bank' },
  { code: '090405', name: 'Prospa Microfinance Bank' },
]

async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return await user.getIdToken()
}

export default function WalletPage() {
  const { user, wallet, refreshWallet } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'balance' | 'topup' | 'withdraw' | 'history'>('balance')
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [topupAmount, setTopupAmount] = useState('')
  const [topupLoading, setTopupLoading] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedBank, setSelectedBank] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [verifyingBank, setVerifyingBank] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) fetchTransactions()
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
      setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const verifyAccount = async () => {
    if (!bankCode || accountNumber.length !== 10) {
      setError('Select a bank and enter a 10-digit account number')
      return
    }
    setVerifyingBank(true)
    setError('')
    try {
      const token = await getAuthToken()
      if (!token) { setError('Please sign in again'); return }
      const res = await fetch(
        `/api/bank/resolve?bankCode=${bankCode}&accountNumber=${accountNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (data.success) {
        setAccountName(data.accountName)
      } else {
        setError('Account not found. Check bank selection and account number.')
      }
    } catch {
      setError('Failed to verify account. Please try again.')
    } finally {
      setVerifyingBank(false)
    }
  }

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount)
    if (isNaN(amount) || amount < 500) { setError('Minimum amount is ₦500'); return }
    setTopupLoading(true); setError(''); setSuccess('')
    try {
      const token = await getAuthToken()
      if (!token) { setError('Please sign in again'); return }
      const initRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amountNaira: amount, email: user?.email, metadata: { type: 'deposit' } }),
      })
      const initData = await initRes.json()
      if (!initData.success) throw new Error(initData.error || 'Initialization failed')

      const PaystackPop = (await import('@paystack/inline-js')).default
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user?.email!,
        amount: amount * 100,
        ref: initData.reference,
        onSuccess: async (tx: any) => {
          const verifyRes = await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ reference: tx.reference }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            await refreshWallet()
            setSuccess(`₦${amount.toLocaleString()} successfully added to your wallet`)
            setTopupAmount('')
            fetchTransactions()
          } else {
            setError('Payment verification failed. Contact support if funds were deducted.')
          }
        },
        onCancel: () => setError('Payment was cancelled'),
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
    if (isNaN(amount) || amount < 1000) { setError('Minimum withdrawal is ₦1,000'); return }
    if (amount > (wallet?.nairaBalance || 0)) { setError('Insufficient balance'); return }
    if (!bankCode || !accountNumber || !accountName) {
      setError('Complete and verify your bank details before withdrawing')
      return
    }
    setWithdrawLoading(true); setError(''); setSuccess('')
    try {
      const token = await getAuthToken()
      if (!token) { setError('Please sign in again'); return }
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amountNaira: amount,
          bankCode,
          accountNumber,
          accountName,
          bankName: selectedBank,
        }),
      })
      const data = await res.json()
      if (data.success) {
        await refreshWallet()
        setSuccess(`Withdrawal of ₦${amount.toLocaleString()} submitted. Expect funds in 1–2 business days.`)
        setWithdrawAmount('')
        setSelectedBank('')
        setBankCode('')
        setAccountNumber('')
        setAccountName('')
      } else {
        setError(data.error || 'Withdrawal request failed')
      }
    } catch {
      setError('Withdrawal request failed. Please try again.')
    } finally {
      setWithdrawLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-white mb-8">Wallet</h1>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
            <p className="text-green-100 text-sm">NAIRA BALANCE</p>
            <p className="text-3xl font-bold text-white mt-1">
              ₦{(wallet?.nairaBalance || 0).toLocaleString()}
            </p>
            <button
              onClick={() => setActiveTab('topup')}
              className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Add Funds
            </button>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">KWH BALANCE</p>
            <p className="text-2xl font-bold text-white mt-1">{wallet?.kwhBalance || 0} kWh</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">TOTAL EARNED</p>
            <p className="text-2xl font-bold text-white mt-1">
              ₦{(wallet?.totalEarned || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-700 mb-6">
          {(['balance', 'topup', 'withdraw', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'balance' ? 'Balance' : tab === 'topup' ? 'Top Up' : tab === 'withdraw' ? 'Withdraw' : 'History'}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Top Up */}
        {activeTab === 'topup' && (
          <div className="bg-gray-800 rounded-xl p-6 max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Add Funds</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Amount (₦)</label>
              <input
                type="number"
                value={topupAmount}
                onChange={e => setTopupAmount(e.target.value)}
                placeholder="500"
                min="500"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Minimum: ₦500</p>
            </div>
            <button
              onClick={handleTopup}
              disabled={topupLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
            >
              {topupLoading ? 'Processing...' : 'Add Funds via Paystack'}
            </button>
          </div>
        )}

        {/* Withdraw */}
        {activeTab === 'withdraw' && (
          <div className="bg-gray-800 rounded-xl p-6 max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Withdraw Funds</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Amount (₦)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="1000"
                  min="1000"
                  max={wallet?.nairaBalance || 0}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Available: ₦{(wallet?.nairaBalance || 0).toLocaleString()} · Min: ₦1,000
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bank</label>
                <select
                  value={selectedBank}
                  onChange={e => {
                    setSelectedBank(e.target.value)
                    const bank = NIGERIAN_BANKS.find(b => b.name === e.target.value)
                    setBankCode(bank?.code || '')
                    setAccountName('') // reset on bank change
                  }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Bank</option>
                  {NIGERIAN_BANKS.map(bank => (
                    <option key={bank.code} value={bank.name}>{bank.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Account Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => { setAccountNumber(e.target.value); setAccountName('') }}
                    placeholder="0123456789"
                    maxLength={10}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={verifyAccount}
                    disabled={verifyingBank || accountNumber.length !== 10 || !bankCode}
                    className="px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white text-sm disabled:opacity-50 transition"
                  >
                    {verifyingBank ? '...' : 'Verify'}
                  </button>
                </div>
              </div>

              {accountName && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm font-medium">✓ {accountName}</p>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading || !accountName}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
              >
                {withdrawLoading ? 'Processing...' : 'Request Withdrawal'}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Withdrawals processed within 1–2 business days
              </p>
            </div>
          </div>
        )}

        {/* History */}
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
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-t border-gray-700">
                      <td className="p-4 text-gray-400 text-sm">
                        {tx.createdAt?.toDate
                          ? tx.createdAt.toDate().toLocaleDateString()
                          : 'Recent'}
                      </td>
                      <td className="p-4 text-white">
                        {tx.type === 'purchase'
                          ? 'Energy Purchase'
                          : tx.type === 'deposit'
                          ? 'Wallet Top-up'
                          : 'Withdrawal'}
                      </td>
                      <td className="p-4">
                        <span className={tx.type === 'purchase' ? 'text-red-400' : 'text-green-400'}>
                          {tx.type === 'purchase' ? '-' : '+'}₦{tx.totalNaira?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          {tx.status || 'completed'}
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