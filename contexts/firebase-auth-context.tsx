'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

export function FirebaseAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      console.log('🔐 Auth: No Firebase auth instance available')
      setLoading(false)
      return
    }

    console.log('🔐 Auth: Starting auth state check...')
    const startTime = Date.now()

    let cancelled = false

    // Use authStateReady() for faster initial auth state
    const initAuth = async () => {
      try {
        // Wait for auth state to be ready with a timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 2000)
        )

        await Promise.race([
          auth.authStateReady(),
          timeoutPromise
        ])

        if (!cancelled) {
          const elapsed = Date.now() - startTime
          const user = auth.currentUser
          console.log(`✅ Auth: Auth ready in ${elapsed}ms, user: ${user ? user.email || user.uid : 'none'}`)
          setUser(user)
          setLoading(false)
        }
      } catch (error) {
        if (!cancelled) {
          const elapsed = Date.now() - startTime
          console.warn(`⚠️ Auth: Auth check timeout after ${elapsed}ms, using current state`)
          // Use whatever state we have now
          setUser(auth.currentUser)
          setLoading(false)
        }
      }
    }

    initAuth()

    // Also set up listener for future auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!cancelled) {
        console.log(`🔄 Auth: State changed, user: ${user ? user.email || user.uid : 'none'}`)
        setUser(user)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
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

  // Block rendering children until auth state is loaded
  // This ensures all child components know the correct auth state from the start
  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </AuthContext.Provider>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
