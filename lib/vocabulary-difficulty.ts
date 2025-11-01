// Vocabulary difficulty management with Supabase sync
// Difficulty levels: 0 (Easy) - 3 (Very Hard)

import { auth } from './firebase'
import {
  saveVocabularyDifficulty as saveToSupabase,
  getUserVocabularyDifficulties,
  getVocabularyDifficulty as getFromSupabase,
  deleteVocabularyDifficulty as deleteFromSupabase,
  saveVocabularyDifficultyHistory,
  getWordDifficultyHistory as getHistoryFromSupabase,
  type DifficultyLevel,
} from './supabase'

export type { DifficultyLevel }

const STORAGE_KEY = 'vocabulary-difficulty'

export interface VocabularyDifficulty {
  word: string
  difficulty: DifficultyLevel
  updatedAt: number
}

// In-memory cache for better performance
let difficultyCache: Record<string, VocabularyDifficulty> | null = null
let cacheInitialized = false

// Helper to get current user ID
function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid || null
}

// Load difficulties from localStorage (fallback/cache)
function loadLocalDifficulties(): Record<string, VocabularyDifficulty> {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error loading vocabulary difficulties from localStorage:', error)
    return {}
  }
}

// Save difficulties to localStorage (cache)
function saveLocalDifficulties(difficulties: Record<string, VocabularyDifficulty>): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(difficulties))
  } catch (error) {
    console.error('Error saving vocabulary difficulties to localStorage:', error)
  }
}

// Initialize cache from Supabase
export async function initializeDifficulties(): Promise<void> {
  if (cacheInitialized) return

  const userId = getCurrentUserId()
  if (!userId) {
    // Not logged in, use localStorage only
    difficultyCache = loadLocalDifficulties()
    cacheInitialized = true
    return
  }

  try {
    // Load from Supabase
    const supabaseDifficulties = await getUserVocabularyDifficulties(userId)

    // Convert to cache format
    const cache: Record<string, VocabularyDifficulty> = {}
    supabaseDifficulties.forEach(d => {
      cache[d.word] = {
        word: d.word,
        difficulty: d.difficulty,
        updatedAt: new Date(d.updated_at).getTime(),
      }
    })

    difficultyCache = cache

    // Also save to localStorage as backup
    saveLocalDifficulties(cache)

    cacheInitialized = true
  } catch (error) {
    console.error('Failed to initialize difficulties from Supabase:', error)
    // Fallback to localStorage
    difficultyCache = loadLocalDifficulties()
    cacheInitialized = true
  }
}

// Get all vocabulary difficulties
export function getAllDifficulties(): Record<string, VocabularyDifficulty> {
  if (!cacheInitialized) {
    // Lazy load from localStorage if cache not initialized
    difficultyCache = loadLocalDifficulties()
  }

  return difficultyCache || {}
}

// Get difficulty for a specific word (defaults to Medium if not set)
export function getWordDifficulty(word: string): DifficultyLevel {
  const difficulties = getAllDifficulties()
  const normalizedWord = word.toLowerCase()
  return difficulties[normalizedWord]?.difficulty ?? 1 // Default to Medium
}

// Set difficulty for a word
export async function setWordDifficulty(word: string, difficulty: DifficultyLevel): Promise<void> {
  const normalizedWord = word.toLowerCase()
  const userId = getCurrentUserId()

  // Get old difficulty for history tracking
  const oldDifficulty = getWordDifficulty(normalizedWord)

  // Update cache immediately for UI responsiveness
  if (!difficultyCache) {
    difficultyCache = loadLocalDifficulties()
  }

  difficultyCache[normalizedWord] = {
    word: normalizedWord,
    difficulty,
    updatedAt: Date.now(),
  }

  // Save to localStorage immediately
  saveLocalDifficulties(difficultyCache)

  // Sync to Supabase if user is logged in
  if (userId) {
    try {
      await saveToSupabase(userId, normalizedWord, difficulty)

      // Save to history (only if difficulty actually changed)
      if (oldDifficulty !== difficulty) {
        await saveVocabularyDifficultyHistory(userId, normalizedWord, oldDifficulty, difficulty)
      }
    } catch (error) {
      console.error('Failed to save vocabulary difficulty to Supabase:', error)
    }
  }
}

// Increase difficulty (max 3)
export async function increaseDifficulty(word: string): Promise<DifficultyLevel> {
  const current = getWordDifficulty(word)
  const newDifficulty = Math.min(3, current + 1) as DifficultyLevel
  await setWordDifficulty(word, newDifficulty)
  return newDifficulty
}

// Decrease difficulty (min 0)
export async function decreaseDifficulty(word: string): Promise<DifficultyLevel> {
  const current = getWordDifficulty(word)
  const newDifficulty = Math.max(0, current - 1) as DifficultyLevel
  await setWordDifficulty(word, newDifficulty)
  return newDifficulty
}

// Get difficulty label
export function getDifficultyLabel(difficulty: DifficultyLevel): string {
  const labels = ['Easy', 'Medium', 'Hard', 'Very Hard']
  return labels[difficulty]
}

// Get difficulty color
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  const colors = [
    'text-green-600 dark:text-green-400 bg-green-500/10',
    'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10',
    'text-orange-600 dark:text-orange-400 bg-orange-500/10',
    'text-red-600 dark:text-red-400 bg-red-500/10'
  ]
  return colors[difficulty]
}

// Remove difficulty setting for a word
export async function removeWordDifficulty(word: string): Promise<void> {
  const normalizedWord = word.toLowerCase()
  const userId = getCurrentUserId()

  // Update cache
  if (!difficultyCache) {
    difficultyCache = loadLocalDifficulties()
  }

  delete difficultyCache[normalizedWord]
  saveLocalDifficulties(difficultyCache)

  // Sync to Supabase if user is logged in
  if (userId) {
    try {
      await deleteFromSupabase(userId, normalizedWord)
    } catch (error) {
      console.error('Failed to delete vocabulary difficulty from Supabase:', error)
    }
  }
}

// Get words by difficulty level
export function getWordsByDifficulty(difficulty: DifficultyLevel): string[] {
  const difficulties = getAllDifficulties()
  return Object.values(difficulties)
    .filter(d => d.difficulty === difficulty)
    .map(d => d.word)
}

// Get statistics
export function getDifficultyStats(): Record<DifficultyLevel, number> {
  const difficulties = getAllDifficulties()
  const stats: Record<DifficultyLevel, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }

  Object.values(difficulties).forEach(d => {
    stats[d.difficulty]++
  })

  return stats
}

// Get difficulty history for a word
export async function getWordDifficultyHistory(word: string, limit = 50) {
  const userId = getCurrentUserId()
  if (!userId) {
    return []
  }

  try {
    const history = await getHistoryFromSupabase(userId, word, limit)
    return history
  } catch (error) {
    console.error('Failed to fetch word difficulty history:', error)
    return []
  }
}
