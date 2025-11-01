// Client-side notes functionality using Supabase
import { domToPng } from 'modern-screenshot'
import { auth } from './firebase'
import {
  saveNote as saveNoteToSupabase,
  getUserNotes,
  updateNote as updateNoteInSupabase,
  deleteNote as deleteNoteFromSupabase,
} from './supabase'

export interface Note {
  id: string
  title: string
  content: string
  screenshot?: string // Base64 encoded image
  audioUrl?: string // URL to audio file in Supabase Storage
  path: string // Current page path when note was created
  timestamp: number
  updatedAt: number
}

// Helper to get current user ID
function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid || null
}

export async function getNotes(): Promise<Note[]> {
  const userId = getCurrentUserId()
  if (!userId) {
    // Silent return - user may not be logged in or auth may still be loading
    return []
  }

  try {
    const notesData = await getUserNotes(userId)
    return notesData.map(n => ({
      id: n.id || '',
      title: n.title,
      content: n.content,
      screenshot: n.screenshot,
      audioUrl: n.audio_url,
      path: n.path,
      timestamp: new Date(n.timestamp).getTime(),
      updatedAt: new Date(n.updated_at).getTime(),
    }))
  } catch (error) {
    console.error('Failed to retrieve notes:', error)
    return []
  }
}

export async function saveNote(note: Omit<Note, 'id' | 'timestamp' | 'updatedAt'>): Promise<Note> {
  const userId = getCurrentUserId()
  if (!userId) {
    throw new Error('No user logged in - cannot save note')
  }

  const now = new Date().toISOString()

  try {
    const savedNote = await saveNoteToSupabase(userId, {
      title: note.title,
      content: note.content,
      screenshot: note.screenshot,
      audio_url: note.audioUrl,
      path: note.path,
      timestamp: now,
      updated_at: now,
    })

    if (!savedNote) {
      throw new Error('Failed to save note')
    }

    return {
      id: savedNote.id || '',
      title: savedNote.title,
      content: savedNote.content,
      screenshot: savedNote.screenshot,
      audioUrl: savedNote.audio_url,
      path: savedNote.path,
      timestamp: new Date(savedNote.timestamp).getTime(),
      updatedAt: new Date(savedNote.updated_at).getTime(),
    }
  } catch (error) {
    console.error('Failed to save note:', error)
    throw error
  }
}

export async function updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'timestamp'>>): Promise<Note | null> {
  const userId = getCurrentUserId()
  if (!userId) {
    // Silent return - user may not be logged in or auth may still be loading
    return null
  }

  try {
    const supabaseUpdates: any = {}

    if (updates.title !== undefined) supabaseUpdates.title = updates.title
    if (updates.content !== undefined) supabaseUpdates.content = updates.content
    if (updates.screenshot !== undefined) supabaseUpdates.screenshot = updates.screenshot
    if (updates.audioUrl !== undefined) supabaseUpdates.audio_url = updates.audioUrl
    if (updates.path !== undefined) supabaseUpdates.path = updates.path

    const updatedNote = await updateNoteInSupabase(id, userId, supabaseUpdates)

    if (!updatedNote) return null

    return {
      id: updatedNote.id || '',
      title: updatedNote.title,
      content: updatedNote.content,
      screenshot: updatedNote.screenshot,
      audioUrl: updatedNote.audio_url,
      path: updatedNote.path,
      timestamp: new Date(updatedNote.timestamp).getTime(),
      updatedAt: new Date(updatedNote.updated_at).getTime(),
    }
  } catch (error) {
    console.error('Failed to update note:', error)
    return null
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId) {
    // Silent return - user may not be logged in or auth may still be loading
    return false
  }

  try {
    const result = await deleteNoteFromSupabase(id, userId)
    return result === true
  } catch (error) {
    console.error('Failed to delete note:', error)
    return false
  }
}

export function clearAllNotes(): boolean {
  // No longer needed with Supabase - notes are stored per user
  console.log('clearAllNotes is deprecated - notes are stored in Supabase per user')
  return true
}

// Screenshot utility - captures only the visible viewport
export async function captureScreenshot(hideElements: string[] = []): Promise<string | null> {
  if (typeof window === 'undefined') return null

  try {
    // Hide elements temporarily (like dialogs/sheets)
    const elementsToHide = hideElements.map(selector => {
      const element = document.querySelector(selector)
      if (element) {
        const originalDisplay = (element as HTMLElement).style.display
        ;(element as HTMLElement).style.display = 'none'
        return { element: element as HTMLElement, originalDisplay }
      }
      return null
    }).filter(Boolean) as Array<{ element: HTMLElement; originalDisplay: string }>

    // Wait a bit for elements to hide
    await new Promise(resolve => setTimeout(resolve, 200))

    // Capture only the visible viewport, not the entire page
    const screenshot = await domToPng(document.body, {
      quality: 0.8,
      scale: 1,
      width: window.innerWidth,
      height: window.innerHeight,
      style: {
        margin: '0',
        padding: '0',
      },
    })

    // Restore hidden elements
    elementsToHide.forEach(({ element, originalDisplay }) => {
      element.style.display = originalDisplay
    })

    return screenshot
  } catch (error) {
    console.error('Failed to capture screenshot:', error)

    // Restore hidden elements even on error
    const elementsToHide = hideElements.map(selector => {
      const element = document.querySelector(selector)
      if (element) {
        return element as HTMLElement
      }
      return null
    }).filter(Boolean) as HTMLElement[]

    elementsToHide.forEach(element => {
      element.style.display = ''
    })

    return null
  }
}
