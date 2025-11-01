import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if Firebase is configured
const isConfigured = firebaseConfig.apiKey &&
                     firebaseConfig.authDomain &&
                     firebaseConfig.projectId

// Initialize Firebase only if configured
let app: FirebaseApp | null = null
let auth: Auth | null = null

if (isConfigured) {
  console.log('🔥 Initializing Firebase...')
  const startTime = Date.now()

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

  console.log(`🔥 Firebase app initialized in ${Date.now() - startTime}ms`)
  console.log('🔐 Initializing Auth with IndexedDB persistence...')
  const authStartTime = Date.now()

  // Use initializeAuth to explicitly set persistence
  if (getApps().length === 1) {
    // First initialization
    auth = initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
    })
  } else {
    // Already initialized
    auth = getAuth(app)
  }

  console.log(`🔐 Auth initialized in ${Date.now() - authStartTime}ms`)
}

export { app, auth }
