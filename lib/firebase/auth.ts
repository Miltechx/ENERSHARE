import { auth } from "./config"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth"

export const signUp = async (email: string, password: string, fullName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCredential.user, { displayName: fullName })
  return userCredential.user
}

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
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
