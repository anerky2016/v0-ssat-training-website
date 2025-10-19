/**
 * Location sync types for cross-device synchronization
 */

export interface UserLocation {
  /** Current page path */
  path: string

  /** Timestamp when location was updated */
  timestamp: number

  /** Device identifier that made the update */
  deviceId: string

  /** Optional: Device name/type for display */
  deviceName?: string

  /** Optional: Lesson or content progress percentage */
  progress?: number

  /** Optional: Page title for better UX */
  pageTitle?: string

  /** Optional: Scroll position (pixels from top) */
  scrollPosition?: number
}

export interface LocationSyncState {
  /** Current location on this device */
  currentLocation: UserLocation | null

  /** Last synced location from another device */
  syncedLocation: UserLocation | null

  /** Whether sync is active */
  isActive: boolean

  /** Whether currently syncing */
  isSyncing: boolean
}

export interface LocationSyncOptions {
  /** Enable/disable auto-sync */
  enabled?: boolean

  /** Debounce time in ms before syncing location */
  debounceMs?: number

  /** Whether to show notification when location syncs */
  showNotification?: boolean
}
