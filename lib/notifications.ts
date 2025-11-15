/**
 * Browser Notification System for Study Reminders
 */

import { getLessonsDueForReview } from './study-history'

const NOTIFICATION_PERMISSION_KEY = 'ssat-notification-permission-requested'
const NOTIFICATION_ENABLED_KEY = 'ssat-notifications-enabled'
const LAST_NOTIFICATION_KEY = 'ssat-last-notification-date'

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

/**
 * Check if notifications are enabled by user
 */
export function areNotificationsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(NOTIFICATION_ENABLED_KEY) === 'true'
}

/**
 * Set notification preference
 */
export function setNotificationEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTIFICATION_ENABLED_KEY, String(enabled))
}

/**
 * Check if we've already requested permission
 */
export function hasRequestedPermission(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === 'true'
}

/**
 * Mark that we've requested permission
 */
function markPermissionRequested() {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true')
}

/**
 * Request notification permission from browser
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied'
  }

  markPermissionRequested()

  try {
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      setNotificationEnabled(true)
    }

    return permission
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return 'denied'
  }
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * Check if we should show notification (not shown today)
 */
function shouldShowNotification(): boolean {
  if (typeof window === 'undefined') return false

  const lastNotificationDate = localStorage.getItem(LAST_NOTIFICATION_KEY)
  if (!lastNotificationDate) return true

  const today = new Date().toDateString()
  return lastNotificationDate !== today
}

/**
 * Mark that we've shown a notification today
 */
function markNotificationShown() {
  if (typeof window === 'undefined') return
  const today = new Date().toDateString()
  localStorage.setItem(LAST_NOTIFICATION_KEY, today)
}

/**
 * Show browser notification for due lessons
 */
export function showLessonDueNotification(lessonCount: number, lessonTitle?: string) {
  if (!isNotificationSupported()) return
  if (getNotificationPermission() !== 'granted') return
  if (!areNotificationsEnabled()) return
  if (!shouldShowNotification()) return

  try {
    let title = 'Study Reminder'
    let body = ''

    if (lessonCount === 1 && lessonTitle) {
      title = 'Time to Review!'
      body = `"${lessonTitle}" is ready for review. Keep your knowledge fresh!`
    } else if (lessonCount === 1) {
      title = 'Time to Review!'
      body = '1 lesson is ready for review. Keep your knowledge fresh!'
    } else {
      title = 'Study Reminder'
      body = `${lessonCount} lessons are ready for review. Stay on track with your spaced repetition!`
    }

    const notification = new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'lesson-due',
      requireInteraction: false,
      silent: false,
    })

    notification.onclick = () => {
      window.focus()
      window.location.href = '/progress'
      notification.close()
    }

    markNotificationShown()
  } catch (error) {
    console.error('Error showing notification:', error)
  }
}

/**
 * Check for due lessons and show notification if needed
 */
export function checkAndNotifyDueLessons() {
  if (!isNotificationSupported()) return
  if (getNotificationPermission() !== 'granted') return
  if (!areNotificationsEnabled()) return

  getLessonsDueForReview().then(lessonsDue => {
    if (lessonsDue.length > 0) {
      const firstLesson = lessonsDue[0]
      showLessonDueNotification(lessonsDue.length, firstLesson?.topicTitle)
    }
  })
}
