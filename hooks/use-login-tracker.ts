'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/firebase-auth-context'

export function useLoginTracker() {
  const { user, loading } = useAuth()
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    // Login tracking disabled - no longer using Supabase for login logs
    // If you want to re-enable, uncomment the code below and create the user_login_logs table

    /*
    if (!loading && user && !hasTrackedRef.current) {
      hasTrackedRef.current = true

      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined
      const providerData = user.providerData[0]
      const provider = providerData?.providerId || 'phone'
      const providerId = user.uid

      logUserLogin({
        user_id: user.email || user.phoneNumber || user.uid,
        email: user.email || '',
        name: user.displayName || '',
        image: user.photoURL || undefined,
        user_agent: userAgent,
        provider,
        provider_id: providerId,
      })
    }
    */
  }, [user, loading])
}
