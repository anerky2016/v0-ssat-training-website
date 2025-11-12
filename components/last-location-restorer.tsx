"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getLastLocation, clearLastLocation } from '@/lib/last-location'
import { useLastLocationTracking } from '@/hooks/use-last-location'

/**
 * Component to restore the user's last location when they return to the app
 * This should be included in the root layout
 */
export function LastLocationRestorer() {
  const router = useRouter()
  const pathname = usePathname()
  const [hasRestored, setHasRestored] = useState(false)

  // Enable automatic location tracking
  useLastLocationTracking()

  useEffect(() => {
    // Only run once on initial mount
    if (hasRestored) return

    // Only restore if we're on the home page
    // (user just opened the app or navigated to root)
    if (pathname !== '/') {
      setHasRestored(true)
      return
    }

    // Get the last saved location
    const lastLocation = getLastLocation()

    if (lastLocation && lastLocation !== '/') {
      console.log('📍 [Last Location] Restoring:', lastLocation)

      // Use router.push to navigate to the last location
      router.push(lastLocation)

      setHasRestored(true)
    } else {
      setHasRestored(true)
    }
  }, [pathname, router, hasRestored])

  // This component doesn't render anything
  return null
}
