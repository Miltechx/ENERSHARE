import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Check if required environment variables exist
const hasAdminConfig = process.env.FIREBASE_ADMIN_PROJECT_ID && 
                       process.env.FIREBASE_ADMIN_CLIENT_EMAIL && 
                       process.env.FIREBASE_ADMIN_PRIVATE_KEY

let adminDb: any = null
let adminAuth: any = null

if (hasAdminConfig) {
  const app = getApps().length ? getApps()[0] : initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
  adminDb = getFirestore(app)
  adminAuth = getAuth(app)
  console.log('✅ Firebase Admin SDK initialized')
} else {
  console.log('⚠️ Firebase Admin SDK not configured - skipping')
}

export { adminDb, adminAuth }
