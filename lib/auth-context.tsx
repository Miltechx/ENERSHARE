'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase/client'
import { onAuthChange, logout as firebaseLogout } from './firebase/auth'

interface AuthContextType {
  user: User | null
  profile: any | null
  wallet: any | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshWallet: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [wallet, setWallet]   = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists()) setProfile(snap.data())
      else setProfile(null)
    } catch (err) {
      console.error('fetchProfile error:', err)
    }
  }

  const fetchWallet = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'wallets', uid))
      if (snap.exists()) {
        setWallet(snap.data())
      } else {
        // Create wallet if missing
        const empty = {
          userId: uid, kwhBalance: 0, nairaBalance: 0,
          totalEarned: 0, totalSpent: 0,
          createdAt: new Date().toISOString(),
        }
        await setDoc(doc(db, 'wallets', uid), empty)
        setWallet(empty)
      }
    } catch (err) {
      console.error('fetchWallet error:', err)
    }
  }

  const refreshProfile = async () => { if (user) await fetchProfile(user.uid) }
  const refreshWallet  = async () => { if (user) await fetchWallet(user.uid)  }

  // ─── Sign out: clears Firebase auth + __session cookie + redirects ────────────
  const signOut = async () => {
    try {
      await firebaseLogout()
      await fetch('/api/auth/session', { method: 'DELETE' })
    } catch (err) {
      console.error('signOut error:', err)
    } finally {
      setUser(null)
      setProfile(null)
      setWallet(null)
      window.location.href = '/'   // full reload clears all state and cookie
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        await Promise.all([
          fetchProfile(currentUser.uid),
          fetchWallet(currentUser.uid),
        ])
      } else {
        setProfile(null)
        setWallet(null)
      }
      setLoading(false)  // always resolves — no infinite spinner on mobile
    })
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, profile, wallet, loading, signOut, refreshProfile, refreshWallet }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)