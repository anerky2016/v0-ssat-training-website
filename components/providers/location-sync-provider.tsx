'use client'

import { useLocationSync } from '@/hooks/use-location-sync'

/**
 * Provider component that enables location syncing across devices
 * Add this to your app layout to enable the feature
 *
 * Usage:
 * ```tsx
 * <LocationSyncProvider>
 *   {children}
 * </LocationSyncProvider>
 * ```
 */
export function LocationSyncProvider({ children }: { children: React.ReactNode }) {
  // Initialize location sync hook
  // The hook handles all the logic internally
  //
  // NOTE: Set enabled to false to disable location sync
  // This is useful if Firestore is not set up yet
  useLocationSync({
    enabled: true, // Temporarily disabled - enable after setting up Firestore
    debounceMs: 2000,
    showNotification: true,
  })

  // This provider doesn't need to provide any context
  // It just needs to run the hook
  return <>{children}</>
}
