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

    // Check if we already have a cached user synchronously
    if (auth.currentUser) {
      console.log('🚀 Auth: Found cached user immediately:', auth.currentUser.email)
      setUser(auth.currentUser)
      setLoading(false)
      // Still set up the listener to catch any auth changes
    } else {
      console.log('👀 Auth: No cached user, waiting for auth state...')
    }

    // Set a timeout to prevent indefinite waiting
    const timeout = setTimeout(() => {
      console.warn('⚠️ Auth: Auth state check timeout after 5s, proceeding without auth')
      setUser(null)
      setLoading(false)
    }, 5000)

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const elapsed = Date.now() - startTime
      console.log(`✅ Auth: Auth state resolved in ${elapsed}ms, user: ${user ? user.email || 'anonymous' : 'none'}`)
      clearTimeout(timeout)
      setUser(user)
      setLoading(false)
    })

    return () => {
      clearTimeout(timeout)
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
