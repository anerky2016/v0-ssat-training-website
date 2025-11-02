'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

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
    const cachedUser = auth.currentUser
    if (cachedUser) {
      console.log(`⚡ Auth: Using cached user immediately: ${cachedUser.email || cachedUser.uid}`)
      setUser(cachedUser)
      setLoading(false)
      // Still set up observer to catch token refresh/validation updates
    } else {
      console.log('🔐 Auth: No cached user found')
      // Set a timeout to stop blocking UI if Firebase is slow
      timeoutRef.current = setTimeout(() => {
        setLoading((prevLoading) => {
          if (prevLoading) {
            console.warn('⚠️ Auth: Timeout reached, rendering UI without auth confirmation')
            return false
          }
          return prevLoading
        })
      }, AUTH_TIMEOUT_MS)
    }

    // Set up observer for auth state changes (validates token with Firebase servers)
    const setupStart = Date.now()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const callbackDelay = Date.now() - setupStart
      const totalElapsed = Date.now() - startTime

      // Clear timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // Update user if different from cached
      const userChanged = cachedUser?.uid !== user?.uid
      if (userChanged || !cachedUser) {
        console.log(`✅ Auth: Observer callback fired after ${callbackDelay}ms (total: ${totalElapsed}ms)`)
        console.log(`   User: ${user ? user.email || user.uid : 'none'}`)
        console.log(`   Performance: ${callbackDelay > 10000 ? '🐌 SLOW - likely Firebase Auth server validation delay' : callbackDelay > 1000 ? '⚠️ Slow network or token validation' : '✅ Normal'}`)
        setUser(user)
        setLoading(false)
      } else {
        console.log(`🔄 Auth: Observer confirmed cached user after ${callbackDelay}ms (token validated)`)
        // User didn't change, but we can mark as not loading if we haven't already
        setLoading((prevLoading) => {
          if (prevLoading) {
            return false
          }
          return prevLoading
        })
      }
    })

    console.log(`🔐 Auth: Observer setup completed, ${cachedUser ? 'using cached user immediately' : 'waiting for server validation...'}`)

    return () => {
      unsubscribe()
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
