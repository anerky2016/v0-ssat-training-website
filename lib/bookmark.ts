// Client-side bookmark functionality using Supabase
import { auth } from './firebase'
import {
  saveBookmark as saveBookmarkToSupabase,
  getUserBookmark,
  deleteBookmark as deleteBookmarkFromSupabase,
} from './supabase'

export interface Bookmark {
  path: string
  title: string
  timestamp: number
}

// Helper to get current user ID
function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid || null
}

export async function saveBookmark(path: string, title: string): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.log('No user logged in - cannot save bookmark')
    return
  }

  try {
    await saveBookmarkToSupabase(userId, path, title)
  } catch (error) {
    console.error('Failed to save bookmark:', error)
  }
}

export async function getBookmark(): Promise<Bookmark | null> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.log('No user logged in - cannot fetch bookmark')
    return null
  }

  try {
    const data = await getUserBookmark(userId)
    if (!data) return null

    return {
      path: data.path,
      title: data.title,
      timestamp: new Date(data.timestamp).getTime(),
    }
  } catch (error) {
    console.error('Failed to retrieve bookmark:', error)
    return null
  }
}

export async function clearBookmark(): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.log('No user logged in - cannot clear bookmark')
    return
  }

  try {
    await deleteBookmarkFromSupabase(userId)
  } catch (error) {
    console.error('Failed to clear bookmark:', error)
  }
}

export async function hasBookmark(): Promise<boolean> {
  const bookmark = await getBookmark()
  return bookmark !== null
}
