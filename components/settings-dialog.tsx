'use client'

import { Settings, Crown, Laptop } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useUserSettings } from '@/hooks/use-user-settings'
import { useAuth } from '@/contexts/firebase-auth-context'
import { getDeviceInfo } from '@/lib/utils/device-id'
import { Badge } from '@/components/ui/badge'

export function SettingsDialog() {
  const { user } = useAuth()
  const { settings, devices, isLoading, toggleLocationSync, setMasterDevice, refresh } = useUserSettings()
  const currentDeviceInfo = getDeviceInfo()
  const currentDeviceId = currentDeviceInfo.deviceId

  if (!user) {
    return null // Don't show settings if user is not logged in
  }

  // Ensure current device is always in the list, even if not synced yet
  const allDevices = [...devices]
  const currentDeviceExists = devices.some(d => d.device_id === currentDeviceId)

  if (!currentDeviceExists) {
    // Add current device to the list with current timestamp
    allDevices.unshift({
      device_id: currentDeviceId,
      device_name: currentDeviceInfo.deviceName,
      user_id: user.uid,
      last_active: Date.now(),
      is_online: true,
      updated_at: new Date().toISOString(),
    })
  }

  // Debug logging
  console.log('🔍 SettingsDialog Debug:')
  console.log('   settings:', settings)
  console.log('   location_sync_enabled:', settings?.location_sync_enabled)
  console.log('   master_device_id:', settings?.master_device_id)
  console.log('   Should show "No Master" UI:', settings?.location_sync_enabled && !settings?.master_device_id)
  console.log('   devices from DB:', devices.length)
  console.log('   allDevices (including current):', allDevices.length)
  console.log('')
  console.log('📋 All Devices:')
  allDevices.forEach((device, index) => {
    const isMaster = device.device_id === settings?.master_device_id
    const isCurrent = device.device_id === currentDeviceId
    const tags = []
    if (isCurrent) tags.push('This Device')
    if (isMaster) tags.push('👑 Master')
    const tagStr = tags.length > 0 ? ` [${tags.join(', ')}]` : ''
    console.log(`   ${index + 1}. ${device.device_name || 'Unknown'}${tagStr}`)
    console.log(`      ID: ${device.device_id}`)
    console.log(`      Last active: ${new Date(device.last_active).toLocaleString()}`)
    console.log(`      Online: ${device.is_online ? 'Yes' : 'No'}`)
  })
  console.log('')

  const handleSetMaster = async (deviceId: string) => {
    const success = await setMasterDevice(deviceId)
    if (success) {
      // Refresh to get updated device list
      refresh()
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your preferences and account settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Debug Info - Temporary */}
          <div className="p-3 rounded-lg bg-muted text-xs font-mono">
            <div className="font-bold mb-2">Debug Info:</div>
            <div>location_sync_enabled: {String(settings?.location_sync_enabled)}</div>
            <div>master_device_id: {settings?.master_device_id || 'null'}</div>
            <div>devices.length: {devices.length}</div>
            <div>location_sync_enabled !== false: {String(settings?.location_sync_enabled !== false)}</div>
            <div>Should show warning: {String((settings?.location_sync_enabled !== false) && !settings?.master_device_id)}</div>
          </div>

          {/* Location Sync Toggle */}
          <div className="flex items-center justify-between space-x-2 pb-4 border-b">
            <Label htmlFor="location-sync" className="flex flex-col space-y-1">
              <span>Sync location across devices</span>
              <span className="font-normal text-sm text-muted-foreground">
                Automatically sync your current page and scroll position across all your devices
              </span>
            </Label>
            <Switch
              id="location-sync"
              checked={settings?.location_sync_enabled ?? true}
              onCheckedChange={toggleLocationSync}
              disabled={isLoading}
            />
          </div>

          {/* No Master Warning - Show even if no devices yet */}
          {/* Treat undefined location_sync_enabled as true (default enabled) */}
          {(settings?.location_sync_enabled !== false) && !settings?.master_device_id && (
            <div className="p-4 rounded-lg border-2 border-orange-500 bg-orange-500/10">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-orange-500/20 p-2">
                  <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      No Master Device Set
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No device is currently controlling navigation. This device should become the master.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSetMaster(currentDeviceId)}
                    disabled={isLoading}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Become Master Device
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Device Management */}
          {(settings?.location_sync_enabled !== false) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Device Management</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    The master device controls navigation. Slave devices follow the master automatically.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Past 90 days
                </Badge>
              </div>

              {allDevices.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed text-center text-muted-foreground text-sm">
                  <Laptop className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No devices in the past 90 days</p>
                  <p className="text-xs mt-1">Navigate to pages to start syncing</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allDevices.map((device) => {
                    const isMaster = device.device_id === settings?.master_device_id
                    const isCurrent = device.device_id === currentDeviceId
                    const timeSinceSync = Date.now() - device.last_active
                    const daysAgo = Math.floor(timeSinceSync / (24 * 60 * 60 * 1000))
                    const isStale = daysAgo > 7 // Inactive if > 7 days old

                    return (
                      <div
                        key={device.device_id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isCurrent ? 'bg-muted/50 border-primary/50' :
                          isStale ? 'bg-background opacity-60' : 'bg-background'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Laptop className={`h-4 w-4 flex-shrink-0 ${
                            isStale ? 'text-muted-foreground/50' : 'text-muted-foreground'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium truncate ${
                                isStale ? 'text-muted-foreground' : ''
                              }`}>
                                {device.device_name || 'Unknown Device'}
                              </span>
                              {isCurrent && (
                                <Badge variant="outline" className="text-xs">This Device</Badge>
                              )}
                              {isMaster && (
                                <Badge variant="default" className="text-xs flex items-center gap-1">
                                  <Crown className="h-3 w-3" />
                                  Master
                                </Badge>
                              )}
                              {isStale && !isCurrent && (
                                <Badge variant="secondary" className="text-xs opacity-70">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last active: {formatTimestamp(device.last_active)}
                              {daysAgo > 0 && ` (${daysAgo}d ago)`}
                            </div>
                          </div>
                        </div>

                        {!isMaster && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetMaster(device.device_id)}
                            disabled={isLoading}
                            className="ml-2"
                          >
                            Set as Master
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
