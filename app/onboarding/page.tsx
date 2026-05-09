'use client'
import BackButton from '@/components/BackButton'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { useAuth } from '@/lib/auth-context'
import { NIGERIAN_STATES } from '@/types'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    state: '',
    city: '',
    area: '',
    energySource: 'solar',
    capacityKw: '',
    dailySurplusKwh: '',
    nin: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
    }
    if (profile?.onboardingCompleted) {
      router.push('/dashboard')
    }
  }, [user, profile, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const updateProfileField = async (updates: Record<string, any>) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), updates)
    await refreshProfile()
  }

  const handleNext = async () => {
    if (step === 1) {
      await updateProfileField({
        state: formData.state,
        city: formData.city,
        area: formData.area,
      })
      setStep(2)
    } else if (step === 2 && profile?.role !== 'consumer') {
      await updateProfileField({
        energySource: formData.energySource,
        capacityKw: parseFloat(formData.capacityKw) || 0,
        dailySurplusKwh: parseFloat(formData.dailySurplusKwh) || 0,
      })
      setStep(3)
    } else if (step === 2 && profile?.role === 'consumer') {
      setStep(3)
    } else if (step === 3) {
      setLoading(true)
      await updateProfileField({
        nin: formData.nin,
        kycStatus: 'submitted',
      })
      await updateProfileField({ onboardingCompleted: true })
      router.push('/dashboard')
    }
  }

  if (!user || profile?.onboardingCompleted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <BackButton />
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl p-8">
        {/* Progress Steps */}
        <div className="flex mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full mx-1 ${
                s <= step ? 'bg-green-600' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">Where are you located?</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                >
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Area (Optional)</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && profile?.role !== 'consumer' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">Tell us about your energy setup</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Energy Source</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'solar', label: 'Solar Panels' },
                    { value: 'generator', label: 'Generator' },
                    { value: 'inverter', label: 'Inverter' },
                    { value: 'battery', label: 'Battery Storage' },
                  ].map((source) => (
                    <button
                      key={source.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, energySource: source.value })}
                      className={`py-2 rounded-lg text-sm font-medium transition ${
                        formData.energySource === source.value
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {source.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Capacity (kW)</label>
                <input
                  type="number"
                  name="capacityKw"
                  value={formData.capacityKw}
                  onChange={handleChange}
                  placeholder="e.g., 3.5"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Daily Surplus (kWh)
                </label>
                <input
                  type="number"
                  name="dailySurplusKwh"
                  value={formData.dailySurplusKwh}
                  onChange={handleChange}
                  placeholder="e.g., 10"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  How many kWh do you typically have available to sell each day?
                </p>
              </div>
            </div>
          </>
        )}

        {step === 2 && profile?.role === 'consumer' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">Almost there!</h2>
            <p className="text-gray-300">
              You're all set to start buying clean, affordable energy from your neighbors.
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">Verify your identity</h2>
            <p className="text-gray-300 mb-4">
              We need your NIN (National Identification Number) for regulatory compliance.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">NIN</label>
              <input
                type="text"
                name="nin"
                value={formData.nin}
                onChange={handleChange}
                placeholder="11-digit NIN"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Your information is encrypted and used only for verification.
              </p>
            </div>
          </>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ml-auto"
          >
            {loading ? 'Processing...' : step === 3 ? 'Complete' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}