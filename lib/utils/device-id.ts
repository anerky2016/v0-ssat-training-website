/**
 * Device identification utility for multi-device sync
 * Generates and persists a unique device ID in localStorage
 */

const DEVICE_ID_KEY = 'ssat_device_id'
const DEVICE_NAME_KEY = 'ssat_device_name'

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Detect device type/name from user agent
 */
function detectDeviceName(): string {
  if (typeof window === 'undefined') return 'Unknown Device'

  const ua = window.navigator.userAgent

  // Mobile devices
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua)) return 'iPad'
  if (/Android/.test(ua) && /Mobile/.test(ua)) return 'Android Phone'
  if (/Android/.test(ua)) return 'Android Tablet'

  // Desktop browsers
  if (/Mac/.test(ua)) return 'Mac'
  if (/Windows/.test(ua)) return 'Windows PC'
  if (/Linux/.test(ua)) return 'Linux'

  // Fallback
  return 'Web Browser'
}

/**
 * Get or create device ID
 * Persists in localStorage for consistency across sessions
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server'
  }

  try {
    // Check if device ID already exists
    let deviceId = localStorage.getItem(DEVICE_ID_KEY)

    if (!deviceId) {
      // Generate new device ID
      deviceId = generateDeviceId()
      localStorage.setItem(DEVICE_ID_KEY, deviceId)
    }

    return deviceId
  } catch (error) {
    console.error('Error getting device ID:', error)
    // Fallback to session-based ID
    return `session_${Date.now()}`
  }
}

/**
 * Get device name (cached in localStorage)
 */
export function getDeviceName(): string {
  if (typeof window === 'undefined') {
    return 'Server'
  }

  try {
    let deviceName = localStorage.getItem(DEVICE_NAME_KEY)

    if (!deviceName) {
      deviceName = detectDeviceName()
      localStorage.setItem(DEVICE_NAME_KEY, deviceName)
    }

    return deviceName
  } catch (error) {
    console.error('Error getting device name:', error)
    return detectDeviceName()
  }
}

/**
 * Get full device info
 */
export function getDeviceInfo() {
  return {
    deviceId: getDeviceId(),
    deviceName: getDeviceName(),
  }
}

/**
 * Reset device ID (useful for testing)
 */
export function resetDeviceId(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(DEVICE_ID_KEY)
    localStorage.removeItem(DEVICE_NAME_KEY)
  } catch (error) {
    console.error('Error resetting device ID:', error)
  }
}
