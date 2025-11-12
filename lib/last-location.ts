/**
 * Last Location Tracking
 * Remembers and restores the user's last visited page
 */

const LAST_LOCATION_KEY = 'ssat-last-location'
const LAST_LOCATION_TIMESTAMP_KEY = 'ssat-last-location-timestamp'

// Pages that should NOT be remembered (e.g., auth pages, error pages)
const EXCLUDED_PATHS = [
  '/api',
  '/_next',
  '/404',
  '/500',
  '/opengraph-image',
  '/icon',
  '/apple-icon',
  '/manifest.webmanifest',
  '/robots.txt',
  '/sitemap.xml',
  '/BingSiteAuth.xml'
]

/**
 * Check if a path should be tracked
 */
function shouldTrackPath(path: string): boolean {
  // Don't track if it's an excluded path
  if (EXCLUDED_PATHS.some(excluded => path.startsWith(excluded))) {
    return false
  }

  // Don't track if it's just the root path (/)
  // We want to track actual pages, not the homepage
  if (path === '/') {
    return false
  }

  return true
}

/**
 * Save the current location to localStorage
 */
export function saveLastLocation(path: string): void {
  if (typeof window === 'undefined') return

  // Only save if it's a path we want to track
  if (!shouldTrackPath(path)) {
    return
  }

  try {
    localStorage.setItem(LAST_LOCATION_KEY, path)
    localStorage.setItem(LAST_LOCATION_TIMESTAMP_KEY, Date.now().toString())
    console.log('📍 [Last Location] Saved:', path)
  } catch (error) {
    console.error('Failed to save last location:', error)
  }
}

/**
 * Get the last saved location
 * Returns null if no location is saved or if it's too old
 */
export function getLastLocation(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const savedPath = localStorage.getItem(LAST_LOCATION_KEY)
    const savedTimestamp = localStorage.getItem(LAST_LOCATION_TIMESTAMP_KEY)

    if (!savedPath) {
      return null
    }

    // Check if the saved location is too old (e.g., more than 7 days)
    if (savedTimestamp) {
      const timestamp = parseInt(savedTimestamp, 10)
      const daysSinceLastVisit = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)

      // If it's been more than 7 days, don't restore the location
      if (daysSinceLastVisit > 7) {
        console.log('📍 [Last Location] Too old, clearing:', savedPath)
        clearLastLocation()
        return null
      }
    }

    console.log('📍 [Last Location] Retrieved:', savedPath)
    return savedPath
  } catch (error) {
    console.error('Failed to get last location:', error)
    return null
  }
}

/**
 * Clear the saved location
 */
export function clearLastLocation(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(LAST_LOCATION_KEY)
    localStorage.removeItem(LAST_LOCATION_TIMESTAMP_KEY)
    console.log('📍 [Last Location] Cleared')
  } catch (error) {
    console.error('Failed to clear last location:', error)
  }
}

/**
 * Check if there's a saved location available
 */
export function hasLastLocation(): boolean {
  return getLastLocation() !== null
}
