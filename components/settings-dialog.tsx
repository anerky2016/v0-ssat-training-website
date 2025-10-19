'use client'

import { Settings } from 'lucide-react'
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

export function SettingsDialog() {
  const { user } = useAuth()
  const { settings, isLoading, toggleLocationSync } = useUserSettings()

  if (!user) {
    return null // Don't show settings if user is not logged in
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your preferences and account settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between space-x-2">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
