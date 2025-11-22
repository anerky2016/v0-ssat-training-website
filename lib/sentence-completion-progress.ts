// Sentence completion progress tracking utilities

import { supabase } from './supabase'
import { auth } from './firebase'

/**
 * Get current user ID from Firebase
 */
function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid || null
}

/**
 * Check if user is logged in
 */
export function isUserLoggedIn(): boolean {
  return !!getCurrentUserId()
}

/**
 * Load all completed question IDs for the current user
 */
export async function getCompletedQuestions(): Promise<string[]> {
  const userId = getCurrentUserId()

  // If not logged in, return empty array (will use localStorage fallback)
  if (!userId || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('sentence_completion_progress')
      .select('question_id')
      .eq('user_id', userId)

    if (error) {
      console.error('Error loading completed questions:', error)
      return []
    }

    return data?.map(row => row.question_id) || []
  } catch (error) {
    console.error('Error loading completed questions:', error)
    return []
  }
}

/**
 * Mark multiple questions as completed for the current user
 * Uses upsert to avoid duplicate errors
 */
export async function markQuestionsCompleted(questionIds: string[]): Promise<number> {
  const userId = getCurrentUserId()

  if (!userId || !supabase || questionIds.length === 0) {
    return 0
  }

  try {
    const now = new Date().toISOString()

    // Build records to insert
    const records = questionIds.map(questionId => ({
      user_id: userId,
      question_id: questionId,
      completed_at: now,
    }))

    // Use upsert to handle duplicates gracefully
    const { data, error } = await supabase
      .from('sentence_completion_progress')
      .upsert(records, {
        onConflict: 'user_id,question_id',
        ignoreDuplicates: true
      })
      .select()

    if (error) {
      console.error('Error marking questions as completed:', error)
      return 0
    }

    console.log(`✅ Marked ${questionIds.length} questions as completed for user ${userId}`)
    return data?.length || 0
  } catch (error) {
    console.error('Error marking questions as completed:', error)
    return 0
  }
}

/**
 * Reset all progress for the current user
 */
export async function resetProgress(): Promise<boolean> {
  const userId = getCurrentUserId()

  if (!userId || !supabase) {
    return false
  }

  try {
    const { error } = await supabase
      .from('sentence_completion_progress')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error resetting progress:', error)
      return false
    }

    console.log(`✅ Reset all progress for user ${userId}`)
    return true
  } catch (error) {
    console.error('Error resetting progress:', error)
    return false
  }
}

/**
 * Get progress statistics for the current user
 */
export async function getProgressStats(): Promise<{
  totalCompleted: number
  completedToday: number
  completedThisWeek: number
}> {
  const userId = getCurrentUserId()

  if (!userId || !supabase) {
    return { totalCompleted: 0, completedToday: 0, completedThisWeek: 0 }
  }

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get total count
    const { count: totalCompleted } = await supabase
      .from('sentence_completion_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get today's count
    const { count: completedToday } = await supabase
      .from('sentence_completion_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', today.toISOString())

    // Get this week's count
    const { count: completedThisWeek } = await supabase
      .from('sentence_completion_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', weekAgo.toISOString())

    return {
      totalCompleted: totalCompleted || 0,
      completedToday: completedToday || 0,
      completedThisWeek: completedThisWeek || 0,
    }
  } catch (error) {
    console.error('Error getting progress stats:', error)
    return { totalCompleted: 0, completedToday: 0, completedThisWeek: 0 }
  }
}
