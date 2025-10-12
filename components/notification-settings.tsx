"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, BellOff, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  isNotificationSupported,
  areNotificationsEnabled,
  setNotificationEnabled,
  requestNotificationPermission,
  getNotificationPermission,
  checkAndNotifyDueLessons,
} from '@/lib/notifications'

export function NotificationSettings() {
  const [mounted, setMounted] = useState(false)
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [isRequesting, setIsRequesting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isNotificationSupported()) {
      setBrowserNotificationsEnabled(areNotificationsEnabled())
      setNotificationPermission(getNotificationPermission())
    }
  }, [])

  const handleBrowserNotificationToggle = async (enabled: boolean) => {
    if (!mounted) return

    if (enabled) {
      // Need to request permission first
      if (notificationPermission !== 'granted') {
        setIsRequesting(true)
        const permission = await requestNotificationPermission()
        setNotificationPermission(permission)
        setIsRequesting(false)

        if (permission === 'granted') {
          setBrowserNotificationsEnabled(true)
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)

          // Show a test notification
          setTimeout(() => {
            checkAndNotifyDueLessons()
          }, 500)
        }
      } else {
        setNotificationEnabled(true)
        setBrowserNotificationsEnabled(true)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } else {
      setNotificationEnabled(false)
      setBrowserNotificationsEnabled(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (!isNotificationSupported()) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Notifications Not Supported</CardTitle>
          </div>
          <CardDescription>
            Your browser doesn't support notifications, or you're using a private browsing mode.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Browser Notifications</CardTitle>
          </div>
          <CardDescription>
            Get notified when lessons are ready for review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="browser-notifications" className="text-base font-medium">
                Enable Browser Notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive daily reminders when you have lessons due for review
              </p>
            </div>
            <Switch
              id="browser-notifications"
              checked={browserNotificationsEnabled}
              onCheckedChange={handleBrowserNotificationToggle}
              disabled={isRequesting || notificationPermission === 'denied'}
            />
          </div>

          {notificationPermission === 'denied' && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Permission Denied</p>
                <p className="text-muted-foreground mt-1">
                  You've blocked notifications. To enable them, please update your browser settings.
                </p>
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Notifications Enabled!</p>
                <p className="text-muted-foreground mt-1">
                  You'll receive daily reminders when lessons are due for review.
                </p>
              </div>
            </div>
          )}

          {isRequesting && (
            <div className="text-center py-4">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
              <p className="text-sm text-muted-foreground mt-2">Requesting permission...</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-chart-5/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-chart-5" />
            <CardTitle className="text-lg">Email Notifications</CardTitle>
          </div>
          <CardDescription>
            Get email reminders for upcoming reviews (Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="email-notifications" className="text-base font-medium text-muted-foreground">
                Enable Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive weekly summaries of lessons due for review
              </p>
            </div>
            <Switch
              id="email-notifications"
              disabled
              checked={false}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            Email notifications will be available once you sign in with your Google account.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
