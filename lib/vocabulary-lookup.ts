// Vocabulary word lookup utilities

import vocabularyData from "@/data/vocabulary-words.json"

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

// Normalize word for lookup (lowercase, remove spaces and special chars)
function normalizeWord(word: string): string {
  return word.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
}

// Look up a word in the vocabulary database
export function lookupWord(word: string): VocabularyWord | null {
  const normalized = normalizeWord(word)

  const found = vocabularyData.words.find(w =>
    normalizeWord(w.word) === normalized
  )

  return found ? found as VocabularyWord : null
}

// Check if a word exists in the vocabulary database
export function wordExists(word: string): boolean {
  return lookupWord(word) !== null
}

// Get the word card URL for a word
export function getWordCardUrl(word: string): string {
  return `/vocabulary/word-lists/${word.toLowerCase().replace(/\s+/g, '-')}`
}

// Get formatted word information for display
export function getWordInfo(word: string): {
  exists: boolean
  word: string
  pronunciation?: string
  partOfSpeech?: string
  meaning?: string
  url?: string
} {
  const wordData = lookupWord(word)

  if (!wordData) {
    return {
      exists: false,
      word,
    }
  }

  return {
    exists: true,
    word: wordData.word,
    pronunciation: wordData.pronunciation,
    partOfSpeech: wordData.part_of_speech,
    meaning: wordData.meanings[0], // Use first meaning
    url: getWordCardUrl(wordData.word),
  }
}

// Get multiple word infos at once
export function getWordsInfo(words: string[]): ReturnType<typeof getWordInfo>[] {
  return words.map(word => getWordInfo(word))
}
