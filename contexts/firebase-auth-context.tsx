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

    console.log('🔐 Auth: Setting up auth state observer...')
    const startTime = Date.now()

    // Use onAuthStateChanged - it fires immediately when auth state is first known
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const elapsed = Date.now() - startTime
      console.log(`✅ Auth: State resolved in ${elapsed}ms, user: ${user ? user.email || user.uid : 'none'}`)
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
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

  // Show minimal loading state while waiting for auth state observer to fire
  // This ensures components always have correct auth state from the start
  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      </AuthContext.Provider>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
