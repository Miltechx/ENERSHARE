'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { auth, db } from '@/lib/firebase/client'
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import BackButton from '@/components/BackButton'
import { Icons } from '@/components/icons'

// Complete Nigerian Banks List (Commercial + Microfinance)
const NIGERIAN_BANKS = [
  { code: '000001', name: 'Access Bank Plc' },
  { code: '000002', name: 'First Bank of Nigeria Ltd' },
  { code: '000003', name: 'Guaranty Trust Bank Plc' },
  { code: '000004', name: 'United Bank for Africa Plc' },
  { code: '000005', name: 'Zenith Bank Plc' },
  { code: '000006', name: 'Union Bank of Nigeria Plc' },
  { code: '000007', name: 'Fidelity Bank Plc' },
  { code: '000008', name: 'Stanbic IBTC Bank Plc' },
  { code: '000009', name: 'Ecobank Nigeria Plc' },
  { code: '000010', name: 'Sterling Bank Plc' },
  { code: '000011', name: 'Polaris Bank Ltd' },
  { code: '000012', name: 'Wema Bank Plc' },
  { code: '000013', name: 'Unity Bank Plc' },
  { code: '000014', name: 'Heritage Bank Plc' },
  { code: '000015', name: 'Keystone Bank Ltd' },
  { code: '000016', name: 'Jaiz Bank Plc' },
  { code: '000017', name: 'SunTrust Bank Nigeria Ltd' },
  { code: '000018', name: 'Titan Trust Bank Ltd' },
  { code: '000019', name: 'Providus Bank Ltd' },
  { code: '000020', name: 'Globus Bank Ltd' },
  { code: '000021', name: 'Kuda Bank' },
  { code: '000022', name: 'Opay Digital Bank' },
  { code: '000023', name: 'Palmpay' },
  { code: '000024', name: 'Moniepoint Microfinance Bank' },
  { code: '000025', name: 'Sparkle Bank' },
  { code: '000026', name: 'VFD Microfinance Bank' },
  { code: '000027', name: 'Fairmoney Microfinance Bank' },
  { code: '000028', name: 'Carbon (OneFi)' },
  { code: '000029', name: 'Mint Finance' },
  { code: '000030', name: 'ALAT by Wema' },
  { code: '000031', name: 'Accion Microfinance Bank' },
  { code: '000032', name: 'LAPO Microfinance Bank' },
  { code: '000033', name: 'Fortis Microfinance Bank' },
  { code: '000034', name: 'Finca Microfinance Bank' },
  { code: '000035', name: 'ABA Microfinance Bank' },
  { code: '000036', name: 'Seed Capital Microfinance Bank' },
  { code: '000037', name: 'Empower Microfinance Bank' },
  { code: '000038', name: 'Ikeja Microfinance Bank' },
  { code: '000039', name: 'Mint Microfinance Bank' },
  { code: '000040', name: 'Grooming Microfinance Bank' },
  { code: '000041', name: 'Hasal Microfinance Bank' },
  { code: '000042', name: 'Infinity Microfinance Bank' },
  { code: '000043', name: 'MainStreet Microfinance Bank' },
  { code: '000044', name: 'Microvis Microfinance Bank' },
  { code: '000045', name: 'Mutual Trust Microfinance Bank' },
  { code: '000046', name: 'New Dawn Microfinance Bank' },
  { code: '000047', name: 'NIRSAL Microfinance Bank' },
  { code: '000048', name: 'Peace Microfinance Bank' },
  { code: '000049', name: 'Royal Microfinance Bank' },
  { code: '000050', name: 'Standard Microfinance Bank' },
  { code: '000051', name: 'Zenith Microfinance Bank' },
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
    if (user) { fetchTransactions() }
  }, [user])

  const fetchTransactions = async () => {
    if (!user) return
    setLoading(true)
    try {
      const q = query(collection(db, 'transactions'), where('buyerId', '==', user.uid), orderBy('createdAt', 'desc'), limit(50))
      const snapshot = await getDocs(q)
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const verifyAccount = async () => {
    if (!bankCode || accountNumber.length !== 10) {
      setError('Select bank and enter 10-digit account number')
      return
    }
    setVerifyingBank(true)
    setError('')
    try {
      const token = await getAuthToken()
      if (!token) { setError('Please sign in again'); return }
      const res = await fetch(`/api/bank/resolve?bankCode=${bankCode}&accountNumber=${accountNumber}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) { setAccountName(data.accountName) }
      else { setError('Account not found. Check bank and number.') }
    } catch (error) { setError('Failed to verify account') }
    finally { setVerifyingBank(false) }
  }

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount)
    if (isNaN(amount) || amount < 500) { setError('Minimum ₦500'); return }
    setTopupLoading(true); setError(''); setSuccess('')
    try {
      const token = await getAuthToken()
      if (!token) { setError('Please sign in again'); return }
      const initRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amountNaira: amount, email: user?.email, metadata: { type: 'deposit' } })
      })
      const initData = await initRes.json()
      if (!initData.success) throw new Error(initData.error || 'Failed')
      const PaystackPop = (await import('@paystack/inline-js')).default
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user?.email!,
        amount: amount * 100,
        ref: initData.reference,
        onSuccess: async (tx: any) => {
          const verifyRes = await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ reference: tx.reference })
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            await refreshWallet()
            setSuccess(`₦${amount.toLocaleString()} added`)
            setTopupAmount('')
            fetchTransactions()
          } else { setError('Verification failed') }
        },
        onCancel: () => setError('Cancelled')
      })
      handler.openIframe()
    } catch (err: any) { setError(err.message) }
    finally { setTopupLoading(false) }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount < 1000) { setError('Minimum ₦1,000'); return }
    if (amount > (wallet?.nairaBalance || 0)) { setError('Insufficient balance'); return }
    if (!bankCode || !accountNumber || !accountName) { setError('Complete bank details and verify account'); return }
    setWithdrawLoading(true); setError(''); setSuccess('')
    try {
      const token = await getAuthToken()
      if (!token) { setError('Please sign in again'); return }
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amountNaira: amount, bankCode, accountNumber, accountName, bankName: selectedBank })
      })
      const data = await res.json()
      if (data.success) {
        await refreshWallet()
        setSuccess(`Withdrawal request submitted for ₦${amount.toLocaleString()}`)
        setWithdrawAmount(''); setSelectedBank(''); setBankCode(''); setAccountNumber(''); setAccountName('')
      } else { setError(data.error || 'Withdrawal failed') }
    } catch (err) { setError('Withdrawal failed') }
    finally { setWithdrawLoading(false) }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-white mb-8">Wallet</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
            <p className="text-green-100 text-sm">NAIRA BALANCE</p>
            <p className="text-3xl font-bold text-white mt-1">₦{(wallet?.nairaBalance || 0).toLocaleString()}</p>
            <button onClick={() => setActiveTab('topup')} className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm">Add Funds</button>
          </div>
          <div className="bg-gray-800 rounded-xl p-6"><p className="text-gray-400 text-sm">KWH BALANCE</p><p className="text-2xl font-bold text-white mt-1">{wallet?.kwhBalance || 0} kWh</p></div>
          <div className="bg-gray-800 rounded-xl p-6"><p className="text-gray-400 text-sm">TOTAL EARNED</p><p className="text-2xl font-bold text-white mt-1">₦{(wallet?.totalEarned || 0).toLocaleString()}</p></div>
        </div>

        <div className="flex space-x-2 border-b border-gray-700 mb-6">
          {['balance', 'topup', 'withdraw', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 text-sm font-medium transition ${activeTab === tab ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}>
              {tab === 'balance' ? 'Balance' : tab === 'topup' ? 'Top Up' : tab === 'withdraw' ? 'Withdraw' : 'History'}
            </button>
          ))}
        </div>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500 rounded-lg"><p className="text-red-500 text-sm">{error}</p></div>}
        {success && <div className="mb-6 p-3 bg-green-500/10 border border-green-500 rounded-lg"><p className="text-green-500 text-sm">{success}</p></div>}

        {activeTab === 'topup' && (
          <div className="bg-gray-800 rounded-xl p-6 max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Add Funds</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Amount (₦)</label>
              <input type="number" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} placeholder="500" min="500" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              <p className="text-xs text-gray-400 mt-1">Minimum: ₦500</p>
            </div>
            <button onClick={handleTopup} disabled={topupLoading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold">{topupLoading ? 'Processing...' : 'Add Funds'}</button>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="bg-gray-800 rounded-xl p-6 max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Withdraw Funds</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-1">Amount (₦)</label>
                <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="1000" min="1000" max={wallet?.nairaBalance || 0} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                <p className="text-xs text-gray-400 mt-1">Available: ₦{(wallet?.nairaBalance || 0).toLocaleString()} | Min: ₦1,000</p>
              </div>
              <div><label className="block text-sm font-medium text-gray-300 mb-1">Bank Name</label>
                <select value={selectedBank} onChange={(e) => { setSelectedBank(e.target.value); const bank = NIGERIAN_BANKS.find(b => b.name === e.target.value); setBankCode(bank?.code || ''); setAccountName('') }} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  <option value="">Select Bank</option>
                  {NIGERIAN_BANKS.map(bank => (<option key={bank.code} value={bank.name}>{bank.name}</option>))}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-300 mb-1">Account Number</label>
                <div className="flex gap-2"><input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="1234567890" maxLength={10} className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" /><button onClick={verifyAccount} disabled={verifyingBank} className="px-4 py-3 bg-gray-600 rounded-lg text-white text-sm">{verifyingBank ? '...' : 'Verify'}</button></div>
              </div>
              {accountName && (<div className="p-3 bg-green-500/10 rounded-lg"><p className="text-green-400 text-sm">Account Name: {accountName}</p></div>)}
              <div><label className="block text-sm font-medium text-gray-300 mb-1">Account Name (Optional)</label><input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" /></div>
              <button onClick={handleWithdraw} disabled={withdrawLoading || !accountName} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold">{withdrawLoading ? 'Processing...' : 'Request Withdrawal'}</button>
              <p className="text-xs text-gray-400 text-center">Withdrawals processed within 1-2 business days</p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            {loading ? (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div></div>)
            : transactions.length === 0 ? (<div className="text-center py-12"><p className="text-gray-400">No transactions yet</p></div>)
            : (<table className="w-full"><thead className="bg-gray-700"><tr><th className="text-left p-4 text-gray-300">Date</th><th className="text-left p-4 text-gray-300">Description</th><th className="text-left p-4 text-gray-300">Amount</th><th className="text-left p-4 text-gray-300">Status</th></tr></thead>
            <tbody>{transactions.map((tx: any) => (<tr key={tx.id} className="border-t border-gray-700"><td className="p-4 text-gray-400 text-sm">{tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : 'Recent'}</td><td className="p-4 text-white">{tx.type === 'purchase' ? 'Energy Purchase' : tx.type === 'deposit' ? 'Wallet Top-up' : 'Withdrawal'}</td><td className="p-4"><span className={tx.type === 'purchase' ? 'text-red-400' : 'text-green-400'}>{tx.type === 'purchase' ? '-' : '+'}₦{tx.totalNaira?.toLocaleString() || 0}</span></td><td className="p-4"><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">{tx.status || 'completed'}</span></td></tr>))}</tbody></table>)}
          </div>
        )}
      </div>
    </div>
  )
}