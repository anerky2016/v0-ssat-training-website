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
  const currentDeviceId = getDeviceInfo().deviceId

  if (!user) {
    return null // Don't show settings if user is not logged in
  }

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

          {/* Device Management */}
          {settings?.location_sync_enabled && devices.length > 0 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">Device Management</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  The master device controls navigation. Slave devices follow the master automatically.
                </p>
              </div>

              <div className="space-y-2">
                {devices.map((device) => {
                  const isMaster = device.device_id === settings?.master_device_id
                  const isCurrent = device.device_id === currentDeviceId

                  return (
                    <div
                      key={device.device_id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isCurrent ? 'bg-muted/50 border-primary/50' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Laptop className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
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
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last sync: {formatTimestamp(device.timestamp)}
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
