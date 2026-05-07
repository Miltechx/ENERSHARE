import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Only initialize if we have the required env vars
const hasAdminConfig = process.env.FIREBASE_ADMIN_PROJECT_ID && 
                       process.env.FIREBASE_ADMIN_CLIENT_EMAIL && 
                       process.env.FIREBASE_ADMIN_PRIVATE_KEY

if (!hasAdminConfig) {
  console.error('❌ Firebase Admin credentials missing! Add to .env.local')
}

const app = getApps().length ? getApps()[0] : initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
})

const adminDb = getFirestore(app)
const adminAuth = getAuth(app)

export { adminDb, adminAuth }