// Utility functions for loading and managing vocabulary levels

import ssatData from "@/data/vocabulary-words.json"
import level3Data from "@/data/wordly-wise-level-3.json"
import level4Data from "@/data/wordly-wise-level-4.json"
import level5Data from "@/data/wordly-wise-level-5.json"
import level6Data from "@/data/wordly-wise-level-6.json"
import level7Data from "@/data/wordly-wise-level-7.json"

export type VocabularyLevel = "SSAT" | 2 | 3 | 4 | 5 | 6 | 7

// CEFR (Common European Framework of Reference for Languages) levels
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

// Lexile level ranges (approximate grade-level bands)
export type LexileLevel =
  | "500L-700L"   // Grades 3-4
  | "700L-900L"   // Grades 4-6
  | "800L-1000L"  // Grades 6-7
  | "900L-1100L"  // Grades 7-8
  | "1000L-1200L" // Grades 8-10
  | "1100L-1300L" // Grades 9-12

export interface VocabularyWord {
  word: string
  pronunciation: string
  part_of_speech: string
  meanings: string[]
  examples: string[]
  synonyms: string[]
  antonyms: string[]
  further_information: string[]
  cefr_level?: CEFRLevel
  lexile_level?: LexileLevel
}

export interface VocabularyData {
  words: VocabularyWord[]
}

// Level data mapping - includes SSAT section and Wordly Wise levels
// Level 2 can be added here when the data file is available
const levelDataMap: Partial<Record<VocabularyLevel, VocabularyData>> = {
  "SSAT": ssatData,
  3: level3Data,
  4: level4Data,
  5: level5Data,
  6: level6Data,
  7: level7Data,
}

// Get word count for a specific level
export function getLevelWordCount(level: VocabularyLevel): number {
  return levelDataMap[level]?.words.length || 0
}

// Get all available levels (only levels that have data files)
export function getAvailableLevels(): VocabularyLevel[] {
  // Return SSAT first, then numbered levels sorted
  const levels: VocabularyLevel[] = []
  
  // Add SSAT if it exists
  if (levelDataMap["SSAT"]) {
    levels.push("SSAT")
  }
  
  // Add numbered levels, sorted
  const numberedLevels = Object.keys(levelDataMap)
    .filter(key => key !== "SSAT")
    .map(Number)
    .sort() as VocabularyLevel[]
  
  return [...levels, ...numberedLevels]
}

// Load words from specific level(s)
export function loadVocabularyWords(levels: VocabularyLevel[]): VocabularyWord[] {
  const allWords: VocabularyWord[] = []
  
  for (const level of levels) {
    const levelData = levelDataMap[level]
    if (levelData && levelData.words) {
      // Add level metadata to each word (optional, for tracking)
      const wordsWithLevel = levelData.words.map(word => ({
        ...word,
        // We can add a level property if needed, but keeping it clean for now
      }))
      allWords.push(...wordsWithLevel)
    }
  }
  
  return allWords
}

// Get total word count across multiple levels
export function getTotalWordCount(levels: VocabularyLevel[]): number {
  return levels.reduce((total, level) => total + getLevelWordCount(level), 0)
}

// Get level info (word count, etc.)
export function getLevelInfo(level: VocabularyLevel) {
  return {
    level,
    wordCount: getLevelWordCount(level),
    name: level === "SSAT" ? "SSAT" : `Level ${level}`,
  }
}

// Get all levels info
export function getAllLevelsInfo() {
  return getAvailableLevels().map(level => getLevelInfo(level))
}

// ============================================================================
// CEFR Level Utilities
// ============================================================================

// Get human-readable CEFR level description
export function getCEFRDescription(level: CEFRLevel): string {
  const descriptions: Record<CEFRLevel, string> = {
    A1: "Beginner",
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Upper Intermediate",
    C1: "Advanced",
    C2: "Proficiency"
  }
  return descriptions[level]
}

// Get detailed CEFR level description
export function getCEFRDetailedDescription(level: CEFRLevel): string {
  const descriptions: Record<CEFRLevel, string> = {
    A1: "Can understand and use familiar everyday expressions and basic phrases",
    A2: "Can understand sentences and frequently used expressions related to areas of immediate relevance",
    B1: "Can understand the main points of clear standard input on familiar matters",
    B2: "Can understand the main ideas of complex text on both concrete and abstract topics",
    C1: "Can understand a wide range of demanding, longer texts and recognize implicit meaning",
    C2: "Can understand with ease virtually everything heard or read"
  }
  return descriptions[level]
}

// Get CEFR level color for UI display
export function getCEFRColor(level: CEFRLevel): string {
  const colors: Record<CEFRLevel, string> = {
    A1: "text-green-600 dark:text-green-400 bg-green-500/10",
    A2: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    B1: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10",
    B2: "text-orange-600 dark:text-orange-400 bg-orange-500/10",
    C1: "text-red-600 dark:text-red-400 bg-red-500/10",
    C2: "text-purple-600 dark:text-purple-400 bg-purple-500/10"
  }
  return colors[level]
}

// Get numeric value for CEFR level (for sorting)
export function getCEFRNumericValue(level: CEFRLevel): number {
  const values: Record<CEFRLevel, number> = {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 6
  }
  return values[level]
}

// Sort words by CEFR level
export function sortWordsByCEFR(words: VocabularyWord[]): VocabularyWord[] {
  return [...words].sort((a, b) => {
    if (!a.cefr_level && !b.cefr_level) return 0
    if (!a.cefr_level) return 1
    if (!b.cefr_level) return -1
    return getCEFRNumericValue(a.cefr_level) - getCEFRNumericValue(b.cefr_level)
  })
}

// Filter words by CEFR level
export function filterWordsByCEFR(words: VocabularyWord[], levels: CEFRLevel[]): VocabularyWord[] {
  return words.filter(word => word.cefr_level && levels.includes(word.cefr_level))
}

// Get CEFR distribution for a set of words
export function getCEFRDistribution(words: VocabularyWord[]): Record<CEFRLevel, number> {
  const distribution: Record<CEFRLevel, number> = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0
  }

  words.forEach(word => {
    if (word.cefr_level) {
      distribution[word.cefr_level]++
    }
  })

  return distribution
}

// Get all CEFR levels
export function getAllCEFRLevels(): CEFRLevel[] {
  return ["A1", "A2", "B1", "B2", "C1", "C2"]
}

// Get words by CEFR level from loaded data
export function getWordsByCEFRLevel(level: CEFRLevel, vocabularyLevels: VocabularyLevel[] = ["SSAT"]): VocabularyWord[] {
  const words = loadVocabularyWords(vocabularyLevels)
  return words.filter(word => word.cefr_level === level)
}

// ============================================================================
// Lexile Level Utilities
// ============================================================================

// Get human-readable Lexile level description
export function getLexileDescription(level: LexileLevel): string {
  const descriptions: Record<LexileLevel, string> = {
    "500L-700L": "Grades 3-4",
    "700L-900L": "Grades 4-6",
    "800L-1000L": "Grades 6-7",
    "900L-1100L": "Grades 7-8",
    "1000L-1200L": "Grades 8-10",
    "1100L-1300L": "Grades 9-12"
  }
  return descriptions[level]
}

// Get detailed Lexile level description
export function getLexileDetailedDescription(level: LexileLevel): string {
  const descriptions: Record<LexileLevel, string> = {
    "500L-700L": "Elementary level vocabulary - basic, high-frequency words",
    "700L-900L": "Upper elementary to middle school - common everyday words",
    "800L-1000L": "Middle school level - moderate academic vocabulary",
    "900L-1100L": "Upper middle school - academic and subject-specific words",
    "1000L-1200L": "High school level - advanced academic vocabulary",
    "1100L-1300L": "College preparatory - sophisticated and specialized words"
  }
  return descriptions[level]
}

// Get Lexile level color for UI display
export function getLexileColor(level: LexileLevel): string {
  const colors: Record<LexileLevel, string> = {
    "500L-700L": "text-green-600 dark:text-green-400 bg-green-500/10",
    "700L-900L": "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    "800L-1000L": "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10",
    "900L-1100L": "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10",
    "1000L-1200L": "text-orange-600 dark:text-orange-400 bg-orange-500/10",
    "1100L-1300L": "text-red-600 dark:text-red-400 bg-red-500/10"
  }
  return colors[level]
}

// Get numeric value for Lexile level (for sorting)
export function getLexileNumericValue(level: LexileLevel): number {
  const values: Record<LexileLevel, number> = {
    "500L-700L": 1,
    "700L-900L": 2,
    "800L-1000L": 3,
    "900L-1100L": 4,
    "1000L-1200L": 5,
    "1100L-1300L": 6
  }
  return values[level]
}

// Sort words by Lexile level
export function sortWordsByLexile(words: VocabularyWord[]): VocabularyWord[] {
  return [...words].sort((a, b) => {
    if (!a.lexile_level && !b.lexile_level) return 0
    if (!a.lexile_level) return 1
    if (!b.lexile_level) return -1
    return getLexileNumericValue(a.lexile_level) - getLexileNumericValue(b.lexile_level)
  })
}

// Filter words by Lexile level
export function filterWordsByLexile(words: VocabularyWord[], levels: LexileLevel[]): VocabularyWord[] {
  return words.filter(word => word.lexile_level && levels.includes(word.lexile_level))
}

// Get Lexile distribution for a set of words
export function getLexileDistribution(words: VocabularyWord[]): Record<LexileLevel, number> {
  const distribution: Record<LexileLevel, number> = {
    "500L-700L": 0,
    "700L-900L": 0,
    "800L-1000L": 0,
    "900L-1100L": 0,
    "1000L-1200L": 0,
    "1100L-1300L": 0
  }

  words.forEach(word => {
    if (word.lexile_level) {
      distribution[word.lexile_level]++
    }
  })

  return distribution
}

// Get all Lexile levels
export function getAllLexileLevels(): LexileLevel[] {
  return ["500L-700L", "700L-900L", "800L-1000L", "900L-1100L", "1000L-1200L", "1100L-1300L"]
}

// Get words by Lexile level from loaded data
export function getWordsByLexileLevel(level: LexileLevel, vocabularyLevels: VocabularyLevel[] = ["SSAT"]): VocabularyWord[] {
  const words = loadVocabularyWords(vocabularyLevels)
  return words.filter(word => word.lexile_level === level)
}

// ============================================================================
// Wordly Wise Level Utilities
// ============================================================================

// Get the Wordly Wise level for a specific word
export function getWordlyWiseLevel(word: string): VocabularyLevel | null {
  const normalizedWord = word.toLowerCase().trim()

  // Check each level's data
  for (const [level, data] of Object.entries(levelDataMap)) {
    if (data && data.words) {
      const found = data.words.some(w => w.word.toLowerCase().trim() === normalizedWord)
      if (found) {
        return level === "SSAT" ? "SSAT" : parseInt(level) as VocabularyLevel
      }
    }
  }

  return null
}

// Get display name for Wordly Wise level
export function getWordlyWiseLevelName(level: VocabularyLevel): string {
  return level === "SSAT" ? "SSAT" : `Level ${level}`
}

// Get color for Wordly Wise level badge
export function getWordlyWiseLevelColor(level: VocabularyLevel): string {
  if (level === "SSAT") {
    return "text-purple-600 dark:text-purple-400 bg-purple-500/10"
  }

  const colors: Record<number, string> = {
    2: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    3: "text-green-600 dark:text-green-400 bg-green-500/10",
    4: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    5: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10",
    6: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    7: "text-violet-600 dark:text-violet-400 bg-violet-500/10"
  }

  return colors[level as number] || "text-gray-600 dark:text-gray-400 bg-gray-500/10"
}

