/**
 * Session timeout management
 * Automatically logs users out after 7 days of inactivity
 */

const SESSION_TIMEOUT_KEY = 'session_last_activity'
const SESSION_TIMEOUT_DAYS = 7
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_DAYS * 24 * 60 * 60 * 1000 // 7 days in milliseconds

/**
 * Get the last activity timestamp from localStorage
 */
export function getLastActivity(): number | null {
  if (typeof window === 'undefined') return null

  try {
    const lastActivity = localStorage.getItem(SESSION_TIMEOUT_KEY)
    return lastActivity ? parseInt(lastActivity, 10) : null
  } catch (error) {
    console.error('Error reading last activity:', error)
    return null
  }
}

/**
 * Update the last activity timestamp to current time
 */
export function updateLastActivity(): void {
  if (typeof window === 'undefined') return

  try {
    const now = Date.now()
    localStorage.setItem(SESSION_TIMEOUT_KEY, now.toString())
  } catch (error) {
    console.error('Error updating last activity:', error)
  }
}

/**
 * Clear the last activity timestamp
 */
export function clearLastActivity(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(SESSION_TIMEOUT_KEY)
  } catch (error) {
    console.error('Error clearing last activity:', error)
  }
}

/**
 * Check if the session has timed out (7 days of inactivity)
 * @returns true if session has timed out, false otherwise
 */
export function isSessionTimedOut(): boolean {
  const lastActivity = getLastActivity()

  // No last activity recorded - not timed out
  if (!lastActivity) return false

  const now = Date.now()
  const timeSinceLastActivity = now - lastActivity

  // Check if more than 7 days have passed
  return timeSinceLastActivity > SESSION_TIMEOUT_MS
}

/**
 * Get remaining time before session timeout in milliseconds
 * @returns milliseconds until timeout, or null if no activity recorded
 */
export function getTimeUntilTimeout(): number | null {
  const lastActivity = getLastActivity()
  if (!lastActivity) return null

  const now = Date.now()
  const timeSinceLastActivity = now - lastActivity
  const remaining = SESSION_TIMEOUT_MS - timeSinceLastActivity

  return remaining > 0 ? remaining : 0
}

/**
 * Get human-readable time remaining before timeout
 */
export function getFormattedTimeRemaining(): string | null {
  const remaining = getTimeUntilTimeout()
  if (remaining === null) return null

  if (remaining === 0) return 'Session expired'

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
}

/**
 * Initialize activity tracking on login
 */
export function initializeSession(): void {
  updateLastActivity()
}

/**
 * Activity events to track for session timeout
 */
const ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
]

/**
 * Setup activity listeners to track user activity
 * Throttles updates to once per minute to avoid excessive writes
 */
let lastUpdateTime = 0
const UPDATE_THROTTLE_MS = 60 * 1000 // 1 minute

function handleActivity(): void {
  const now = Date.now()

  // Throttle updates to once per minute
  if (now - lastUpdateTime >= UPDATE_THROTTLE_MS) {
    updateLastActivity()
    lastUpdateTime = now
  }
}

/**
 * Start tracking user activity
 */
export function startActivityTracking(): void {
  if (typeof window === 'undefined') return

  ACTIVITY_EVENTS.forEach(event => {
    window.addEventListener(event, handleActivity, { passive: true })
  })

  console.log('Session timeout: Activity tracking started (7-day timeout)')
}

/**
 * Stop tracking user activity
 */
export function stopActivityTracking(): void {
  if (typeof window === 'undefined') return

  ACTIVITY_EVENTS.forEach(event => {
    window.removeEventListener(event, handleActivity)
  })

  console.log('Session timeout: Activity tracking stopped')
}
