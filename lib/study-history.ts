// Client-side study history functionality using Supabase
import { auth } from './firebase'
import {
  saveStudySession as saveStudySessionToSupabase,
  getUserStudySessions,
  saveLessonCompletion as saveLessonCompletionToSupabase,
  getUserLessonCompletions,
  deleteLessonCompletion as deleteLessonCompletionFromSupabase,
} from './supabase'

export interface StudySession {
  topicPath: string // e.g., "/math/exponents/multiplication-division-properties"
  topicTitle: string // e.g., "Multiplication Properties of Exponents"
  category: string // e.g., "math" or "verbal"
  timestamp: number
  duration: number // Time spent in seconds
  problemsViewed: number // Number of problems where answers were revealed
  difficulty?: string // e.g., "easy", "medium", "hard"
}

// Helper to get current user ID
function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid || null
}

export interface StudyStats {
  totalSessions: number
  totalTimeSpent: number // in seconds
  topicsStudied: number
  problemsViewed: number
  lastStudyDate: number
  streakDays: number
}

const STUDY_HISTORY_KEY = 'ssat-study-history'
const MAX_SESSIONS = 500 // Keep last 500 sessions

// Get all study sessions from Supabase
export async function getStudyHistory(): Promise<StudySession[]> {
  if (typeof window === 'undefined') return []

  const userId = getCurrentUserId()
  if (!userId) {
    // Silent return - user may not be logged in or auth may still be loading
    return []
  }

  try {
    const sessions = await getUserStudySessions(userId, MAX_SESSIONS)
    return sessions.map(s => ({
      topicPath: s.topic_path,
      topicTitle: s.topic_title,
      category: s.category,
      timestamp: new Date(s.timestamp).getTime(),
      duration: s.duration,
      problemsViewed: s.problems_viewed,
      difficulty: s.difficulty,
    }))
  } catch (error) {
    console.error('Failed to retrieve study history:', error)
    return []
  }
}

// Add a new study session to Supabase
export async function addStudySession(session: StudySession) {
  if (typeof window === 'undefined') return

  const userId = getCurrentUserId()
  if (!userId) {
    // Silent return - user may not be logged in or auth may still be loading
    return
  }

  try {
    await saveStudySessionToSupabase(userId, {
      topic_path: session.topicPath,
      topic_title: session.topicTitle,
      category: session.category,
      timestamp: new Date(session.timestamp).toISOString(),
      duration: session.duration,
      problems_viewed: session.problemsViewed,
      difficulty: session.difficulty,
    })
  } catch (error) {
    console.error('Failed to save study session:', error)
  }
}

// Get study statistics
export async function getStudyStats(): Promise<StudyStats> {
  const history = await getStudyHistory()

  if (history.length === 0) {
    return {
      totalSessions: 0,
      totalTimeSpent: 0,
      topicsStudied: 0,
      problemsViewed: 0,
      lastStudyDate: 0,
      streakDays: 0,
    }
  }

  // Calculate total time spent
  const totalTimeSpent = history.reduce((sum, session) => sum + session.duration, 0)

  // Calculate unique topics
  const uniqueTopics = new Set(history.map(s => s.topicPath))

  // Calculate total problems viewed
  const problemsViewed = history.reduce((sum, session) => sum + session.problemsViewed, 0)

  // Calculate streak (consecutive days with study sessions)
  const streakDays = calculateStreak(history)

  return {
    totalSessions: history.length,
    totalTimeSpent,
    topicsStudied: uniqueTopics.size,
    problemsViewed,
    lastStudyDate: history[0].timestamp,
    streakDays,
  }
}

// Get study statistics for a specific category
export async function getStudyStatsByCategory(category: string): Promise<StudyStats> {
  const history = (await getStudyHistory()).filter(s => s.category === category)

  if (history.length === 0) {
    return {
      totalSessions: 0,
      totalTimeSpent: 0,
      topicsStudied: 0,
      problemsViewed: 0,
      lastStudyDate: 0,
      streakDays: 0,
    }
  }

  // Calculate total time spent
  const totalTimeSpent = history.reduce((sum, session) => sum + session.duration, 0)

  // Calculate unique topics
  const uniqueTopics = new Set(history.map(s => s.topicPath))

  // Calculate total problems viewed
  const problemsViewed = history.reduce((sum, session) => sum + session.problemsViewed, 0)

  // Calculate streak (consecutive days with study sessions in this category)
  const streakDays = calculateStreak(history)

  return {
    totalSessions: history.length,
    totalTimeSpent,
    topicsStudied: uniqueTopics.size,
    problemsViewed,
    lastStudyDate: history[0].timestamp,
    streakDays,
  }
}

// Calculate study streak
function calculateStreak(history: StudySession[]): number {
  if (history.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  // Get unique study dates (normalized to midnight)
  const studyDates = Array.from(
    new Set(
      history.map(session => {
        const date = new Date(session.timestamp)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      })
    )
  ).sort((a, b) => b - a) // Sort descending (most recent first)

  // Check if studied today or yesterday to start streak
  const oneDayMs = 24 * 60 * 60 * 1000
  const mostRecentStudy = studyDates[0]

  if (mostRecentStudy < todayTime - oneDayMs) {
    // Last study was more than a day ago, streak is broken
    return 0
  }

  let streak = 1
  for (let i = 1; i < studyDates.length; i++) {
    const daysDiff = Math.round((studyDates[i - 1] - studyDates[i]) / oneDayMs)
    if (daysDiff === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// Get sessions for a specific date range
export async function getSessionsByDateRange(startDate: number, endDate: number): Promise<StudySession[]> {
  const history = await getStudyHistory()
  return history.filter(
    session => session.timestamp >= startDate && session.timestamp <= endDate
  )
}

// Get sessions for a specific topic
export async function getSessionsByTopic(topicPath: string): Promise<StudySession[]> {
  const history = await getStudyHistory()
  return history.filter(session => session.topicPath === topicPath)
}

// Get sessions grouped by day (last N days)
export async function getSessionsByDay(days: number = 7): Promise<Map<string, StudySession[]>> {
  const history = await getStudyHistory()
  const now = Date.now()
  const daysAgo = now - days * 24 * 60 * 60 * 1000

  const recentSessions = history.filter(session => session.timestamp >= daysAgo)

  const grouped = new Map<string, StudySession[]>()

  recentSessions.forEach(session => {
    const date = new Date(session.timestamp)
    const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }
    grouped.get(dateKey)!.push(session)
  })

  return grouped
}

// Get most studied topics
export async function getMostStudiedTopics(limit: number = 5): Promise<Array<{ topicPath: string; topicTitle: string; count: number; totalTime: number }>> {
  const history = await getStudyHistory()
  const topicMap = new Map<string, { title: string; count: number; totalTime: number }>()

  history.forEach(session => {
    if (!topicMap.has(session.topicPath)) {
      topicMap.set(session.topicPath, {
        title: session.topicTitle,
        count: 0,
        totalTime: 0,
      })
    }

    const topic = topicMap.get(session.topicPath)!
    topic.count++
    topic.totalTime += session.duration
  })

  return Array.from(topicMap.entries())
    .map(([path, data]) => ({
      topicPath: path,
      topicTitle: data.title,
      count: data.count,
      totalTime: data.totalTime,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// Get most studied topics for a specific category
export async function getMostStudiedTopicsByCategory(category: string, limit: number = 5): Promise<Array<{ topicPath: string; topicTitle: string; count: number; totalTime: number }>> {
  const history = (await getStudyHistory()).filter(s => s.category === category)
  const topicMap = new Map<string, { title: string; count: number; totalTime: number }>()

  history.forEach(session => {
    if (!topicMap.has(session.topicPath)) {
      topicMap.set(session.topicPath, {
        title: session.topicTitle,
        count: 0,
        totalTime: 0,
      })
    }

    const topic = topicMap.get(session.topicPath)!
    topic.count++
    topic.totalTime += session.duration
  })

  return Array.from(topicMap.entries())
    .map(([path, data]) => ({
      topicPath: path,
      topicTitle: data.title,
      count: data.count,
      totalTime: data.totalTime,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// Clear all study history (localStorage only - Supabase data persists)
export function clearStudyHistory() {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STUDY_HISTORY_KEY)
    localStorage.removeItem(LESSON_COMPLETIONS_KEY)
  } catch (error) {
    console.error('Failed to clear study history:', error)
  }
}

// Export study history as JSON (for download/backup)
export async function exportStudyHistory(): Promise<string> {
  const history = await getStudyHistory()
  return JSON.stringify(history, null, 2)
}

// Format time duration
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
}

// ===== SPACED REPETITION SYSTEM =====

export interface LessonCompletion {
  topicPath: string
  topicTitle: string
  completionTimestamp: number // When the lesson was marked as completed
  reviewCount: number // Number of times reviewed (0 = initial completion)
  nextReviewDate: number // Timestamp for next recommended review
}

const LESSON_COMPLETIONS_KEY = 'ssat-lesson-completions'

// Spaced repetition intervals in days: 1, 3, 7, 14, 30, 60, 90...
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 90]

// Calculate next review date based on review count
function calculateNextReviewDate(completionTimestamp: number, reviewCount: number): number {
  const intervalIndex = Math.min(reviewCount, REVIEW_INTERVALS.length - 1)
  const daysUntilReview = REVIEW_INTERVALS[intervalIndex]
  return completionTimestamp + (daysUntilReview * 24 * 60 * 60 * 1000)
}

// Get all lesson completions from Supabase
export async function getLessonCompletions(): Promise<LessonCompletion[]> {
  if (typeof window === 'undefined') return []

  const userId = getCurrentUserId()
  if (!userId) {
    // Silent return - user may not be logged in or auth may still be loading
    return []
  }

  try {
    const completions = await getUserLessonCompletions(userId)
    return completions.map(c => ({
      topicPath: c.topic_path,
      topicTitle: c.topic_title,
      completionTimestamp: new Date(c.completion_timestamp).getTime(),
      reviewCount: c.review_count,
      nextReviewDate: new Date(c.next_review_date).getTime(),
    }))
  } catch (error) {
    console.error('Failed to retrieve lesson completions:', error)
    return []
  }
}

// Mark a lesson as completed (or reviewed)
export async function markLessonComplete(topicPath: string, topicTitle: string) {
  if (typeof window === 'undefined') return

  const userId = getCurrentUserId()
  if (!userId) {
    // Silent return - user may not be logged in or auth may still be loading
    return
  }

  try {
    const completions = await getLessonCompletions()
    const existing = completions.find(c => c.topicPath === topicPath)
    const now = Date.now()

    if (existing) {
      // This is a review - increment review count
      const newReviewCount = existing.reviewCount + 1
      const nextReviewDate = calculateNextReviewDate(now, newReviewCount)

      await saveLessonCompletionToSupabase(userId, {
        topic_path: topicPath,
        topic_title: topicTitle,
        completion_timestamp: new Date(now).toISOString(),
        review_count: newReviewCount,
        next_review_date: new Date(nextReviewDate).toISOString(),
      })
    } else {
      // This is a new completion
      const nextReviewDate = calculateNextReviewDate(now, 0)

      await saveLessonCompletionToSupabase(userId, {
        topic_path: topicPath,
        topic_title: topicTitle,
        completion_timestamp: new Date(now).toISOString(),
        review_count: 0,
        next_review_date: new Date(nextReviewDate).toISOString(),
      })
    }
  } catch (error) {
    console.error('Failed to mark lesson complete:', error)
  }
}

// Uncomplete a lesson (remove it from completions)
export async function uncompletLesson(topicPath: string) {
  if (typeof window === 'undefined') return

  const userId = getCurrentUserId()
  if (!userId) {
    // Silent return - user may not be logged in or auth may still be loading
    return
  }

  try {
    await deleteLessonCompletionFromSupabase(userId, topicPath)
  } catch (error) {
    console.error('Failed to uncomplete lesson:', error)
  }
}

// Get lessons due for review (sorted by urgency)
export async function getLessonsDueForReview(): Promise<LessonCompletion[]> {
  const completions = await getLessonCompletions()
  const now = Date.now()

  return completions
    .filter(c => c.nextReviewDate <= now)
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate) // Most overdue first
}

// Get upcoming reviews (sorted by date)
export async function getUpcomingReviews(limit: number = 10): Promise<LessonCompletion[]> {
  const completions = await getLessonCompletions()
  const now = Date.now()

  return completions
    .filter(c => c.nextReviewDate > now)
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate) // Soonest first
    .slice(0, limit)
}

// Get completion info for a specific lesson
export async function getLessonCompletion(topicPath: string): Promise<LessonCompletion | null> {
  const completions = await getLessonCompletions()
  return completions.find(c => c.topicPath === topicPath) || null
}

// Format date for display
export function formatReviewDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (dateOnly.getTime() === today.getTime()) {
    return 'Today'
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  } else {
    const diffTime = dateOnly.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      const absDays = Math.abs(diffDays)
      return absDays === 1 ? '1 day overdue' : `${absDays} days overdue`
    } else if (diffDays <= 7) {
      return `in ${diffDays} days`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }
}
