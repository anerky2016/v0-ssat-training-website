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
 * Get progress statistics for the current user with optional date filtering
 */
export async function getProgressStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
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

    // Get total count (with optional date filtering)
    let totalQuery = supabase
      .from('sentence_completion_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (startDate) {
      totalQuery = totalQuery.gte('completed_at', startDate.toISOString())
    }
    if (endDate) {
      totalQuery = totalQuery.lte('completed_at', endDate.toISOString())
    }

    const { count: totalCompleted } = await totalQuery

    // Get today's count (respecting date filters if they're more restrictive)
    const todayStartDate = startDate && startDate > today ? startDate : today
    let todayQuery = supabase
      .from('sentence_completion_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', todayStartDate.toISOString())

    if (endDate) {
      todayQuery = todayQuery.lte('completed_at', endDate.toISOString())
    }

    const { count: completedToday } = await todayQuery

    // Get this week's count (respecting date filters if they're more restrictive)
    const weekStartDate = startDate && startDate > weekAgo ? startDate : weekAgo
    let weekQuery = supabase
      .from('sentence_completion_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', weekStartDate.toISOString())

    if (endDate) {
      weekQuery = weekQuery.lte('completed_at', endDate.toISOString())
    }

    const { count: completedThisWeek } = await weekQuery

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

/**
 * Completed question record with timestamp
 */
export interface CompletedQuestionRecord {
  questionId: string
  completedAt: string
}

/**
 * Get all completed questions with timestamps for the current user
 * Returns most recently completed first
 */
export async function getCompletedQuestionsWithTimestamps(
  limit?: number,
  offset?: number,
  startDate?: Date,
  endDate?: Date
): Promise<CompletedQuestionRecord[]> {
  const userId = getCurrentUserId()

  if (!userId || !supabase) {
    return []
  }

  try {
    let query = supabase
      .from('sentence_completion_progress')
      .select('question_id, completed_at')
      .eq('user_id', userId)

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('completed_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('completed_at', endDate.toISOString())
    }

    query = query.order('completed_at', { ascending: false })

    // Apply pagination if specified
    if (limit !== undefined) {
      query = query.limit(limit)
    }
    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading completed questions with timestamps:', error)
      return []
    }

    return data?.map(row => ({
      questionId: row.question_id,
      completedAt: row.completed_at,
    })) || []
  } catch (error) {
    console.error('Error loading completed questions with timestamps:', error)
    return []
  }
}

/**
 * Get total count of completed questions for the current user
 */
export async function getTotalCompletedCount(
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const userId = getCurrentUserId()

  if (!userId || !supabase) {
    return 0
  }

  try {
    let query = supabase
      .from('sentence_completion_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('completed_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('completed_at', endDate.toISOString())
    }

    const { count, error } = await query

    if (error) {
      console.error('Error getting total count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error getting total count:', error)
    return 0
  }
}

/**
 * Get daily completion counts for calendar view
 * Returns a map of date (YYYY-MM-DD) to count
 */
export async function getDailyCompletionCounts(
  startDate?: Date,
  endDate?: Date
): Promise<Record<string, number>> {
  const userId = getCurrentUserId()

  if (!userId || !supabase) {
    return {}
  }

  try {
    let query = supabase
      .from('sentence_completion_progress')
      .select('completed_at')
      .eq('user_id', userId)

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('completed_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('completed_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error getting daily counts:', error)
      return {}
    }

    // Group by date
    const counts: Record<string, number> = {}
    data?.forEach(row => {
      const date = new Date(row.completed_at)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
      counts[dateKey] = (counts[dateKey] || 0) + 1
    })

    return counts
  } catch (error) {
    console.error('Error getting daily counts:', error)
    return {}
  }
}
