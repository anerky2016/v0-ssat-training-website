"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { saveLastLocation } from '@/lib/last-location'

/**
 * Hook to automatically track the user's current location
 * Call this in a client component to enable location tracking
 */
export function useLastLocationTracking() {
  const pathname = usePathname()

  useEffect(() => {
    // Save the current location whenever the path changes
    if (pathname) {
      saveLastLocation(pathname)
    }
  }, [pathname])
}
