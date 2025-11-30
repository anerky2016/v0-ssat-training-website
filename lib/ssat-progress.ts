// SSAT practice progress tracking utilities

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
 * Question type for SSAT practice
 */
export type SsatQuestionType = 'SYNONYM' | 'ANALOGY'

/**
 * Load all completed question IDs for the current user by type
 */
export async function getCompletedQuestions(
  questionType?: SsatQuestionType
): Promise<string[]> {
  const userId = getCurrentUserId()

  // If not logged in, return from localStorage
  if (!userId || !supabase) {
    return getCompletedQuestionsFromLocalStorage(questionType)
  }

  try {
    let query = supabase
      .from('ssat_progress')
      .select('question_id')
      .eq('user_id', userId)

    // Filter by question type if provided
    if (questionType) {
      query = query.eq('question_type', questionType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading completed SSAT questions:', error)
      return getCompletedQuestionsFromLocalStorage(questionType)
    }

    const dbCompleted = data?.map(row => row.question_id) || []

    // Merge with localStorage
    const localCompleted = getCompletedQuestionsFromLocalStorage(questionType)
    const merged = [...new Set([...dbCompleted, ...localCompleted])]

    // Sync local-only to database
    const localOnly = localCompleted.filter(id => !dbCompleted.includes(id))
    if (localOnly.length > 0) {
      console.log(`Syncing ${localOnly.length} local SSAT questions to database...`)
      await markQuestionsCompleted(localOnly, questionType || 'SYNONYM')
    }

    return merged
  } catch (error) {
    console.error('Error loading completed SSAT questions:', error)
    return getCompletedQuestionsFromLocalStorage(questionType)
  }
}

/**
 * Get completed questions from localStorage
 */
function getCompletedQuestionsFromLocalStorage(
  questionType?: SsatQuestionType
): string[] {
  try {
    const key = questionType
      ? `ssat-${questionType.toLowerCase()}-completed`
      : 'ssat-completed'

    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
  }
  return []
}

/**
 * Save completed questions to localStorage
 */
function saveCompletedQuestionsToLocalStorage(
  questionIds: string[],
  questionType: SsatQuestionType
): void {
  try {
    const key = `ssat-${questionType.toLowerCase()}-completed`
    const existing = getCompletedQuestionsFromLocalStorage(questionType)
    const merged = [...new Set([...existing, ...questionIds])]
    localStorage.setItem(key, JSON.stringify(merged))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

/**
 * Mark multiple questions as completed for the current user
 */
export async function markQuestionsCompleted(
  questionIds: string[],
  questionType: SsatQuestionType
): Promise<number> {
  const userId = getCurrentUserId()

  // Always save to localStorage
  saveCompletedQuestionsToLocalStorage(questionIds, questionType)

  if (!userId || !supabase || questionIds.length === 0) {
    return questionIds.length
  }

  try {
    const now = new Date().toISOString()

    // Build records to insert
    const records = questionIds.map(questionId => ({
      user_id: userId,
      question_id: questionId,
      question_type: questionType,
      completed_at: now,
    }))

    // Use upsert to handle duplicates gracefully
    const { data, error } = await supabase
      .from('ssat_progress')
      .upsert(records, {
        onConflict: 'user_id,question_id',
        ignoreDuplicates: true
      })
      .select()

    if (error) {
      console.error('Error marking SSAT questions as completed:', error)
      return questionIds.length // Still marked in localStorage
    }

    console.log(`✅ Marked ${questionIds.length} ${questionType} questions as completed`)
    return data?.length || 0
  } catch (error) {
    console.error('Error marking SSAT questions as completed:', error)
    return questionIds.length
  }
}

/**
 * Reset all progress for the current user
 */
export async function resetProgress(
  questionType?: SsatQuestionType
): Promise<boolean> {
  const userId = getCurrentUserId()

  // Clear localStorage
  if (questionType) {
    const key = `ssat-${questionType.toLowerCase()}-completed`
    localStorage.removeItem(key)
  } else {
    localStorage.removeItem('ssat-synonym-completed')
    localStorage.removeItem('ssat-analogy-completed')
  }

  if (!userId || !supabase) {
    return true
  }

  try {
    let query = supabase
      .from('ssat_progress')
      .delete()
      .eq('user_id', userId)

    // Filter by question type if provided
    if (questionType) {
      query = query.eq('question_type', questionType)
    }

    const { error } = await query

    if (error) {
      console.error('Error resetting SSAT progress:', error)
      return false
    }

    console.log(`✅ Reset ${questionType || 'all'} SSAT progress`)
    return true
  } catch (error) {
    console.error('Error resetting SSAT progress:', error)
    return false
  }
}

/**
 * Get progress statistics for the current user
 */
export async function getProgressStats(
  questionType?: SsatQuestionType
): Promise<{
  totalCompleted: number
  completedToday: number
  completedThisWeek: number
}> {
  const userId = getCurrentUserId()

  if (!userId || !supabase) {
    const localCompleted = getCompletedQuestionsFromLocalStorage(questionType)
    return {
      totalCompleted: localCompleted.length,
      completedToday: 0,
      completedThisWeek: 0,
    }
  }

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get total count
    let totalQuery = supabase
      .from('ssat_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (questionType) {
      totalQuery = totalQuery.eq('question_type', questionType)
    }

    const { count: totalCompleted } = await totalQuery

    // Get today's count
    let todayQuery = supabase
      .from('ssat_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', today.toISOString())

    if (questionType) {
      todayQuery = todayQuery.eq('question_type', questionType)
    }

    const { count: completedToday } = await todayQuery

    // Get this week's count
    let weekQuery = supabase
      .from('ssat_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', weekAgo.toISOString())

    if (questionType) {
      weekQuery = weekQuery.eq('question_type', questionType)
    }

    const { count: completedThisWeek } = await weekQuery

    return {
      totalCompleted: totalCompleted || 0,
      completedToday: completedToday || 0,
      completedThisWeek: completedThisWeek || 0,
    }
  } catch (error) {
    console.error('Error getting SSAT progress stats:', error)
    return { totalCompleted: 0, completedToday: 0, completedThisWeek: 0 }
  }
}

/**
 * Get completed questions with timestamps
 */
export async function getCompletedQuestionsWithTimestamps(
  questionType?: SsatQuestionType,
  limit?: number
): Promise<Array<{ questionId: string; completedAt: string; questionType: string }>> {
  const userId = getCurrentUserId()

  if (!userId || !supabase) {
    return []
  }

  try {
    let query = supabase
      .from('ssat_progress')
      .select('question_id, question_type, completed_at')
      .eq('user_id', userId)

    if (questionType) {
      query = query.eq('question_type', questionType)
    }

    query = query.order('completed_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading completed questions with timestamps:', error)
      return []
    }

    return data?.map(row => ({
      questionId: row.question_id,
      questionType: row.question_type,
      completedAt: row.completed_at,
    })) || []
  } catch (error) {
    console.error('Error loading completed questions with timestamps:', error)
    return []
  }
}
