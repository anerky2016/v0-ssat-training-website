/**
 * Story Generation History Management
 * Functions for tracking and retrieving generated vocabulary stories
 */

import { supabase } from './supabase'
import { auth } from './firebase'
import type { VocabularyLevel } from './vocabulary-levels'

export interface StoryHistoryRecord {
  id?: string
  user_id: string
  story_text: string
  words_used: {
    word: string
    level: VocabularyLevel
    meaning: string
  }[]
  story_length: 'short' | 'medium' | 'long'
  story_type?: string | null
  story_subtype?: string | null
  levels_selected: VocabularyLevel[]
  letters_filter?: string[] | null
  difficulties_filter?: number[] | null
  words_per_level: number
  word_count?: number | null
  generated_at?: string
  created_at?: string
}

/**
 * Get the current user ID from Firebase auth
 */
function getCurrentUserId(): string | null {
  const uid = auth?.currentUser?.uid || null
  if (!uid) {
    console.log('📖 [Story History] No user currently authenticated')
  }
  return uid
}

/**
 * Save a generated story to history
 */
export async function saveStoryToHistory(story: {
  story: string
  words: { word: string; level: VocabularyLevel; meaning: string }[]
  levels: VocabularyLevel[]
  letters?: string[]
  difficulties?: number[]
  wordsPerLevel: number
  storyLength: 'short' | 'medium' | 'long'
  storyType?: string | null
  storySubtype?: string | null
}): Promise<StoryHistoryRecord | null> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('❌ [Story History] Cannot save story - user not logged in')
    return null
  }

  if (!supabase) {
    console.error('❌ [Story History] Supabase not configured')
    return null
  }

  try {
    // Calculate word count (rough estimate by splitting on whitespace)
    const wordCount = story.story.split(/\s+/).length

    console.log('💾 [Story History] Saving story to history:', {
      userId: userId.substring(0, 8) + '...',
      storyLength: story.storyLength,
      wordsUsed: story.words.length,
      wordCount,
      storyType: story.storyType,
      storySubtype: story.storySubtype
    })

    const { data, error } = await supabase
      .from('story_generation_history')
      .insert({
        user_id: userId,
        story_text: story.story,
        words_used: story.words,
        story_length: story.storyLength,
        story_type: story.storyType || null,
        story_subtype: story.storySubtype || null,
        levels_selected: story.levels,
        letters_filter: story.letters && story.letters.length > 0 ? story.letters : null,
        difficulties_filter: story.difficulties && story.difficulties.length > 0 ? story.difficulties : null,
        words_per_level: story.wordsPerLevel,
        word_count: wordCount,
        generated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ [Story History] Story saved successfully with ID:', data.id)
    return data
  } catch (error) {
    console.error('❌ [Story History] Failed to save story:', error)
    return null
  }
}

/**
 * Get story history for the current user
 */
export async function getUserStoryHistory(limit = 50): Promise<StoryHistoryRecord[]> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.log('📖 [Story History] Cannot fetch history - user not logged in')
    return []
  }

  if (!supabase) {
    console.log('📖 [Story History] Supabase not configured')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('story_generation_history')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    console.log('✅ [Story History] Fetched story history:', {
      userId: userId.substring(0, 8) + '...',
      count: data?.length || 0
    })

    return data || []
  } catch (error) {
    console.error('❌ [Story History] Failed to fetch story history:', error)
    return []
  }
}

/**
 * Get a specific story by ID
 */
export async function getStoryById(storyId: string): Promise<StoryHistoryRecord | null> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('❌ [Story History] Cannot fetch story - user not logged in')
    return null
  }

  if (!supabase) {
    console.error('❌ [Story History] Supabase not configured')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('story_generation_history')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId) // Ensure user can only access their own stories
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('❌ [Story History] Failed to fetch story:', error)
    return null
  }
}

/**
 * Delete a story from history
 */
export async function deleteStoryFromHistory(storyId: string): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('❌ [Story History] Cannot delete story - user not logged in')
    return false
  }

  if (!supabase) {
    console.error('❌ [Story History] Supabase not configured')
    return false
  }

  try {
    console.log('🗑️ [Story History] Deleting story:', storyId)

    const { error } = await supabase
      .from('story_generation_history')
      .delete()
      .eq('id', storyId)
      .eq('user_id', userId) // Ensure user can only delete their own stories

    if (error) throw error

    console.log('✅ [Story History] Story deleted successfully')
    return true
  } catch (error) {
    console.error('❌ [Story History] Failed to delete story:', error)
    return false
  }
}

/**
 * Get story generation statistics for the user
 */
export async function getStoryStats(): Promise<{
  totalStories: number
  storiesThisWeek: number
  storiesThisMonth: number
  favoriteStoryType: string | null
  totalWordsLearned: number
}> {
  const userId = getCurrentUserId()
  if (!userId || !supabase) {
    return {
      totalStories: 0,
      storiesThisWeek: 0,
      storiesThisMonth: 0,
      favoriteStoryType: null,
      totalWordsLearned: 0
    }
  }

  try {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get all stories for this user
    const { data: allStories, error } = await supabase
      .from('story_generation_history')
      .select('story_type, words_used, generated_at')
      .eq('user_id', userId)

    if (error) throw error

    const totalStories = allStories?.length || 0
    const storiesThisWeek = allStories?.filter(s =>
      new Date(s.generated_at) >= weekAgo
    ).length || 0
    const storiesThisMonth = allStories?.filter(s =>
      new Date(s.generated_at) >= monthAgo
    ).length || 0

    // Calculate favorite story type
    const storyTypeCounts: Record<string, number> = {}
    allStories?.forEach(s => {
      if (s.story_type) {
        storyTypeCounts[s.story_type] = (storyTypeCounts[s.story_type] || 0) + 1
      }
    })
    const favoriteStoryType = Object.keys(storyTypeCounts).length > 0
      ? Object.entries(storyTypeCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null

    // Count unique words learned across all stories
    const uniqueWords = new Set<string>()
    allStories?.forEach(s => {
      if (Array.isArray(s.words_used)) {
        s.words_used.forEach((w: any) => {
          if (w.word) uniqueWords.add(w.word.toLowerCase())
        })
      }
    })
    const totalWordsLearned = uniqueWords.size

    return {
      totalStories,
      storiesThisWeek,
      storiesThisMonth,
      favoriteStoryType,
      totalWordsLearned
    }
  } catch (error) {
    console.error('❌ [Story History] Failed to get story stats:', error)
    return {
      totalStories: 0,
      storiesThisWeek: 0,
      storiesThisMonth: 0,
      favoriteStoryType: null,
      totalWordsLearned: 0
    }
  }
}
