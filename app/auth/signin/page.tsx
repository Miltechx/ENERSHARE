'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  getIdToken,
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase/client'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { Icons } from '@/components/icons'

async function createSession(user: any) {
  const idToken = await getIdToken(user)
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) throw new Error('Session creation failed')
}

async function ensureUserDocs(user: any) {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      fullName: user.displayName || user.email?.split('@')[0] || '',
      email: user.email,
      role: 'consumer',
      createdAt: new Date().toISOString(),
    })
  }
  const walletRef = doc(db, 'wallets', user.uid)
  const walletSnap = await getDoc(walletRef)
  if (!walletSnap.exists()) {
    await setDoc(walletRef, {
      userId: user.uid,
      kwhBalance: 0,
      nairaBalance: 0,
      totalEarned: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    })
  }
}

// Detect mobile browsers — popups are blocked on most mobile browsers
function isMobile() {
  if (typeof window === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
}

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(true) // true initially to handle redirect result
  const [error, setError]       = useState('')

  // Handle the redirect result when user comes back from Google on mobile
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result?.user) {
          await ensureUserDocs(result.user)
          await createSession(result.user)
          window.location.href = callbackUrl
          return
        }
      } catch (err: any) {
        const code = err?.code ?? ''
        if (code !== 'auth/no-current-user') {
          setError('Google sign in failed. Please try again.')
        }
      }
      setLoading(false)
    }
    handleRedirectResult()
  }, [callbackUrl])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      await ensureUserDocs(user)
      await createSession(user)
      window.location.href = callbackUrl
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setError('Invalid email or password.')
      } else if (code === 'auth/user-not-found') {
        setError('No account found with this email.')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.')
      } else {
        setError(err.message || 'Failed to sign in. Please try again.')
      }
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      if (isMobile()) {
        // Mobile: redirect flow (popup is blocked by mobile browsers)
        await signInWithRedirect(auth, provider)
        // Page will reload — result handled in useEffect above
      } else {
        // Desktop: popup flow
        const { user } = await signInWithPopup(auth, provider)
        await ensureUserDocs(user)
        await createSession(user)
        window.location.href = callbackUrl
      }
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError('Google sign in failed. Please try again.')
      }
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-6 sm:p-8">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Icons.Lightning className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-2">Sign in to your EnerShare account</p>
        </div>

        {searchParams.get('registered') && (
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-3 mb-6">
            <p className="text-green-400 text-sm">Account created! Please sign in.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-sm text-green-500 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 text-base"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">Or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-base disabled:opacity-50"
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
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-green-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}