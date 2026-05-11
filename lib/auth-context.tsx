'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
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
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [wallet, setWallet] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists()) setProfile(snap.data())
    } catch (err) {
      // Non-fatal — user is still authenticated
      console.error('fetchProfile error:', err)
    }
  }

  const fetchWallet = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'wallets', uid))
      if (snap.exists()) setWallet(snap.data())
    } catch (err) {
      console.error('fetchWallet error:', err)
    }
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid)
  }

  const refreshWallet = async () => {
    if (user) await fetchWallet(user.uid)
  }

  const signOut = async () => {
    await firebaseLogout()
    setUser(null)
    setProfile(null)
    setWallet(null)
  }

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // Fetch in parallel; errors are caught inside each function
        // so loading ALWAYS resolves even if Firestore is slow or blocked
        await Promise.all([
          fetchProfile(currentUser.uid),
          fetchWallet(currentUser.uid),
        ])
      } else {
        setProfile(null)
        setWallet(null)
      }
      // Always reach this line — no more infinite loading on mobile
      setLoading(false)
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