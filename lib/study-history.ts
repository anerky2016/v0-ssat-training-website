// Client-side study history functionality using localStorage

export interface StudySession {
  topicPath: string // e.g., "/math/exponents/multiplication-division-properties"
  topicTitle: string // e.g., "Multiplication Properties of Exponents"
  category: string // e.g., "math" or "verbal"
  timestamp: number
  duration: number // Time spent in seconds
  problemsViewed: number // Number of problems where answers were revealed
  difficulty?: string // e.g., "easy", "medium", "hard"
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

// Get all study sessions
export function getStudyHistory(): StudySession[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STUDY_HISTORY_KEY)
    if (!stored) return []

    return JSON.parse(stored) as StudySession[]
  } catch (error) {
    console.error('Failed to retrieve study history:', error)
    return []
  }
}

// Add a new study session
export function addStudySession(session: StudySession) {
  if (typeof window === 'undefined') return

  try {
    const history = getStudyHistory()

    // Add new session at the beginning
    history.unshift(session)

    // Keep only the most recent sessions
    const trimmedHistory = history.slice(0, MAX_SESSIONS)

    localStorage.setItem(STUDY_HISTORY_KEY, JSON.stringify(trimmedHistory))
  } catch (error) {
    console.error('Failed to save study session:', error)
  }
}

// Get study statistics
export function getStudyStats(): StudyStats {
  const history = getStudyHistory()

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
export function getSessionsByDateRange(startDate: number, endDate: number): StudySession[] {
  const history = getStudyHistory()
  return history.filter(
    session => session.timestamp >= startDate && session.timestamp <= endDate
  )
}

// Get sessions for a specific topic
export function getSessionsByTopic(topicPath: string): StudySession[] {
  const history = getStudyHistory()
  return history.filter(session => session.topicPath === topicPath)
}

// Get sessions grouped by day (last N days)
export function getSessionsByDay(days: number = 7): Map<string, StudySession[]> {
  const history = getStudyHistory()
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
export function getMostStudiedTopics(limit: number = 5): Array<{ topicPath: string; topicTitle: string; count: number; totalTime: number }> {
  const history = getStudyHistory()
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

// Clear all study history
export function clearStudyHistory() {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STUDY_HISTORY_KEY)
  } catch (error) {
    console.error('Failed to clear study history:', error)
  }
}

// Export study history as JSON (for download/backup)
export function exportStudyHistory(): string {
  const history = getStudyHistory()
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
