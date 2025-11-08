/**
 * Vocabulary Memory Tips Management
 * Manages custom user-generated memory tips stored in Supabase
 */

import { supabase } from './supabase'
import { auth } from './firebase'

/**
 * Get the current user ID from Firebase auth
 */
function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid || null
}

/**
 * Get custom memory tip for a word
 */
export async function getCustomMemoryTip(word: string): Promise<string | null> {
  const userId = getCurrentUserId()
  if (!userId) return null

  try {
    const normalizedWord = word.toLowerCase()

    const { data, error } = await supabase
      .from('vocabulary_memory_tips')
      .select('tip')
      .eq('user_id', userId)
      .eq('word', normalizedWord)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No custom tip found
        return null
      }
      throw error
    }

    return data?.tip || null
  } catch (error) {
    console.error('Failed to fetch custom memory tip:', error)
    return null
  }
}

/**
 * Save custom memory tip for a word
 */
export async function saveCustomMemoryTip(word: string, tip: string): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) {
    throw new Error('User must be logged in to save memory tips')
  }

  try {
    const normalizedWord = word.toLowerCase()

    const { error } = await supabase
      .from('vocabulary_memory_tips')
      .upsert({
        user_id: userId,
        word: normalizedWord,
        tip: tip,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,word'
      })

    if (error) throw error

    console.log(`Custom memory tip saved for word: ${word}`)
  } catch (error) {
    console.error('Failed to save custom memory tip:', error)
    throw error
  }
}

/**
 * Delete custom memory tip for a word (revert to default)
 */
export async function deleteCustomMemoryTip(word: string): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) {
    throw new Error('User must be logged in to delete memory tips')
  }

  try {
    const normalizedWord = word.toLowerCase()

    const { error } = await supabase
      .from('vocabulary_memory_tips')
      .delete()
      .eq('user_id', userId)
      .eq('word', normalizedWord)

    if (error) throw error

    console.log(`Custom memory tip deleted for word: ${word}`)
  } catch (error) {
    console.error('Failed to delete custom memory tip:', error)
    throw error
  }
}
