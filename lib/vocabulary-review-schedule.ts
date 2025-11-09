/**
 * Vocabulary Review Schedule Management
 * Implements spaced repetition using the forgetting curve
 */

import { supabase } from './supabase'
import { auth } from './firebase'

export type DifficultyLevel = 0 | 1 | 2 | 3 // 0=Wait, 1=Easy, 2=Medium, 3=Hard

export interface ReviewSchedule {
  id?: string
  user_id: string
  word: string
  difficulty: DifficultyLevel
  review_count: number
  last_reviewed_at: string | null
  next_review_at: string
  created_at?: string
  updated_at?: string
}

export interface ReviewHistory {
  id?: string
  user_id: string
  word: string
  difficulty_at_review: DifficultyLevel
  reviewed_at: string
  time_spent_seconds?: number
  was_recalled_correctly?: boolean
}

/**
 * Get the current user ID from Firebase auth
 */
function getCurrentUserId(): string | null {
  const uid = auth?.currentUser?.uid || null
  if (!uid) {
    console.log('📅 [Review Schedule] No user currently authenticated')
  }
  return uid
}

/**
 * Calculate next review time based on difficulty and review count
 * Uses spaced repetition intervals based on the forgetting curve
 */
export function calculateNextReview(
  difficulty: DifficultyLevel,
  reviewCount: number,
  lastReviewDate: Date = new Date()
): Date {
  // Intervals in minutes for each difficulty level
  // Each array represents: [1st review, 2nd review, 3rd review, 4th review, 5th review, 6th+ review]
  const intervals: Record<DifficultyLevel, number[]> = {
    0: [4*60, 24*60, 3*24*60, 7*24*60, 14*24*60, 30*24*60],        // Wait for decision
    1: [3*24*60, 7*24*60, 14*24*60, 30*24*60, 90*24*60, 180*24*60], // Easy
    2: [24*60, 3*24*60, 7*24*60, 14*24*60, 30*24*60, 90*24*60],    // Medium
    3: [4*60, 12*60, 24*60, 3*24*60, 7*24*60, 14*24*60],           // Hard
  }

  const difficultyIntervals = intervals[difficulty] || intervals[2] // Default to Medium
  const intervalIndex = Math.min(reviewCount, difficultyIntervals.length - 1)
  const intervalMinutes = difficultyIntervals[intervalIndex]

  const nextReview = new Date(lastReviewDate.getTime() + intervalMinutes * 60 * 1000)

  console.log('📅 [Review Schedule] Calculated next review:', {
    difficulty,
    reviewCount,
    intervalMinutes,
    intervalHuman: formatInterval(intervalMinutes),
    nextReview: nextReview.toISOString()
  })

  return nextReview
}

/**
 * Format interval in minutes to human-readable string
 */
function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  if (minutes < 24*60) return `${Math.round(minutes / 60)}h`
  if (minutes < 7*24*60) return `${Math.round(minutes / (24*60))}d`
  if (minutes < 30*24*60) return `${Math.round(minutes / (7*24*60))}w`
  return `${Math.round(minutes / (30*24*60))}mo`
}

/**
 * Create or update review schedule for a word
 */
export async function scheduleWordReview(
  word: string,
  difficulty: DifficultyLevel
): Promise<ReviewSchedule | null> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('❌ [Review Schedule] Cannot schedule review - user not logged in')
    return null
  }

  if (!supabase) {
    console.error('❌ [Review Schedule] Supabase not configured')
    return null
  }

  try {
    const normalizedWord = word.toLowerCase()

    // Get existing schedule if it exists
    const { data: existing } = await supabase
      .from('vocabulary_review_schedule')
      .select('*')
      .eq('user_id', userId)
      .eq('word', normalizedWord)
      .single()

    const reviewCount = existing?.review_count || 0
    const now = new Date()
    const nextReview = calculateNextReview(difficulty, reviewCount, now)

    console.log('💾 [Review Schedule] Scheduling word review:', {
      word: normalizedWord,
      userId: userId.substring(0, 8) + '...',
      difficulty,
      reviewCount,
      nextReview: nextReview.toISOString()
    })

    const { data, error } = await supabase
      .from('vocabulary_review_schedule')
      .upsert({
        user_id: userId,
        word: normalizedWord,
        difficulty,
        review_count: reviewCount,
        last_reviewed_at: now.toISOString(),
        next_review_at: nextReview.toISOString(),
        updated_at: now.toISOString()
      }, {
        onConflict: 'user_id,word'
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ [Review Schedule] Word scheduled successfully:', normalizedWord)
    return data
  } catch (error) {
    console.error('❌ [Review Schedule] Failed to schedule review:', error)
    return null
  }
}

/**
 * Record a word review in history and update schedule
 */
export async function recordWordReview(
  word: string,
  timeSpentSeconds?: number,
  wasRecalledCorrectly?: boolean
): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('❌ [Review Schedule] Cannot record review - user not logged in')
    return
  }

  if (!supabase) {
    console.error('❌ [Review Schedule] Supabase not configured')
    return
  }

  try {
    const normalizedWord = word.toLowerCase()

    // Get current schedule
    const { data: schedule } = await supabase
      .from('vocabulary_review_schedule')
      .select('*')
      .eq('user_id', userId)
      .eq('word', normalizedWord)
      .single()

    if (!schedule) {
      console.warn('⚠️ [Review Schedule] No schedule found for word:', normalizedWord)
      return
    }

    console.log('📝 [Review Schedule] Recording word review:', {
      word: normalizedWord,
      timeSpent: timeSpentSeconds,
      recalled: wasRecalledCorrectly
    })

    // Log to history
    await supabase
      .from('vocabulary_review_history')
      .insert({
        user_id: userId,
        word: normalizedWord,
        difficulty_at_review: schedule.difficulty,
        reviewed_at: new Date().toISOString(),
        time_spent_seconds: timeSpentSeconds,
        was_recalled_correctly: wasRecalledCorrectly
      })

    // Update schedule with incremented review count
    const newReviewCount = (schedule.review_count || 0) + 1
    const now = new Date()
    const nextReview = calculateNextReview(schedule.difficulty, newReviewCount, now)

    await supabase
      .from('vocabulary_review_schedule')
      .update({
        review_count: newReviewCount,
        last_reviewed_at: now.toISOString(),
        next_review_at: nextReview.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('user_id', userId)
      .eq('word', normalizedWord)

    console.log('✅ [Review Schedule] Review recorded successfully:', {
      word: normalizedWord,
      newReviewCount,
      nextReview: nextReview.toISOString()
    })
  } catch (error) {
    console.error('❌ [Review Schedule] Failed to record review:', error)
  }
}

/**
 * Get words due for review
 */
export async function getDueReviews(userId?: string): Promise<ReviewSchedule[]> {
  const uid = userId || getCurrentUserId()
  if (!uid) {
    console.log('📅 [Review Schedule] Cannot fetch reviews - user not logged in')
    return []
  }

  if (!supabase) {
    console.log('📅 [Review Schedule] Supabase not configured')
    return []
  }

  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('vocabulary_review_schedule')
      .select('*')
      .eq('user_id', uid)
      .lte('next_review_at', now)
      .order('next_review_at', { ascending: true })

    if (error) throw error

    console.log('✅ [Review Schedule] Fetched due reviews:', {
      userId: uid.substring(0, 8) + '...',
      count: data?.length || 0
    })

    return data || []
  } catch (error) {
    console.error('❌ [Review Schedule] Failed to fetch due reviews:', error)
    return []
  }
}

/**
 * Get upcoming reviews (within next 24 hours)
 */
export async function getUpcomingReviews(): Promise<ReviewSchedule[]> {
  const userId = getCurrentUserId()
  if (!userId) return []

  if (!supabase) return []

  try {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('vocabulary_review_schedule')
      .select('*')
      .eq('user_id', userId)
      .gte('next_review_at', now.toISOString())
      .lte('next_review_at', tomorrow.toISOString())
      .order('next_review_at', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('❌ [Review Schedule] Failed to fetch upcoming reviews:', error)
    return []
  }
}

/**
 * Get review statistics for a user
 */
export async function getReviewStats(userId?: string): Promise<{
  totalScheduled: number
  dueNow: number
  dueToday: number
  reviewedToday: number
  reviewedThisWeek: number
  averageRecall: number
}> {
  const uid = userId || getCurrentUserId()
  if (!uid || !supabase) {
    return {
      totalScheduled: 0,
      dueNow: 0,
      dueToday: 0,
      reviewedToday: 0,
      reviewedThisWeek: 0,
      averageRecall: 0
    }
  }

  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    // Get scheduled reviews
    const { data: scheduled } = await supabase
      .from('vocabulary_review_schedule')
      .select('next_review_at')
      .eq('user_id', uid)

    const totalScheduled = scheduled?.length || 0
    const dueNow = scheduled?.filter(s => new Date(s.next_review_at) <= now).length || 0
    const dueToday = scheduled?.filter(s =>
      new Date(s.next_review_at) >= startOfDay &&
      new Date(s.next_review_at) <= endOfDay
    ).length || 0

    // Get review history
    const { data: historyToday } = await supabase
      .from('vocabulary_review_history')
      .select('was_recalled_correctly')
      .eq('user_id', uid)
      .gte('reviewed_at', startOfDay.toISOString())

    const { data: historyWeek } = await supabase
      .from('vocabulary_review_history')
      .select('was_recalled_correctly')
      .eq('user_id', uid)
      .gte('reviewed_at', startOfWeek.toISOString())

    const reviewedToday = historyToday?.length || 0
    const reviewedThisWeek = historyWeek?.length || 0

    // Calculate average recall rate
    const recallData = historyWeek?.filter(h => h.was_recalled_correctly !== null) || []
    const correctRecalls = recallData.filter(h => h.was_recalled_correctly).length
    const averageRecall = recallData.length > 0 ? correctRecalls / recallData.length : 0

    return {
      totalScheduled,
      dueNow,
      dueToday,
      reviewedToday,
      reviewedThisWeek,
      averageRecall
    }
  } catch (error) {
    console.error('❌ [Review Schedule] Failed to get review stats:', error)
    return {
      totalScheduled: 0,
      dueNow: 0,
      dueToday: 0,
      reviewedToday: 0,
      reviewedThisWeek: 0,
      averageRecall: 0
    }
  }
}

/**
 * Get words due for review with their difficulty levels as a list of words
 * Returns just the word strings that are due for review
 */
export async function getDueReviewWords(): Promise<string[]> {
  const schedules = await getDueReviews()
  return schedules.map(s => s.word)
}

/**
 * Sync existing vocabulary difficulties to review schedule
 * This creates review schedule entries for words that have difficulty levels
 * but don't have review schedules yet
 */
export async function syncDifficultiesToReviewSchedule(): Promise<number> {
  const userId = getCurrentUserId()
  if (!userId) {
    console.log('📅 [Review Schedule] Cannot sync - user not logged in')
    return 0
  }

  if (!supabase) {
    console.log('📅 [Review Schedule] Supabase not configured')
    return 0
  }

  try {
    console.log('🔄 [Review Schedule] Starting sync of difficulties to review schedule...')

    // Get all difficulty levels for this user
    const { data: difficulties, error: diffError } = await supabase
      .from('vocabulary_difficulty')
      .select('word, difficulty, updated_at')
      .eq('user_id', userId)

    if (diffError) throw diffError

    if (!difficulties || difficulties.length === 0) {
      console.log('📅 [Review Schedule] No difficulties found to sync')
      return 0
    }

    console.log(`📅 [Review Schedule] Found ${difficulties.length} words with difficulty levels`)

    // Get existing review schedules
    const { data: existingSchedules, error: schedError } = await supabase
      .from('vocabulary_review_schedule')
      .select('word')
      .eq('user_id', userId)

    if (schedError) throw schedError

    const existingWords = new Set(existingSchedules?.map(s => s.word) || [])

    // Find words that need review schedules created
    const wordsToSchedule = difficulties.filter(d => !existingWords.has(d.word))

    if (wordsToSchedule.length === 0) {
      console.log('✅ [Review Schedule] All words already have review schedules')
      return 0
    }

    console.log(`📅 [Review Schedule] Creating review schedules for ${wordsToSchedule.length} words...`)

    // Create review schedules for words that don't have them
    const schedules = wordsToSchedule.map(d => {
      const lastReviewed = new Date(d.updated_at)
      const nextReview = calculateNextReview(d.difficulty as DifficultyLevel, 0, lastReviewed)

      return {
        user_id: userId,
        word: d.word,
        difficulty: d.difficulty as DifficultyLevel,
        review_count: 0,
        last_reviewed_at: lastReviewed.toISOString(),
        next_review_at: nextReview.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    // Insert in batches to avoid overwhelming the database
    const batchSize = 100
    let totalInserted = 0

    for (let i = 0; i < schedules.length; i += batchSize) {
      const batch = schedules.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('vocabulary_review_schedule')
        .insert(batch)

      if (insertError) {
        console.error('❌ [Review Schedule] Error inserting batch:', insertError)
        continue
      }

      totalInserted += batch.length
      console.log(`📅 [Review Schedule] Inserted batch ${Math.floor(i / batchSize) + 1}, total: ${totalInserted}`)
    }

    console.log(`✅ [Review Schedule] Sync complete! Created ${totalInserted} review schedules`)
    return totalInserted
  } catch (error) {
    console.error('❌ [Review Schedule] Failed to sync difficulties:', error)
    return 0
  }
}
