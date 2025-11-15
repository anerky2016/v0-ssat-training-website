'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import {
  isSessionTimedOut,
  initializeSession,
  clearLastActivity,
  startActivityTracking,
  stopActivityTracking,
} from '@/lib/session-timeout'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
}

// Maximum time to wait for auth state before rendering anyway (3 seconds)
const AUTH_TIMEOUT_MS = 3000

export function FirebaseAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const observerSetupRef = useRef(false)
  const firstCallbackReceivedRef = useRef(false)

  useEffect(() => {
    if (!auth) {
      console.log('🔐 Auth: No Firebase auth instance available')
      setLoading(false)
      return
    }

    // Prevent double setup in React Strict Mode
    if (observerSetupRef.current) {
      return
    }
    observerSetupRef.current = true

    console.log('🔐 Auth: Setting up auth state observer...')
    const startTime = Date.now()

    // Check if we have a currentUser immediately available (cached from IndexedDB)
    // Note: On page refresh, auth.currentUser might be null until Firebase restores from IndexedDB
    // So we should always wait for onAuthStateChanged to fire at least once
    const initialCachedUser = auth.currentUser
    firstCallbackReceivedRef.current = false
    
    if (initialCachedUser) {
      console.log(`⚡ Auth: Found cached user immediately: ${initialCachedUser.email || initialCachedUser.uid}`)
      // Optimistically set user, but still wait for observer to confirm
      setUser(initialCachedUser)
      setLoading(false)
    } else {
      console.log('🔐 Auth: No immediate cached user, waiting for IndexedDB restoration...')
      // Set a timeout to stop blocking UI if Firebase is slow
      timeoutRef.current = setTimeout(() => {
        setLoading((prevLoading) => {
          if (prevLoading && !firstCallbackReceivedRef.current) {
            console.warn('⚠️ Auth: Timeout reached, rendering UI without auth confirmation')
            return false
          }
          return prevLoading
        })
      }, AUTH_TIMEOUT_MS)
    }

    // Set up observer for auth state changes
    // This will fire immediately if there's a cached user in IndexedDB (restoration)
    // and also fires whenever auth state changes (sign in/out, token refresh, etc.)
    const setupStart = Date.now()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      firstCallbackReceivedRef.current = true
      const callbackDelay = Date.now() - setupStart
      const totalElapsed = Date.now() - startTime

      // Clear timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // Check for session timeout if user is logged in
      if (user && auth && isSessionTimedOut()) {
        console.warn('⏰ Session timeout: 7 days of inactivity - logging out user')
        try {
          await firebaseSignOut(auth)
          clearLastActivity()
          stopActivityTracking()
        } catch (error) {
          console.error('Error during session timeout logout:', error)
        }
        setUser(null)
        setLoading(false)
        return
      }

      // Always update user state when observer fires
      // This handles both initial restoration and subsequent changes
      const userChanged = initialCachedUser?.uid !== user?.uid
      if (userChanged || !initialCachedUser) {
        if (initialCachedUser) {
          console.log(`✅ Auth: Observer callback fired after ${callbackDelay}ms - user state changed`)
        } else {
          console.log(`✅ Auth: Observer callback fired after ${callbackDelay}ms - user restored from IndexedDB`)
        }
        console.log(`   User: ${user ? user.email || user.uid : 'none (logged out)'}`)
        console.log(`   Performance: ${callbackDelay > 10000 ? '🐌 SLOW - likely Firebase Auth server validation delay' : callbackDelay > 1000 ? '⚠️ Slow network or token validation' : '✅ Normal'}`)
      } else {
        console.log(`🔄 Auth: Observer confirmed cached user after ${callbackDelay}ms (token validated, no change)`)
      }

      // Handle user login/logout state changes
      if (user && !initialCachedUser) {
        // User just logged in
        console.log('🔐 User logged in - initializing session')
        initializeSession()
        startActivityTracking()
      } else if (!user && initialCachedUser) {
        // User just logged out
        console.log('🔐 User logged out - clearing session')
        clearLastActivity()
        stopActivityTracking()
      } else if (user) {
        // User session restored - start activity tracking
        startActivityTracking()
      }

      setUser(user)
      setLoading(false)
    })

    console.log(`🔐 Auth: Observer setup completed, ${initialCachedUser ? 'optimistically using cached user, waiting for confirmation' : 'waiting for IndexedDB restoration...'}`)

    return () => {
      unsubscribe()
      stopActivityTracking()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      observerSetupRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    if (!auth) {
      console.log('No auth instance available')
      return
    }
    console.log('Signing out user...')
    await firebaseSignOut(auth)
    clearLastActivity()
    stopActivityTracking()
    console.log('Firebase sign out completed')
    // Note: Redirection should be handled by the component using this function
  }

  const value = {
    user,
    loading,
    signOut,
  }

  // OPTIMIZED: Always render children immediately - don't block UI
  // Components can check `loading` state themselves if they need to wait
  // This prevents the full-screen spinner that blocks the entire app
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
