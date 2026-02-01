/**
 * Word-Level Study Tracker
 * Tracks individual vocabulary words that users study/review
 */

import { supabase } from './supabase'
import { auth } from './firebase'
import type { VocabularyLevel } from './vocabulary-levels'

export interface WordStudyRecord {
  id?: string
  user_id: string
  word: string
  word_level: VocabularyLevel
  activity_type: 'flashcard' | 'story' | 'quiz' | 'sentence_completion' | 'word_list'
  context_id?: string
  reviewed_at?: string
  created_at?: string
}

export interface WordStats {
  word: string
  word_level: VocabularyLevel
  review_count: number
  first_reviewed: string
  last_reviewed: string
  activity_types: string[]
}

/**
 * Get current user ID from Firebase
 */
function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid || null
}

/**
 * Track a single word review
 */
export async function trackWordStudy(
  word: string,
  wordLevel: VocabularyLevel,
  activityType: WordStudyRecord['activity_type'],
  contextId?: string
): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId || !supabase) return

  try {
    const { error } = await supabase
      .from('word_study_history')
      .insert({
        user_id: userId,
        word: word.toLowerCase(),
        word_level: wordLevel,
        activity_type: activityType,
        context_id: contextId,
        reviewed_at: new Date().toISOString()
      })

    if (error) {
      console.error('❌ [Word Tracker] Failed to track word:', error)
    } else {
      console.log('✅ [Word Tracker] Tracked word:', word, wordLevel, activityType)
    }
  } catch (error) {
    console.error('❌ [Word Tracker] Exception:', error)
  }
}

/**
 * Track multiple words at once (batch insert)
 */
export async function trackMultipleWords(
  words: Array<{
    word: string
    level: VocabularyLevel
  }>,
  activityType: WordStudyRecord['activity_type'],
  contextId?: string
): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId || !supabase || words.length === 0) return

  try {
    const records = words.map(w => ({
      user_id: userId,
      word: w.word.toLowerCase(),
      word_level: w.level,
      activity_type: activityType,
      context_id: contextId,
      reviewed_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('word_study_history')
      .insert(records)

    if (error) {
      console.error('❌ [Word Tracker] Failed to track words:', error)
    } else {
      console.log(`✅ [Word Tracker] Tracked ${words.length} words:`, activityType)
    }
  } catch (error) {
    console.error('❌ [Word Tracker] Exception:', error)
  }
}

/**
 * Get all words a user has studied
 */
export async function getUserStudiedWords(): Promise<string[]> {
  const userId = getCurrentUserId()
  if (!userId || !supabase) return []

  try {
    const { data, error } = await supabase
      .from('word_study_history')
      .select('word')
      .eq('user_id', userId)

    if (error) throw error

    // Return unique words
    const uniqueWords = [...new Set(data?.map(r => r.word) || [])]
    return uniqueWords
  } catch (error) {
    console.error('❌ [Word Tracker] Failed to get studied words:', error)
    return []
  }
}

/**
 * Get statistics for a specific word
 */
export async function getWordStats(word: string): Promise<WordStats | null> {
  const userId = getCurrentUserId()
  if (!userId || !supabase) return null

  try {
    const { data, error } = await supabase
      .from('user_word_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('word', word.toLowerCase())
      .single()

    if (error) throw error

    return data as WordStats
  } catch (error) {
    console.error('❌ [Word Tracker] Failed to get word stats:', error)
    return null
  }
}

/**
 * Get all word statistics for a user
 */
export async function getAllWordStats(): Promise<WordStats[]> {
  const userId = getCurrentUserId()
  if (!userId || !supabase) return []

  try {
    const { data, error } = await supabase
      .from('user_word_stats')
      .select('*')
      .eq('user_id', userId)
      .order('review_count', { ascending: false })

    if (error) throw error

    return (data as WordStats[]) || []
  } catch (error) {
    console.error('❌ [Word Tracker] Failed to get all word stats:', error)
    return []
  }
}

/**
 * Get words studied in a date range
 */
export async function getWordsStudiedInRange(
  startDate: Date,
  endDate: Date
): Promise<WordStudyRecord[]> {
  const userId = getCurrentUserId()
  if (!userId || !supabase) return []

  try {
    const { data, error } = await supabase
      .from('word_study_history')
      .select('*')
      .eq('user_id', userId)
      .gte('reviewed_at', startDate.toISOString())
      .lte('reviewed_at', endDate.toISOString())
      .order('reviewed_at', { ascending: false })

    if (error) throw error

    return (data as WordStudyRecord[]) || []
  } catch (error) {
    console.error('❌ [Word Tracker] Failed to get words in range:', error)
    return []
  }
}

/**
 * Check if a user has studied a specific word
 */
export async function hasStudiedWord(word: string): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId || !supabase) return false

  try {
    const { data, error } = await supabase
      .from('word_study_history')
      .select('id')
      .eq('user_id', userId)
      .eq('word', word.toLowerCase())
      .limit(1)

    if (error) throw error

    return (data?.length || 0) > 0
  } catch (error) {
    console.error('❌ [Word Tracker] Failed to check word:', error)
    return false
  }
}

/**
 * Get review count for a specific word
 */
export async function getWordReviewCount(word: string): Promise<number> {
  const userId = getCurrentUserId()
  if (!userId || !supabase) return 0

  try {
    const { count, error } = await supabase
      .from('word_study_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('word', word.toLowerCase())

    if (error) throw error

    return count || 0
  } catch (error) {
    console.error('❌ [Word Tracker] Failed to get review count:', error)
    return 0
  }
}
