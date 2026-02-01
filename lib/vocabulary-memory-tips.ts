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
  const uid = auth?.currentUser?.uid || null
  if (!uid) {
    console.log('📝 [Memory Tips] No user currently authenticated')
  }
  return uid
}

/**
 * Get custom memory tip for a word
 */
export async function getCustomMemoryTip(word: string): Promise<string | null> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.log('📝 [Memory Tips] Cannot fetch tip - user not logged in')
    return null
  }

  if (!supabase) return null

  try {
    const normalizedWord = word.toLowerCase()
    console.log('📝 [Memory Tips] Fetching custom tip:', { word: normalizedWord, userId: userId.substring(0, 8) + '...' })

    const { data, error } = await supabase
      .from('vocabulary_memory_tips')
      .select('tip')
      .eq('user_id', userId)
      .eq('word', normalizedWord)
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST116') {
        // No custom tip found
        console.log('📝 [Memory Tips] No custom tip found for word:', normalizedWord)
        return null
      }
      throw error
    }

    console.log('✅ [Memory Tips] Custom tip retrieved:', {
      word: normalizedWord,
      tipLength: data?.tip?.length || 0
    })

    return data?.tip || null
  } catch (error) {
    console.error('❌ [Memory Tips] Failed to fetch custom memory tip:', error)
    return null
  }
}

/**
 * Save custom memory tip for a word
 */
export async function saveCustomMemoryTip(word: string, tip: string): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('❌ [Memory Tips] Cannot save tip - user not logged in')
    throw new Error('User must be logged in to save memory tips')
  }

  if (!supabase) return

  try {
    const normalizedWord = word.toLowerCase()
    console.log('💾 [Memory Tips] Saving custom tip:', {
      word: normalizedWord,
      userId: userId.substring(0, 8) + '...',
      tipLength: tip.length
    })

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

    console.log('✅ [Memory Tips] Custom memory tip saved successfully:', {
      word: normalizedWord,
      tipPreview: tip.substring(0, 50) + (tip.length > 50 ? '...' : '')
    })
  } catch (error) {
    console.error('❌ [Memory Tips] Failed to save custom memory tip:', error)
    throw error
  }
}

/**
 * Delete custom memory tip for a word (revert to default)
 */
export async function deleteCustomMemoryTip(word: string): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('❌ [Memory Tips] Cannot delete tip - user not logged in')
    throw new Error('User must be logged in to delete memory tips')
  }

  if (!supabase) return

  try {
    const normalizedWord = word.toLowerCase()
    console.log('🗑️ [Memory Tips] Deleting custom tip (reverting to default):', {
      word: normalizedWord,
      userId: userId.substring(0, 8) + '...'
    })

    const { error } = await supabase
      .from('vocabulary_memory_tips')
      .delete()
      .eq('user_id', userId)
      .eq('word', normalizedWord)

    if (error) throw error

    console.log('✅ [Memory Tips] Custom memory tip deleted successfully:', { word: normalizedWord })
  } catch (error) {
    console.error('❌ [Memory Tips] Failed to delete custom memory tip:', error)
    throw error
  }
}
