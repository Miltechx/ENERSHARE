'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { EnergyListing } from '@/types'
import { Icons } from './icons'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  listing: EnergyListing
  onSuccess: () => void
}

export default function PurchaseModal({ isOpen, onClose, listing, onSuccess }: PurchaseModalProps) {
  const { user, refreshWallet } = useAuth()
  const [kwhAmount, setKwhAmount] = useState(listing.minPurchaseKwh)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const subtotal = kwhAmount * listing.pricePerKwh
  const fee = subtotal * 0.02
  const total = subtotal + fee

  const handleKwhChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (isNaN(value)) {
      setKwhAmount(listing.minPurchaseKwh)
      return
    }
    let newAmount = value
    if (newAmount < listing.minPurchaseKwh) newAmount = listing.minPurchaseKwh
    if (listing.maxPurchaseKwh && newAmount > listing.maxPurchaseKwh) newAmount = listing.maxPurchaseKwh
    if (newAmount > listing.kwhAvailable) newAmount = listing.kwhAvailable
    setKwhAmount(newAmount)
  }

  const handlePurchase = async () => {
    if (!user) return
    
    setLoading(true)
    setError('')

    try {
      // Step 1: Initialize Paystack transaction
      const initRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountNaira: total,
          email: user.email,
          metadata: {
            type: 'purchase',
            listingId: listing.id,
            kwhAmount: kwhAmount,
            sellerId: listing.sellerId,
            pricePerKwh: listing.pricePerKwh,
          },
        }),
      })

      const initData = await initRes.json()
      if (!initData.success) {
        throw new Error(initData.error || 'Failed to initialize payment')
      }

      // Step 2: Open Paystack popup (dynamic import to avoid SSR issues)
      const PaystackPop = (await import('@paystack/inline-js')).default
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email!,
        amount: Math.round(total * 100),
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
            onSuccess()
          } else {
            setError('Payment verification failed. Please contact support.')
          }
        },
        onCancel: () => {
          setError('Payment was cancelled')
        },
      })
      handler.openIframe()
    } catch (err: any) {
      setError(err.message || 'Purchase failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Purchase Energy</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-white font-medium">{listing.title}</p>
          <p className="text-gray-400 text-sm">
            from {listing.sellerName} • {listing.locationCity}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Amount (kWh)
          </label>
          <input
            type="number"
            value={kwhAmount}
            onChange={handleKwhChange}
            min={listing.minPurchaseKwh}
            max={listing.maxPurchaseKwh || listing.kwhAvailable}
            step="0.5"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
          <p className="text-xs text-gray-400 mt-1">
            Min: {listing.minPurchaseKwh} kWh | Max: {listing.maxPurchaseKwh || listing.kwhAvailable} kWh
          </p>
        </div>

        <div className="border-t border-gray-700 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Platform Fee (2%)</span>
            <span className="text-white">₦{fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-700">
            <span className="text-white">Total</span>
            <span className="text-green-500">₦{total.toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay ₦${total.toLocaleString()}`}
        </button>
      </div>
    </div>
  )
}