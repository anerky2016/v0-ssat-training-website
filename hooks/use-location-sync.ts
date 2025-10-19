'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { supabase, getUserSettings, setMasterDevice, getUserDevices } from '@/lib/supabase'
import { auth } from '@/lib/firebase'
import { getDeviceInfo } from '@/lib/utils/device-id'
import type { UserLocation, LocationSyncState, LocationSyncOptions } from '@/lib/types/location-sync'
import { useToast } from '@/hooks/use-toast'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Master device is considered offline if no update in last 5 minutes
const MASTER_OFFLINE_THRESHOLD_MS = 5 * 60 * 1000

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
  const [masterDeviceId, setMasterDeviceId] = useState<string | null>(null)
  const [isMaster, setIsMaster] = useState<boolean>(false)

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
   * Load user settings to check if location sync is enabled and determine master device
   */
  useEffect(() => {
    const loadUserSettings = async () => {
      const user = auth?.currentUser
      if (!user || !supabase) {
        setUserEnabledSync(true) // Default to enabled when not logged in
        setMasterDeviceId(null)
        setIsMaster(false)
        return
      }

      // Print device/machine ID
      console.log('🖥️  DEVICE INFORMATION:')
      console.log(`   Device ID: ${deviceInfo.current.deviceId}`)
      console.log(`   Device Name: ${deviceInfo.current.deviceName}`)
      console.log('')

      try {
        const settings = await getUserSettings(user.uid)
        if (settings) {
          setUserEnabledSync(settings.location_sync_enabled)

          // Check if there's a master device set
          if (settings.master_device_id) {
            setMasterDeviceId(settings.master_device_id)
            const isThisMaster = settings.master_device_id === deviceInfo.current.deviceId
            setIsMaster(isThisMaster)

            // Get master device info from database
            const devices = await getUserDevices(user.uid)
            const masterDevice = devices.find(d => d.device_id === settings.master_device_id)
            const masterName = masterDevice?.device_name || settings.master_device_id

            console.log('🔍 DEVICE ROLE DETERMINATION:')
            console.log(`   Current master device: ${masterName}`)
            console.log(`   Master device ID: ${settings.master_device_id}`)
            console.log(`   Current device: ${deviceInfo.current.deviceName}`)
            console.log(`   Current device ID: ${deviceInfo.current.deviceId}`)
            console.log(`   → This device is: ${isThisMaster ? '👑 MASTER' : '🔗 SLAVE'}`)
          } else {
            // No master device set - auto-select the device with most recent timestamp
            console.log('🔍 NO MASTER DEVICE SET - AUTO-SELECTING...')
            const devices = await getUserDevices(user.uid)

            if (devices.length > 0) {
              // Sort by timestamp descending and pick the first one
              const mostRecentDevice = devices.sort((a, b) => b.timestamp - a.timestamp)[0]
              console.log(`   Found ${devices.length} device(s)`)
              console.log(`   Most recent device: ${mostRecentDevice.device_name || mostRecentDevice.device_id}`)
              console.log(`   → Promoting to MASTER: ${mostRecentDevice.device_id}`)

              // Set this device as master
              await setMasterDevice(user.uid, mostRecentDevice.device_id)
              setMasterDeviceId(mostRecentDevice.device_id)
              const isThisMaster = mostRecentDevice.device_id === deviceInfo.current.deviceId
              setIsMaster(isThisMaster)
              console.log(`   → This device is: ${isThisMaster ? '👑 MASTER' : '🔗 SLAVE'}`)
            } else {
              // No devices yet - make this device the master
              console.log(`   No devices found in database`)
              console.log(`   → Making current device MASTER: ${deviceInfo.current.deviceName || deviceInfo.current.deviceId}`)
              await setMasterDevice(user.uid, deviceInfo.current.deviceId)
              setMasterDeviceId(deviceInfo.current.deviceId)
              setIsMaster(true)
              console.log(`   ✅ This device is now: 👑 MASTER`)

              // Immediately send location update so this device appears in database
              if (pathname) {
                console.log(`   → Sending initial location update...`)
                await updateLocation(pathname)
              }
            }
          }
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
   * Update location in Supabase (only if this device is the master)
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

    // MASTER/SLAVE CHECK: Only master device can send location updates
    if (!isMaster) {
      console.log('🔗 SLAVE DEVICE - Location update blocked:')
      console.log(`   This device: ${deviceInfo.current.deviceName}`)
      console.log(`   Current master: ${masterDeviceId}`)
      console.log(`   Path: ${path}`)
      console.log(`   → Slaves cannot send location updates`)
      console.log(`   → Only listening for master's updates`)
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
      console.log(`👑 MASTER - Location synced successfully at ${timestamp}:`)
      console.log(`   Path: ${path}`)
      console.log(`   Scroll position: ${location.scrollPosition}px`)
      console.log(`   → Broadcasting to all slave devices`)
    } catch (error: any) {
      console.error('❌ Error syncing location:', error)
      console.error('Error message:', error.message)

      // Don't show errors to user if Supabase is not set up
      // This prevents annoying errors during development
      setState(prev => ({ ...prev, isSyncing: false }))
    }
  }, [isEnabled, isMaster])

  /**
   * Listen to location changes from master device
   */
  useEffect(() => {
    const user = auth?.currentUser
    if (!user || !supabase || !isEnabled || !masterDeviceId) return

    setState(prev => ({ ...prev, isActive: true }))

    // Subscribe to real-time changes for this user's locations
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

          // MASTER/SLAVE BEHAVIOR: Only listen to updates from master device
          if (remoteLocation.device_id !== masterDeviceId) {
            console.log(`Ignoring update from non-master device: ${remoteLocation.device_id}`)
            return
          }

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

          // SLAVE AUTO-NAVIGATION: If this is a slave device, automatically navigate
          if (!isMaster) {
            const pageInfo = location.pageTitle || location.path
            const masterName = location.deviceName || 'Master device'
            console.log('🔗 SLAVE - Received update from master:')
            console.log(`   Master device: ${masterName}`)
            console.log(`   Page: ${pageInfo}`)
            console.log(`   Path: ${location.path}`)
            console.log(`   Scroll position: ${location.scrollPosition}px`)
            console.log(`   → Auto-navigating now...`)
            navigateToSynced()
          } else {
            // Master device: Show notification (shouldn't happen, but keep as fallback)
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
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
      setState(prev => ({ ...prev, isActive: false }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, opts.showNotification, pathname, masterDeviceId, isMaster])

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

  /**
   * Monitor master device status and auto-promote if master goes offline
   */
  useEffect(() => {
    const user = auth?.currentUser
    if (!user || !supabase || !isEnabled || isMaster) return

    // If master is null, promote self immediately
    if (!masterDeviceId) {
      console.log('🚨 MASTER IS NULL - IMMEDIATE SELF PROMOTION:')
      console.log(`   → Promoting self (${deviceInfo.current.deviceName}) to MASTER`)
      setMasterDevice(user.uid, deviceInfo.current.deviceId)
      setMasterDeviceId(deviceInfo.current.deviceId)
      setIsMaster(true)
      toastRef.current.info('No master device - becoming MASTER')
      console.log(`   ✅ This device is now: 👑 MASTER`)
      return
    }

    // Only run this check on slave devices with a master
    const checkMasterStatus = async () => {
      try {
        // Get master device's last update
        const { data, error } = await supabase
          .from('user_locations')
          .select('timestamp, device_name')
          .eq('user_id', user.uid)
          .eq('device_id', masterDeviceId)
          .maybeSingle()

        if (error) {
          console.error('Error checking master device status:', error)
          return
        }

        if (!data) {
          console.log('🚨 MASTER PROMOTION - MASTER NOT FOUND:')
          console.log(`   Master device ID: ${masterDeviceId} not found in database`)
          console.log(`   → Promoting self (${deviceInfo.current.deviceName}) to MASTER`)
          toastRef.current.info('Becoming master device - previous master not found')
          await setMasterDevice(user.uid, deviceInfo.current.deviceId)
          setMasterDeviceId(deviceInfo.current.deviceId)
          setIsMaster(true)
          console.log(`   ✅ This device is now: 👑 MASTER`)
          return
        }

        // Check if master's last update is older than threshold
        const timeSinceLastUpdate = Date.now() - data.timestamp
        const minutesSinceUpdate = Math.round(timeSinceLastUpdate / 60000)
        const thresholdMinutes = Math.round(MASTER_OFFLINE_THRESHOLD_MS / 60000)

        if (timeSinceLastUpdate > MASTER_OFFLINE_THRESHOLD_MS) {
          const masterName = data.device_name || masterDeviceId
          console.log('🚨 MASTER PROMOTION - MASTER OFFLINE:')
          console.log(`   Master device: ${masterName}`)
          console.log(`   Last update: ${minutesSinceUpdate} minutes ago`)
          console.log(`   Threshold: ${thresholdMinutes} minutes`)
          console.log(`   → Master appears OFFLINE`)
          console.log(`   → Promoting self (${deviceInfo.current.deviceName}) to MASTER`)
          toastRef.current.info(`Becoming master device - "${masterName}" appears offline`)
          await setMasterDevice(user.uid, deviceInfo.current.deviceId)
          setMasterDeviceId(deviceInfo.current.deviceId)
          setIsMaster(true)
          console.log(`   ✅ This device is now: 👑 MASTER`)
        } else {
          console.log(`🔍 Master status check:`)
          console.log(`   Current master: ${masterName}`)
          console.log(`   Status: ONLINE (last update ${minutesSinceUpdate}m ago)`)
          console.log(`   This device: ${deviceInfo.current.deviceName} (SLAVE)`)
        }
      } catch (error) {
        console.error('Error in master status check:', error)
      }
    }

    // Check master status every minute
    const interval = setInterval(checkMasterStatus, 60000)

    // Also check immediately
    checkMasterStatus()

    return () => clearInterval(interval)
  }, [isEnabled, masterDeviceId, isMaster])

  /**
   * Subscribe to user_settings changes to detect master device changes
   */
  useEffect(() => {
    const user = auth?.currentUser
    if (!user || !supabase || !isEnabled) return

    // Subscribe to real-time changes for user settings
    const channel: RealtimeChannel = supabase
      .channel(`user_settings:${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
          const settings = payload.new as any

          if (!settings) return

          // Check if master device changed
          if (settings.master_device_id !== masterDeviceId) {
            // Handle case when master becomes null - promote self
            if (!settings.master_device_id) {
              console.log('🚨 MASTER IS NULL - SELF PROMOTION:')
              console.log(`   Previous master: ${masterDeviceId}`)
              console.log(`   New master: NULL`)
              console.log(`   → Promoting self (${deviceInfo.current.deviceName}) to MASTER`)

              // Promote this device to master
              setMasterDevice(user.uid, deviceInfo.current.deviceId)
              setMasterDeviceId(deviceInfo.current.deviceId)
              setIsMaster(true)
              toastRef.current.info('No master device - promoting self to MASTER')
              console.log(`   ✅ This device is now: 👑 MASTER`)
            } else {
              const isThisMaster = settings.master_device_id === deviceInfo.current.deviceId
              const newRole = isThisMaster ? 'MASTER' : 'SLAVE'

              console.log('🔄 MASTER DEVICE CHANGED:')
              console.log(`   Previous master: ${masterDeviceId}`)
              console.log(`   New master: ${settings.master_device_id}`)
              console.log(`   → This device is now: ${isThisMaster ? '👑 MASTER' : '🔗 SLAVE'}`)

              setMasterDeviceId(settings.master_device_id)
              setIsMaster(isThisMaster)

              // Show notification
              toastRef.current.info(`This device is now ${newRole}`)
            }
          }

          // Check if location sync enabled changed
          if (settings.location_sync_enabled !== undefined) {
            setUserEnabledSync(settings.location_sync_enabled)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [isEnabled, masterDeviceId])

  return {
    ...state,
    navigateToSynced,
    deviceInfo: deviceInfo.current,
    isMaster,
    masterDeviceId,
  }
}
