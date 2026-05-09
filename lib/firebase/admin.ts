// lib/firebase/admin.ts
// This file should only be imported in API routes (server-side only)

let adminDb: any = null
let adminAuth: any = null

// Only initialize on server side (prevents client-side errors)
if (typeof window === 'undefined') {
  try {
    const { initializeApp, getApps, cert } = require('firebase-admin/app')
    const { getFirestore } = require('firebase-admin/firestore')
    const { getAuth } = require('firebase-admin/auth')

    const hasAdminConfig = process.env.FIREBASE_ADMIN_PROJECT_ID && 
                           process.env.FIREBASE_ADMIN_CLIENT_EMAIL && 
                           process.env.FIREBASE_ADMIN_PRIVATE_KEY

    if (hasAdminConfig) {
      const app = getApps().find((a: any) => a.name === 'admin') || initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      }, 'admin')
      
      adminDb = getFirestore(app)
      adminAuth = getAuth(app)
      console.log('✅ Firebase Admin SDK initialized')
    } else {
      console.log('⚠️ Firebase Admin credentials missing - admin features disabled')
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error)
  }
}

export { adminDb, adminAuth }