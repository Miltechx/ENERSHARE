import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Single app instance — getApp() reuses it if already initialized
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Single auth instance for the whole app.
// Everything imports auth from HERE — auth.ts, auth-context.tsx, all pages.
// Having multiple getAuth(app) calls creates separate instances; setPersistence
// on one does not affect the others, which is what broke mobile sessions.
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app

// Store sessions in localStorage so mobile browsers don't wipe them when
// the tab goes to background. Default Firebase persistence on mobile is
// sessionStorage, which is cleared on tab switch / background kill.
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error('Firebase: failed to set auth persistence:', err)
})