// Client-side bookmark functionality using localStorage

export interface Bookmark {
  path: string
  title: string
  timestamp: number
}

const BOOKMARK_KEY = 'ssat-bookmark'

export function saveBookmark(path: string, title: string) {
  if (typeof window === 'undefined') return

  const bookmark: Bookmark = {
    path,
    title,
    timestamp: Date.now(),
  }

  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmark))
  } catch (error) {
    console.error('Failed to save bookmark:', error)
  }
}

export function getBookmark(): Bookmark | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(BOOKMARK_KEY)
    if (!stored) return null

    return JSON.parse(stored) as Bookmark
  } catch (error) {
    console.error('Failed to retrieve bookmark:', error)
    return null
  }
}

export function clearBookmark() {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(BOOKMARK_KEY)
  } catch (error) {
    console.error('Failed to clear bookmark:', error)
  }
}

export function hasBookmark(): boolean {
  return getBookmark() !== null
}
