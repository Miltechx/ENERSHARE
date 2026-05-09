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
    const profileDoc = await getDoc(doc(db, 'users', uid))
    if (profileDoc.exists()) {
      setProfile(profileDoc.data())
    }
  }

  const fetchWallet = async (uid: string) => {
    const walletDoc = await getDoc(doc(db, 'wallets', uid))
    if (walletDoc.exists()) {
      setWallet(walletDoc.data())
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
        await Promise.all([fetchProfile(currentUser.uid), fetchWallet(currentUser.uid)])
      } else {
        setProfile(null)
        setWallet(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, wallet, loading, signOut, refreshProfile, refreshWallet }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)