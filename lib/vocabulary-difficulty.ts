// Vocabulary difficulty management - Always reads/writes from Supabase
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

export interface VocabularyDifficulty {
  word: string
  difficulty: DifficultyLevel
  updatedAt: number
}

// Helper to get current user ID
function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid || null
}

// Check if user is logged in (required for all operations)
export function isUserLoggedIn(): boolean {
  return getCurrentUserId() !== null
}

// Get all vocabulary difficulties for current user from Supabase
export async function getAllDifficulties(): Promise<Record<string, VocabularyDifficulty>> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('User not logged in - cannot fetch difficulties')
    return {}
  }

  try {
    const supabaseDifficulties = await getUserVocabularyDifficulties(userId)

    // Convert to record format
    const difficulties: Record<string, VocabularyDifficulty> = {}
    supabaseDifficulties.forEach(d => {
      difficulties[d.word] = {
        word: d.word,
        difficulty: d.difficulty,
        updatedAt: new Date(d.updated_at).getTime(),
      }
    })

    return difficulties
  } catch (error) {
    console.error('Failed to fetch difficulties from Supabase:', error)
    return {}
  }
}

// Check if a word has been reviewed (has a difficulty set)
export async function hasWordBeenReviewed(word: string): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId) return false

  try {
    const normalizedWord = word.toLowerCase()
    const difficulty = await getFromSupabase(userId, normalizedWord)
    return difficulty !== null
  } catch (error) {
    console.error('Failed to check if word has been reviewed:', error)
    return false
  }
}

// Get difficulty for a specific word from Supabase
export async function getWordDifficulty(word: string): Promise<DifficultyLevel | null> {
  const userId = getCurrentUserId()
  if (!userId) return null

  try {
    const normalizedWord = word.toLowerCase()
    const difficulty = await getFromSupabase(userId, normalizedWord)
    return difficulty
  } catch (error) {
    console.error('Failed to fetch word difficulty:', error)
    return null
  }
}

// Set difficulty for a word in Supabase
export async function setWordDifficulty(word: string, difficulty: DifficultyLevel): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) {
    throw new Error('User must be logged in to set word difficulty')
  }

  const normalizedWord = word.toLowerCase()

  try {
    // Get old difficulty for history tracking
    const oldDifficulty = await getFromSupabase(userId, normalizedWord)

    // Save to Supabase
    await saveToSupabase(userId, normalizedWord, difficulty)

    // Save to history (only if difficulty actually changed)
    if (oldDifficulty !== difficulty) {
      await saveVocabularyDifficultyHistory(userId, normalizedWord, oldDifficulty, difficulty)
    }
  } catch (error) {
    console.error('Failed to save vocabulary difficulty:', error)
    throw error
  }
}

// Increase difficulty (max 3)
export async function increaseDifficulty(word: string): Promise<DifficultyLevel> {
  const current = await getWordDifficulty(word)
  const newDifficulty = Math.min(3, (current ?? 1) + 1) as DifficultyLevel
  await setWordDifficulty(word, newDifficulty)
  return newDifficulty
}

// Decrease difficulty (min 0)
export async function decreaseDifficulty(word: string): Promise<DifficultyLevel> {
  const current = await getWordDifficulty(word)
  const newDifficulty = Math.max(0, (current ?? 1) - 1) as DifficultyLevel
  await setWordDifficulty(word, newDifficulty)
  return newDifficulty
}

// Get difficulty label (with option for unreviewed)
export function getDifficultyLabel(difficulty: DifficultyLevel | null, isReviewed: boolean = true): string {
  if (!isReviewed || difficulty === null) {
    return 'Wait for decision'
  }
  const labels = ['Easy', 'Medium', 'Hard', 'Very Hard']
  return labels[difficulty]
}

// Get difficulty color (with option for unreviewed)
export function getDifficultyColor(difficulty: DifficultyLevel | null, isReviewed: boolean = true): string {
  if (!isReviewed || difficulty === null) {
    return 'text-gray-600 dark:text-gray-400 bg-gray-500/10'
  }
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
  const userId = getCurrentUserId()
  if (!userId) {
    throw new Error('User must be logged in to remove word difficulty')
  }

  const normalizedWord = word.toLowerCase()

  try {
    await deleteFromSupabase(userId, normalizedWord)
  } catch (error) {
    console.error('Failed to delete vocabulary difficulty:', error)
    throw error
  }
}

// Get words by difficulty level from Supabase
export async function getWordsByDifficulty(difficulty: DifficultyLevel): Promise<string[]> {
  const difficulties = await getAllDifficulties()
  return Object.values(difficulties)
    .filter(d => d.difficulty === difficulty)
    .map(d => d.word)
}

// Get statistics
export async function getDifficultyStats(): Promise<Record<DifficultyLevel, number>> {
  const difficulties = await getAllDifficulties()
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
