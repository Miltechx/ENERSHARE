'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase/client'
import { UserProfile, Wallet } from '@/types'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  wallet: Wallet | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshWallet: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (uid: string) => {
    const profileDoc = await getDoc(doc(db, 'users', uid))
    if (profileDoc.exists()) {
      setProfile(profileDoc.data() as UserProfile)
    }
  }

  const fetchWallet = async (uid: string) => {
    const walletDoc = await getDoc(doc(db, 'wallets', uid))
    if (walletDoc.exists()) {
      setWallet(walletDoc.data() as Wallet)
    }
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid)
  }

  const refreshWallet = async () => {
    if (user) await fetchWallet(user.uid)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setProfile(null)
    setWallet(null)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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