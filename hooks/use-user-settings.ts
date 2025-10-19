'use client'

import { useEffect, useState, useCallback } from 'react'
import { auth } from '@/lib/firebase'
import {
  getUserSettings,
  saveUserSettings,
  getUserDevices,
  setMasterDevice as setMasterDeviceDb,
  type UserSettings,
  type UserDevice
} from '@/lib/supabase'

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [devices, setDevices] = useState<UserDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user settings and devices
  const loadSettings = useCallback(async () => {
    const user = auth?.currentUser
    if (!user) {
      setSettings(null)
      setDevices([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const [userSettings, userDevices] = await Promise.all([
        getUserSettings(user.uid),
        getUserDevices(user.uid)
      ])
      setSettings(userSettings)
      setDevices(userDevices)
      setError(null)
    } catch (err: any) {
      console.error('Error loading user settings:', err)
      setError(err.message || 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    const user = auth?.currentUser
    if (!user) {
      setError('User not authenticated')
      return false
    }

    try {
      const updated = await saveUserSettings(user.uid, newSettings)
      if (updated) {
        setSettings(updated)
        setError(null)
        return true
      }
      return false
    } catch (err: any) {
      console.error('Error updating user settings:', err)
      setError(err.message || 'Failed to update settings')
      return false
    }
  }, [])

  // Toggle location sync
  const toggleLocationSync = useCallback(async () => {
    if (!settings) return false

    const newValue = !settings.location_sync_enabled
    const success = await updateSettings({ location_sync_enabled: newValue })

    if (success) {
      console.log(`Location sync ${newValue ? 'enabled' : 'disabled'}`)
    }

    return success
  }, [settings, updateSettings])

  // Set master device
  const setMasterDevice = useCallback(async (deviceId: string) => {
    const user = auth?.currentUser
    if (!user) {
      setError('User not authenticated')
      return false
    }

    try {
      const updated = await setMasterDeviceDb(user.uid, deviceId)
      if (updated) {
        setSettings(updated)
        setError(null)
        console.log(`Master device set to: ${deviceId}`)
        return true
      }
      return false
    } catch (err: any) {
      console.error('Error setting master device:', err)
      setError(err.message || 'Failed to set master device')
      return false
    }
  }, [])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    devices,
    isLoading,
    error,
    updateSettings,
    toggleLocationSync,
    setMasterDevice,
    refresh: loadSettings,
  }
}
