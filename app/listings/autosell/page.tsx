'use client'
import BackButton from '@/components/BackButton'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { Icons } from '@/components/icons'

export default function AutoSellPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rule, setRule] = useState({
    isActive: false,
    triggerKwhThreshold: 10,
    listKwhAmount: 5,
    pricePerKwh: 95,
    minPricePerKwh: 80,
    maxPricePerKwh: 120,
    energySource: 'solar',
    autoExpireHours: 24,
    notifyOnList: true,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchRule()
    }
  }, [user])

  const fetchRule = async () => {
    if (!user) return
    try {
      const ruleRef = doc(db, 'autoSellRules', user.uid)
      const ruleSnap = await getDoc(ruleRef)
      if (ruleSnap.exists()) {
        setRule(ruleSnap.data() as any)
      }
    } catch (error) {
      console.error('Error fetching auto-sell rule:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value
    setRule({ ...rule, [e.target.name]: value })
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRule({ ...rule, [e.target.name]: parseFloat(e.target.value) || 0 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    if (rule.triggerKwhThreshold <= 0) {
      setError('Trigger threshold must be greater than 0')
      setSaving(false)
      return
    }

    if (rule.listKwhAmount <= 0) {
      setError('Listing amount must be greater than 0')
      setSaving(false)
      return
    }

    if (rule.pricePerKwh < rule.minPricePerKwh) {
      setError('Price cannot be below minimum floor')
      setSaving(false)
      return
    }

    if (rule.pricePerKwh > rule.maxPricePerKwh) {
      setError('Price cannot be above maximum ceiling')
      setSaving(false)
      return
    }

    try {
      const ruleRef = doc(db, 'autoSellRules', user!.uid)
      await setDoc(ruleRef, {
        ...rule,
        userId: user!.uid,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
      setSuccess('Auto-sell rule saved successfully')
    } catch (err) {
      setError('Failed to save auto-sell rule')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <BackButton />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
        <BackButton />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <Icons.ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-white">Auto-Sell Settings</h1>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-white">Automatic Listing</h2>
              <p className="text-sm text-gray-400">Create listings automatically when you have surplus energy</p>
            </div>
            <button
              onClick={() => setRule({ ...rule, isActive: !rule.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                rule.isActive ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  rule.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-green-500 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Trigger when kWh balance exceeds
              </label>
              <input
                type="number"
                name="triggerKwhThreshold"
                value={rule.triggerKwhThreshold}
                onChange={handleNumberChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                step="1"
                min="1"
                disabled={!rule.isActive}
              />
              <p className="text-xs text-gray-500 mt-1">Create a listing when your kWh balance reaches this amount</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                List this many kWh
              </label>
              <input
                type="number"
                name="listKwhAmount"
                value={rule.listKwhAmount}
                onChange={handleNumberChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                step="0.5"
                min="0.5"
                disabled={!rule.isActive}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Price per kWh (₦)
              </label>
              <input
                type="number"
                name="pricePerKwh"
                value={rule.pricePerKwh}
                onChange={handleNumberChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                step="5"
                min="50"
                max="500"
                disabled={!rule.isActive}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Minimum Price (Floor)
                </label>
                <input
                  type="number"
                  name="minPricePerKwh"
                  value={rule.minPricePerKwh}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  step="5"
                  disabled={!rule.isActive}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Maximum Price (Ceiling)
                </label>
                <input
                  type="number"
                  name="maxPricePerKwh"
                  value={rule.maxPricePerKwh}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  step="5"
                  disabled={!rule.isActive}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Energy Source
              </label>
              <select
                name="energySource"
                value={rule.energySource}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                disabled={!rule.isActive}
              >
                <option value="solar">Solar</option>
                <option value="generator">Generator</option>
                <option value="inverter">Inverter</option>
                <option value="battery">Battery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Auto-expire listing after
              </label>
              <select
                name="autoExpireHours"
                value={rule.autoExpireHours}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                disabled={!rule.isActive}
              >
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={0}>Never</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Notify me when auto-listing fires</label>
              <button
                type="button"
                onClick={() => setRule({ ...rule, notifyOnList: !rule.notifyOnList })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                  rule.notifyOnList ? 'bg-green-600' : 'bg-gray-600'
                }`}
                disabled={!rule.isActive}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                    rule.notifyOnList ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Icons.Lightning className="w-5 h-5" />
                  Save Auto-Sell Rule
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}