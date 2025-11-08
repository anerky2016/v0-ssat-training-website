// Utility functions for loading and managing vocabulary levels

import ssatData from "@/data/vocabulary-words.json"
import level3Data from "@/data/wordly-wise-level-3.json"
import level4Data from "@/data/wordly-wise-level-4.json"
import level5Data from "@/data/wordly-wise-level-5.json"
import level6Data from "@/data/wordly-wise-level-6.json"
import level7Data from "@/data/wordly-wise-level-7.json"

export type VocabularyLevel = "SSAT" | 2 | 3 | 4 | 5 | 6 | 7

export interface VocabularyWord {
  word: string
  pronunciation: string
  part_of_speech: string
  meanings: string[]
  examples: string[]
  synonyms: string[]
  antonyms: string[]
  further_information: string[]
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

