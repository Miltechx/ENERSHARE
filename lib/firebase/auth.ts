import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'

// Import the single auth instance from client.ts — this is the one that has
// browserLocalPersistence set on it. Using getAuth(app) here again would create
// a second instance that ignores the persistence setting, breaking mobile sessions.
import { auth } from './client'

export const googleProvider = new GoogleAuthProvider()

export const signUp = async (email: string, password: string, fullName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCredential.user, { displayName: fullName })
  return userCredential.user
}

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export const logout = async () => {
  await signOut(auth)
}

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email)
}

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export const getCurrentUser = () => {
  return auth.currentUser
}