'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { logUserLogin } from '@/lib/supabase'

export function useLoginTracker() {
  const { data: session, status } = useSession()
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    // Only track once per session and only when authenticated
    if (status === 'authenticated' && session?.user && !hasTrackedRef.current) {
      hasTrackedRef.current = true

      // Get user agent
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined

      // Determine provider from session (Google, credentials, etc.)
      const provider = (session as any)?.provider || 'credentials'
      const providerId = session.user.id || session.user.email || 'unknown'

      // Log the login
      logUserLogin({
        user_id: session.user.email || 'unknown',
        email: session.user.email || '',
        name: session.user.name || '',
        image: session.user.image || undefined,
        user_agent: userAgent,
        provider,
        provider_id: providerId,
      })
    }
  }, [session, status])
}
