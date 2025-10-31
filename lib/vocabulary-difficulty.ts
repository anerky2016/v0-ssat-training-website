// Vocabulary difficulty management
// Difficulty levels: 0 (Easy) - 3 (Very Hard)

const STORAGE_KEY = 'vocabulary-difficulty'

export type DifficultyLevel = 0 | 1 | 2 | 3

export interface VocabularyDifficulty {
  word: string
  difficulty: DifficultyLevel
  updatedAt: number
}

// Get all vocabulary difficulties
export function getAllDifficulties(): Record<string, VocabularyDifficulty> {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error loading vocabulary difficulties:', error)
    return {}
  }
}

// Get difficulty for a specific word (defaults to Medium if not set)
export function getWordDifficulty(word: string): DifficultyLevel {
  const difficulties = getAllDifficulties()
  const normalizedWord = word.toLowerCase()
  return difficulties[normalizedWord]?.difficulty ?? 1 // Default to Medium
}

// Set difficulty for a word
export function setWordDifficulty(word: string, difficulty: DifficultyLevel): void {
  if (typeof window === 'undefined') return

  const difficulties = getAllDifficulties()
  const normalizedWord = word.toLowerCase()

  difficulties[normalizedWord] = {
    word: normalizedWord,
    difficulty,
    updatedAt: Date.now()
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(difficulties))
  } catch (error) {
    console.error('Error saving vocabulary difficulty:', error)
  }
}

// Increase difficulty (max 3)
export function increaseDifficulty(word: string): DifficultyLevel {
  const current = getWordDifficulty(word)
  const newDifficulty = Math.min(3, current + 1) as DifficultyLevel
  setWordDifficulty(word, newDifficulty)
  return newDifficulty
}

// Decrease difficulty (min 0)
export function decreaseDifficulty(word: string): DifficultyLevel {
  const current = getWordDifficulty(word)
  const newDifficulty = Math.max(0, current - 1) as DifficultyLevel
  setWordDifficulty(word, newDifficulty)
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
export function removeWordDifficulty(word: string): void {
  if (typeof window === 'undefined') return

  const difficulties = getAllDifficulties()
  const normalizedWord = word.toLowerCase()
  delete difficulties[normalizedWord]

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(difficulties))
  } catch (error) {
    console.error('Error removing vocabulary difficulty:', error)
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
