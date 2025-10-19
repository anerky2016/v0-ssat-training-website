'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { auth } from '@/lib/firebase-auth'
import { getDeviceInfo } from '@/lib/utils/device-id'
import type { UserLocation, LocationSyncState, LocationSyncOptions } from '@/lib/types/location-sync'
import { useToast } from '@/hooks/use-toast'

const DEFAULT_OPTIONS: LocationSyncOptions = {
  enabled: true,
  debounceMs: 2000, // Wait 2 seconds before syncing
  showNotification: true,
}

/**
 * Hook for syncing user location across multiple devices
 *
 * Usage:
 * ```tsx
 * const { syncedLocation, navigateToSynced } = useLocationSync()
 * ```
 */
export function useLocationSync(options: LocationSyncOptions = {}) {
  const pathname = usePathname()
  const { toast } = useToast()
  const [state, setState] = useState<LocationSyncState>({
    currentLocation: null,
    syncedLocation: null,
    isActive: false,
    isSyncing: false,
  })

  const opts = { ...DEFAULT_OPTIONS, ...options }
  const deviceInfo = useRef(getDeviceInfo())
  const debounceTimer = useRef<NodeJS.Timeout>()
  const lastSyncedPath = useRef<string>('')

  /**
   * Navigate to the synced location
   */
  const navigateToSynced = useCallback(() => {
    if (state.syncedLocation && typeof window !== 'undefined') {
      window.location.href = state.syncedLocation.path
      setState(prev => ({ ...prev, syncedLocation: null }))
    }
  }, [state.syncedLocation])

  /**
   * Update location in Firestore
   */
  const updateLocation = useCallback(async (path: string) => {
    const user = auth?.currentUser
    if (!user || !db || !opts.enabled) return

    try {
      const location: UserLocation = {
        path,
        timestamp: Date.now(),
        deviceId: deviceInfo.current.deviceId,
        deviceName: deviceInfo.current.deviceName,
        pageTitle: typeof document !== 'undefined' ? document.title : undefined,
      }

      await setDoc(
        doc(db, 'users', user.uid),
        {
          currentLocation: location,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      setState(prev => ({
        ...prev,
        currentLocation: location,
        isSyncing: false,
      }))

      console.log('Location synced:', path)
    } catch (error) {
      console.error('Error syncing location:', error)
      setState(prev => ({ ...prev, isSyncing: false }))
    }
  }, [opts.enabled])

  /**
   * Listen to location changes from other devices
   */
  useEffect(() => {
    const user = auth?.currentUser
    if (!user || !db || !opts.enabled) return

    setState(prev => ({ ...prev, isActive: true }))

    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (!snapshot.exists()) return

        const data = snapshot.data()
        const remoteLocation = data.currentLocation as UserLocation | undefined

        if (!remoteLocation) return

        // Ignore updates from this device
        if (remoteLocation.deviceId === deviceInfo.current.deviceId) return

        // Ignore if we're already on this path
        if (remoteLocation.path === pathname) return

        // Ignore if this is an old update
        if (lastSyncedPath.current === remoteLocation.path) return

        // Update synced location
        setState(prev => ({
          ...prev,
          syncedLocation: remoteLocation,
        }))

        lastSyncedPath.current = remoteLocation.path

        // Show notification
        if (opts.showNotification) {
          toast({
            title: 'Continue from another device?',
            description: `You were viewing "${remoteLocation.pageTitle || remoteLocation.path}" on your ${remoteLocation.deviceName}`,
            action: (
              <button
                onClick={navigateToSynced}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Go there
              </button>
            ),
            duration: 10000, // Show for 10 seconds
          })
        }
      },
      (error) => {
        console.error('Error listening to location changes:', error)
      }
    )

    return () => {
      unsub()
      setState(prev => ({ ...prev, isActive: false }))
    }
  }, [opts.enabled, opts.showNotification, pathname, toast, navigateToSynced])

  /**
   * Sync current location when pathname changes
   */
  useEffect(() => {
    if (!opts.enabled || !pathname) return

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Debounce location updates
    setState(prev => ({ ...prev, isSyncing: true }))

    debounceTimer.current = setTimeout(() => {
      updateLocation(pathname)
    }, opts.debounceMs)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [pathname, opts.enabled, opts.debounceMs, updateLocation])

  return {
    ...state,
    navigateToSynced,
    deviceInfo: deviceInfo.current,
  }
}
