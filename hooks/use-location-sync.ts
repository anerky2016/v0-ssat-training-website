'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { auth } from '@/lib/firebase'
import { getDeviceInfo } from '@/lib/utils/device-id'
import type { UserLocation, LocationSyncState, LocationSyncOptions } from '@/lib/types/location-sync'
import { useToast } from '@/hooks/use-toast'
import type { RealtimeChannel } from '@supabase/supabase-js'

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

  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [
    options.enabled,
    options.debounceMs,
    options.showNotification,
  ])
  const deviceInfo = useRef(getDeviceInfo())
  const debounceTimer = useRef<NodeJS.Timeout>()
  const lastSyncedPath = useRef<string>('')

  /**
   * Navigate to the synced location
   */
  const navigateToSynced = useCallback(() => {
    setState(prev => {
      if (prev.syncedLocation && typeof window !== 'undefined') {
        window.location.href = prev.syncedLocation.path
      }
      return { ...prev, syncedLocation: null }
    })
  }, [])

  /**
   * Update location in Supabase
   */
  const updateLocation = useCallback(async (path: string) => {
    const user = auth?.currentUser

    // Skip if not authenticated
    if (!user) {
      console.log('Location sync: User not authenticated, skipping sync')
      return
    }

    // Skip if Supabase not available
    if (!supabase) {
      console.log('Location sync: Supabase not initialized, skipping sync')
      return
    }

    // Skip if disabled
    if (!opts.enabled) {
      return
    }

    try {
      const location: UserLocation = {
        path,
        timestamp: Date.now(),
        deviceId: deviceInfo.current.deviceId,
        deviceName: deviceInfo.current.deviceName,
        pageTitle: typeof document !== 'undefined' ? document.title : undefined,
      }

      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.uid,
          path: location.path,
          timestamp: location.timestamp,
          device_id: location.deviceId,
          device_name: location.deviceName || null,
          page_title: location.pageTitle || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,device_id',
        })

      if (error) {
        throw error
      }

      setState(prev => ({
        ...prev,
        currentLocation: location,
        isSyncing: false,
      }))

      console.log('✅ Location synced successfully:', path)
    } catch (error: any) {
      console.error('❌ Error syncing location:', error)
      console.error('Error message:', error.message)

      // Don't show errors to user if Supabase is not set up
      // This prevents annoying errors during development
      setState(prev => ({ ...prev, isSyncing: false }))
    }
  }, [opts.enabled])

  /**
   * Listen to location changes from other devices
   */
  useEffect(() => {
    const user = auth?.currentUser
    if (!user || !supabase || !opts.enabled) return

    setState(prev => ({ ...prev, isActive: true }))

    // Subscribe to real-time changes for this user's locations from other devices
    const channel: RealtimeChannel = supabase
      .channel(`user_locations:${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_locations',
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
          const remoteLocation = payload.new as any

          if (!remoteLocation) return

          // Ignore updates from this device
          if (remoteLocation.device_id === deviceInfo.current.deviceId) return

          // Ignore if we're already on this path
          if (remoteLocation.path === pathname) return

          // Ignore if this is an old update
          if (lastSyncedPath.current === remoteLocation.path) return

          // Convert to UserLocation format
          const location: UserLocation = {
            path: remoteLocation.path,
            timestamp: remoteLocation.timestamp,
            deviceId: remoteLocation.device_id,
            deviceName: remoteLocation.device_name,
            pageTitle: remoteLocation.page_title,
          }

          // Update synced location
          setState(prev => ({
            ...prev,
            syncedLocation: location,
          }))

          lastSyncedPath.current = location.path

          // Show notification
          if (opts.showNotification) {
            const pageInfo = location.pageTitle || location.path
            const deviceName = location.deviceName || 'another device'

            toast.info(
              `Continue from ${deviceName}? You were viewing "${pageInfo}". Click to go there.`,
              {
                duration: 10000,
                onClick: navigateToSynced,
              }
            )
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
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
