'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, getIdToken } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { signUp, signInWithGoogle } from '@/lib/firebase/auth'
import { db } from '@/lib/firebase/client'
import { Icons } from '@/components/icons'

// ─── Constants ─────────────────────────────────────────────────────────────────
const NIGERIAN_STATES = [
  'Lagos', 'Abuja', 'Rivers', 'Ogun', 'Oyo', 'Delta', 'Edo', 'Kano',
  'Kaduna', 'Enugu', 'Anambra', 'Imo', 'Abia', 'Akwa Ibom', 'Cross River',
  'Benue', 'Plateau', 'Nasarawa', 'Kwara', 'Niger', 'Sokoto', 'Katsina',
  'Zamfara', 'Kebbi', 'Jigawa', 'Yobe', 'Borno', 'Adamawa', 'Taraba',
  'Gombe', 'Bauchi', 'Ebonyi', 'Ekiti', 'Ondo', 'Osun',
]

// ─── Session helper ────────────────────────────────────────────────────────────
async function createSession(user: User) {
  const idToken = await getIdToken(user)
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Session creation failed')
  }
}

// ─── Firestore helpers ─────────────────────────────────────────────────────────
async function createUserDocs(
  user: User,
  extra: { fullName: string; phone: string; state: string; city: string }
) {
  const userRef = doc(db, 'users', user.uid)
  const exists = (await getDoc(userRef)).exists()
  if (!exists) {
    await setDoc(userRef, {
      uid: user.uid,
      fullName: extra.fullName || user.displayName || '',
      email: user.email,
      phone: extra.phone,
      role: 'consumer',
      state: extra.state,
      city: extra.city,
      createdAt: new Date().toISOString(),
    })
    await setDoc(doc(db, 'wallets', user.uid), {
      userId: user.uid,
      kwhBalance: 0,
      nairaBalance: 0,
      totalEarned: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    })
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    state: 'Lagos',
    city: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ── Email / Password sign-up ─────────────────────────────────────────────────
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      // signUp() returns User directly
      const user = await signUp(formData.email, formData.password, formData.fullName)

      await createUserDocs(user, {
        fullName: formData.fullName,
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
      })

      // Create server session then go straight to dashboard
      await createSession(user)
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Sign-up error:', err)
      const code = err?.code ?? ''
      if (code === 'auth/email-already-in-use') {
        setError('Email already registered. Please sign in.')
      } else if (code === 'auth/weak-password') {
        setError('Password too weak. Use at least 6 characters.')
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address.')
      } else {
        setError(err.message || 'Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Google sign-up ───────────────────────────────────────────────────────────
  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError('')
    try {
      // signInWithGoogle() returns User directly
      const user = await signInWithGoogle()

      await createUserDocs(user, {
        fullName: user.displayName || '',
        phone: '',
        state: 'Lagos',
        city: '',
      })

      await createSession(user)
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Google sign-up error:', err)
      const code = err?.code ?? ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('')
      } else if (code === 'auth/popup-blocked') {
        setError('Popup blocked by your browser. Please allow popups for this site.')
      } else {
        setError('Google sign up failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Icons.Lightning className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Join the energy revolution</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-6">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {NIGERIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">Or</span>
          </div>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-green-500 hover:underline">Sign in</Link>
        </p>

      </div>
    </div>
  )
}