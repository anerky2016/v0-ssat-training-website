// Sentence completion mistake tracking
// Records incorrect answers for future review

import { auth } from './firebase'
import { supabase } from './supabase'

export interface SentenceCompletionMistake {
  id?: string
  user_id: string
  question_id: string
  question: string
  correct_answer: string
  user_answer: string
  explanation?: string
  created_at: string
}

// Helper to get current user ID
function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid || null
}

// Check if user is logged in
export function isUserLoggedIn(): boolean {
  return getCurrentUserId() !== null
}

// Save a mistake to Supabase
export async function saveMistake(
  questionId: string,
  question: string,
  correctAnswer: string,
  userAnswer: string,
  explanation?: string
): Promise<boolean> {
  const userId = getCurrentUserId()

  if (!userId) {
    console.warn('User not logged in - cannot save mistake')
    return false
  }

  if (!supabase) {
    console.warn('Supabase not configured - cannot save mistake')
    return false
  }

  try {
    const { error } = await supabase
      .from('sentence_completion_mistakes')
      .insert({
        user_id: userId,
        question_id: questionId,
        question,
        correct_answer: correctAnswer,
        user_answer: userAnswer,
        explanation,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error saving mistake:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to save mistake:', error)
    return false
  }
}

// Save multiple mistakes at once (batch operation)
export async function saveMistakes(
  mistakes: Array<{
    questionId: string
    question: string
    correctAnswer: string
    userAnswer: string
    explanation?: string
  }>
): Promise<number> {
  const userId = getCurrentUserId()

  console.log('[saveMistakes] Called with:', {
    mistakesCount: mistakes.length,
    userId,
    hasSupabase: !!supabase,
    hasAuth: !!auth,
    currentUser: auth?.currentUser?.uid
  })

  if (!userId) {
    console.warn('User not logged in - cannot save mistakes')
    return 0
  }

  if (!supabase) {
    console.warn('Supabase not configured - cannot save mistakes')
    return 0
  }

  if (mistakes.length === 0) {
    console.log('[saveMistakes] No mistakes to save')
    return 0
  }

  try {
    const now = new Date().toISOString()
    const records = mistakes.map(m => ({
      user_id: userId,
      question_id: m.questionId,
      question: m.question,
      correct_answer: m.correctAnswer,
      user_answer: m.userAnswer,
      explanation: m.explanation,
      created_at: now,
    }))

    console.log('[saveMistakes] Inserting records:', records.length)

    const { data, error } = await supabase
      .from('sentence_completion_mistakes')
      .insert(records)
      .select()

    if (error) {
      console.error('[saveMistakes] Error saving mistakes:', error)
      return 0
    }

    console.log('[saveMistakes] Successfully saved:', data?.length || 0, 'mistakes')
    return data?.length || 0
  } catch (error) {
    console.error('[saveMistakes] Failed to save mistakes:', error)
    return 0
  }
}

// Update the explanation for the most recent mistake of a specific question
export async function updateMistakeExplanation(
  questionId: string,
  explanation: string
): Promise<boolean> {
  const userId = getCurrentUserId()

  if (!userId) {
    console.warn('User not logged in - cannot update mistake')
    return false
  }

  if (!supabase) {
    console.warn('Supabase not configured - cannot update mistake')
    return false
  }

  try {
    console.log(`[updateMistakeExplanation] Attempting to update for question: ${questionId}`)

    // Get the most recent mistake for this question
    const { data: mistakes, error: fetchError } = await supabase
      .from('sentence_completion_mistakes')
      .select('id, explanation')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error('[updateMistakeExplanation] Error fetching mistake:', fetchError)
      return false
    }

    if (!mistakes || mistakes.length === 0) {
      console.warn('[updateMistakeExplanation] No mistake found for question:', questionId)
      return false
    }

    console.log(`[updateMistakeExplanation] Found mistake with ID: ${mistakes[0].id}, current explanation length: ${mistakes[0].explanation?.length || 0}`)

    // Update the explanation
    const { error: updateError } = await supabase
      .from('sentence_completion_mistakes')
      .update({ explanation })
      .eq('id', mistakes[0].id)
      .eq('user_id', userId)

    if (updateError) {
      console.error('[updateMistakeExplanation] Error updating mistake explanation:', updateError)
      return false
    }

    console.log(`[updateMistakeExplanation] ✅ Successfully updated explanation for mistake ${mistakes[0].id}, new length: ${explanation.length}`)
    return true
  } catch (error) {
    console.error('Failed to update mistake explanation:', error)
    return false
  }
}

// Get all mistakes for current user with optional date filtering
export async function getAllMistakes(
  startDate?: Date,
  endDate?: Date
): Promise<SentenceCompletionMistake[]> {
  const userId = getCurrentUserId()

  if (!userId) {
    console.warn('User not logged in - cannot fetch mistakes')
    return []
  }

  if (!supabase) {
    console.warn('Supabase not configured - cannot fetch mistakes')
    return []
  }

  try {
    let query = supabase
      .from('sentence_completion_mistakes')
      .select('*')
      .eq('user_id', userId)

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching mistakes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch mistakes:', error)
    return []
  }
}

// Get mistakes by question ID
export async function getMistakesByQuestion(questionId: string): Promise<SentenceCompletionMistake[]> {
  const userId = getCurrentUserId()

  if (!userId) {
    console.warn('User not logged in - cannot fetch mistakes')
    return []
  }

  if (!supabase) {
    console.warn('Supabase not configured - cannot fetch mistakes')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('sentence_completion_mistakes')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching mistakes for question:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch mistakes for question:', error)
    return []
  }
}

// Get recent mistakes (last N days)
export async function getRecentMistakes(days: number = 7): Promise<SentenceCompletionMistake[]> {
  const userId = getCurrentUserId()

  if (!userId) {
    console.warn('User not logged in - cannot fetch mistakes')
    return []
  }

  if (!supabase) {
    console.warn('Supabase not configured - cannot fetch mistakes')
    return []
  }

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { data, error } = await supabase
      .from('sentence_completion_mistakes')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recent mistakes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch recent mistakes:', error)
    return []
  }
}

// Delete a specific mistake
export async function deleteMistake(id: string): Promise<boolean> {
  const userId = getCurrentUserId()

  if (!userId) {
    console.warn('User not logged in - cannot delete mistake')
    return false
  }

  if (!supabase) {
    console.warn('Supabase not configured - cannot delete mistake')
    return false
  }

  try {
    const { error } = await supabase
      .from('sentence_completion_mistakes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting mistake:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to delete mistake:', error)
    return false
  }
}

// Clear all mistakes for current user
export async function clearAllMistakes(): Promise<boolean> {
  const userId = getCurrentUserId()

  if (!userId) {
    console.warn('User not logged in - cannot clear mistakes')
    return false
  }

  if (!supabase) {
    console.warn('Supabase not configured - cannot clear mistakes')
    return false
  }

  try {
    const { error } = await supabase
      .from('sentence_completion_mistakes')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error clearing mistakes:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to clear mistakes:', error)
    return false
  }
}

// Get mistake statistics with optional date filtering
export async function getMistakeStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number
  lastWeek: number
  lastMonth: number
  mostCommonMistakes: Array<{ question: string; count: number }>
}> {
  const userId = getCurrentUserId()

  if (!userId || !supabase) {
    return {
      total: 0,
      lastWeek: 0,
      lastMonth: 0,
      mostCommonMistakes: [],
    }
  }

  try {
    const allMistakes = await getAllMistakes(startDate, endDate)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const lastWeek = allMistakes.filter(m => new Date(m.created_at) >= weekAgo).length
    const lastMonth = allMistakes.filter(m => new Date(m.created_at) >= monthAgo).length

    // Count mistakes by question
    const mistakeCounts: Record<string, { question: string; count: number }> = {}
    allMistakes.forEach(m => {
      if (!mistakeCounts[m.question_id]) {
        mistakeCounts[m.question_id] = { question: m.question, count: 0 }
      }
      mistakeCounts[m.question_id].count++
    })

    const mostCommonMistakes = Object.values(mistakeCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      total: allMistakes.length,
      lastWeek,
      lastMonth,
      mostCommonMistakes,
    }
  } catch (error) {
    console.error('Failed to get mistake stats:', error)
    return {
      total: 0,
      lastWeek: 0,
      lastMonth: 0,
      mostCommonMistakes: [],
    }
  }
}

/**
 * Get daily mistake counts for calendar view
 * Returns a map of date (YYYY-MM-DD) to count
 */
export async function getDailyMistakeCounts(
  startDate?: Date,
  endDate?: Date
): Promise<Record<string, number>> {
  const userId = getCurrentUserId()

  if (!userId || !supabase) {
    return {}
  }

  try {
    let query = supabase
      .from('sentence_completion_mistakes')
      .select('created_at')
      .eq('user_id', userId)

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error getting daily mistake counts:', error)
      return {}
    }

    // Group by date
    const counts: Record<string, number> = {}
    data?.forEach(row => {
      const date = new Date(row.created_at)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
      counts[dateKey] = (counts[dateKey] || 0) + 1
    })

    return counts
  } catch (error) {
    console.error('Error getting daily mistake counts:', error)
    return {}
  }
}
