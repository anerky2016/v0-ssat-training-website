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
    const setupStart = Date.now()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const totalElapsed = Date.now() - startTime
      const callbackDelay = Date.now() - setupStart
      console.log(`✅ Auth: Observer callback fired after ${callbackDelay}ms (total: ${totalElapsed}ms)`)
      console.log(`   User: ${user ? user.email || user.uid : 'none'}`)
      console.log(`   This delay suggests: ${callbackDelay > 10000 ? '🐌 SLOW FIREBASE AUTH SERVER RESPONSE or IndexedDB issue' : callbackDelay > 1000 ? '⚠️ Slow network or token validation' : '✅ Normal performance'}`)
      setUser(user)
      setLoading(false)
    })
    const setupEnd = Date.now()
    console.log(`🔐 Auth: Observer setup completed in ${setupEnd - setupStart}ms, waiting for callback...`)

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
