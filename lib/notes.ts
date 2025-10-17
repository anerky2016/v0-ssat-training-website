// Client-side notes functionality using localStorage
import { domToPng } from 'modern-screenshot'

export interface Note {
  id: string
  title: string
  content: string
  screenshot?: string // Base64 encoded image
  path: string // Current page path when note was created
  timestamp: number
  updatedAt: number
}

const NOTES_KEY = 'ssat-notes'

export function getNotes(): Note[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(NOTES_KEY)
    if (!stored) return []

    return JSON.parse(stored) as Note[]
  } catch (error) {
    console.error('Failed to retrieve notes:', error)
    return []
  }
}

export function saveNote(note: Omit<Note, 'id' | 'timestamp' | 'updatedAt'>): Note {
  if (typeof window === 'undefined') throw new Error('Cannot save note on server')

  const newNote: Note = {
    ...note,
    id: generateId(),
    timestamp: Date.now(),
    updatedAt: Date.now(),
  }

  try {
    const notes = getNotes()
    notes.unshift(newNote) // Add to beginning
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
    return newNote
  } catch (error) {
    console.error('Failed to save note:', error)
    throw error
  }
}

export function updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'timestamp'>>): Note | null {
  if (typeof window === 'undefined') return null

  try {
    const notes = getNotes()
    const index = notes.findIndex(n => n.id === id)

    if (index === -1) return null

    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: Date.now(),
    }

    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
    return notes[index]
  } catch (error) {
    console.error('Failed to update note:', error)
    return null
  }
}

export function deleteNote(id: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    const notes = getNotes()
    const filtered = notes.filter(n => n.id !== id)
    localStorage.setItem(NOTES_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Failed to delete note:', error)
    return false
  }
}

export function clearAllNotes(): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.removeItem(NOTES_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear notes:', error)
    return false
  }
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

// Helper to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
