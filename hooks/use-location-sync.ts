'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { supabase, getUserSettings } from '@/lib/supabase'
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
  const [userEnabledSync, setUserEnabledSync] = useState<boolean>(true)

  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [
    options.enabled,
    options.debounceMs,
    options.showNotification,
  ])

  // Combined enabled check: both provider setting AND user preference must be enabled
  const isEnabled = useMemo(() => opts.enabled && userEnabledSync, [opts.enabled, userEnabledSync])

  const deviceInfo = useRef(getDeviceInfo())
  const debounceTimer = useRef<NodeJS.Timeout>()
  const scrollDebounceTimer = useRef<NodeJS.Timeout>()
  const lastSyncedPath = useRef<string>('')
  const currentScrollPosition = useRef<number>(0)
  const toastRef = useRef(toast)

  // Keep toast ref up to date
  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  /**
   * Load user settings to check if location sync is enabled
   */
  useEffect(() => {
    const loadUserSettings = async () => {
      const user = auth?.currentUser
      if (!user) {
        setUserEnabledSync(true) // Default to enabled when not logged in
        return
      }

      try {
        const settings = await getUserSettings(user.uid)
        if (settings) {
          setUserEnabledSync(settings.location_sync_enabled)
        }
      } catch (error) {
        console.error('Error loading user settings:', error)
        // Default to enabled on error
        setUserEnabledSync(true)
      }
    }

    loadUserSettings()
  }, []) // Run once on mount

  /**
   * Track scroll position with debouncing
   */
  useEffect(() => {
    if (typeof window === 'undefined' || !isEnabled) return

    const handleScroll = () => {
      // Clear existing timer
      if (scrollDebounceTimer.current) {
        clearTimeout(scrollDebounceTimer.current)
      }

      // Debounce scroll updates - sync 1 second after scrolling stops
      scrollDebounceTimer.current = setTimeout(() => {
        const scrollY = window.scrollY || window.pageYOffset
        currentScrollPosition.current = Math.round(scrollY) // Round to integer for database

        // Sync the updated scroll position
        if (pathname) {
          updateLocation(pathname)
        }
      }, 1000) // 1 second debounce for scroll
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollDebounceTimer.current) {
        clearTimeout(scrollDebounceTimer.current)
      }
    }
  }, [isEnabled, pathname])

  /**
   * Navigate to the synced location
   */
  const navigateToSynced = useCallback(() => {
    setState(prev => {
      if (prev.syncedLocation && typeof window !== 'undefined') {
        const scrollPos = prev.syncedLocation.scrollPosition || 0

        // Navigate to the path
        window.location.href = prev.syncedLocation.path

        // Restore scroll position after navigation
        // Use setTimeout to wait for page load
        setTimeout(() => {
          window.scrollTo({ top: scrollPos, behavior: 'smooth' })
        }, 100)
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
    if (!isEnabled) {
      return
    }

    try {
      const location: UserLocation = {
        path,
        timestamp: Date.now(),
        deviceId: deviceInfo.current.deviceId,
        deviceName: deviceInfo.current.deviceName,
        pageTitle: typeof document !== 'undefined' ? document.title : undefined,
        scrollPosition: currentScrollPosition.current,
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
          scroll_position: location.scrollPosition || 0,
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

      const timestamp = new Date().toLocaleTimeString()
      console.log(`✅ Location synced successfully at ${timestamp}:`, path)
    } catch (error: any) {
      console.error('❌ Error syncing location:', error)
      console.error('Error message:', error.message)

      // Don't show errors to user if Supabase is not set up
      // This prevents annoying errors during development
      setState(prev => ({ ...prev, isSyncing: false }))
    }
  }, [isEnabled])

  /**
   * Listen to location changes from other devices
   */
  useEffect(() => {
    const user = auth?.currentUser
    if (!user || !supabase || !isEnabled) return

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
            scrollPosition: remoteLocation.scroll_position || 0,
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

            toastRef.current.info(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, opts.showNotification, pathname])

  /**
   * Sync current location when pathname changes
   */
  useEffect(() => {
    if (!isEnabled || !pathname) return

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
  }, [pathname, isEnabled, opts.debounceMs, updateLocation])

  return {
    ...state,
    navigateToSynced,
    deviceInfo: deviceInfo.current,
  }
}
