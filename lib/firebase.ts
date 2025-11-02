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

  // Try to initialize auth with IndexedDB persistence
  // If auth was already initialized, initializeAuth will throw, so we'll use getAuth instead
  try {
    auth = initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
    })
    console.log('🔐 Auth initialized with IndexedDB persistence')
  } catch (error: any) {
    // Auth was already initialized, use existing instance
    // getAuth will return the existing auth instance with its current persistence settings
    if (error.code === 'auth/already-initialized') {
      auth = getAuth(app)
      console.log('🔐 Auth already initialized, using existing instance')
    } else {
      // Unexpected error
      console.error('🔐 Error initializing auth:', error)
      // Fall back to getAuth anyway
      auth = getAuth(app)
      console.log('🔐 Fallback: Using default auth instance')
    }
  }

  console.log(`🔐 Auth initialized in ${Date.now() - authStartTime}ms`)
}

export { app, auth }
