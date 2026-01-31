/**
 * Streak and Rewards System
 * Tracks user study streaks, daily goals, and achievement badges
 */

import { supabase } from './supabase'
import { auth } from './firebase'

// ============================================
// TYPES
// ============================================

export interface StudyStreak {
  id?: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_activity_date: string // ISO date string (YYYY-MM-DD)
  total_study_days: number
  streak_frozen_until: string | null
  created_at?: string
  updated_at?: string
}

export interface DailyGoal {
  id?: string
  user_id: string
  goal_date: string // ISO date string (YYYY-MM-DD)
  words_reviewed_goal: number
  words_reviewed_actual: number
  minutes_studied_goal: number
  minutes_studied_actual: number
  questions_answered_goal: number
  questions_answered_actual: number
  goal_completed: boolean
  completed_at: string | null
  created_at?: string
  updated_at?: string
}

export interface Badge {
  id?: string
  user_id: string
  badge_id: string
  badge_name: string
  badge_description: string
  badge_icon: string
  badge_category: 'streak' | 'words' | 'time' | 'accuracy' | 'milestone'
  earned_at?: string
  created_at?: string
}

export interface StreakActivity {
  id?: string
  user_id: string
  activity_date: string // ISO date string (YYYY-MM-DD)
  activity_type: 'vocabulary' | 'quiz' | 'reading' | 'flashcards' | 'story' | 'sentence_completion'
  activity_count: number
  contributed_to_goal: boolean
  created_at?: string
}

export interface StreakStats {
  currentStreak: number
  longestStreak: number
  totalStudyDays: number
  lastActivityDate: string | null
  streakFrozenUntil: string | null
  isActive: boolean // true if studied today or yesterday
  needsActivity: boolean // true if haven't studied today
  daysUntilBreak: number // 0 if streak will break tomorrow, 1 if safe, etc.
}

export interface DailyGoalProgress {
  date: string
  wordsReviewed: { goal: number; actual: number; percentage: number }
  minutesStudied: { goal: number; actual: number; percentage: number }
  questionsAnswered: { goal: number; actual: number; percentage: number }
  overallProgress: number // 0-100
  isComplete: boolean
}

// ============================================
// BADGE DEFINITIONS
// ============================================

export const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'id' | 'user_id' | 'earned_at' | 'created_at'>> = {
  // Streak badges
  streak_3: {
    badge_id: 'streak_3',
    badge_name: 'Getting Started',
    badge_description: 'Studied for 3 days in a row',
    badge_icon: '🔥',
    badge_category: 'streak',
  },
  streak_7: {
    badge_id: 'streak_7',
    badge_name: 'Week Warrior',
    badge_description: 'Studied for 7 days in a row',
    badge_icon: '⚡',
    badge_category: 'streak',
  },
  streak_14: {
    badge_id: 'streak_14',
    badge_name: 'Two Week Champion',
    badge_description: 'Studied for 14 days in a row',
    badge_icon: '💪',
    badge_category: 'streak',
  },
  streak_30: {
    badge_id: 'streak_30',
    badge_name: 'Monthly Master',
    badge_description: 'Studied for 30 days in a row',
    badge_icon: '🏆',
    badge_category: 'streak',
  },
  streak_50: {
    badge_id: 'streak_50',
    badge_name: 'Dedication Expert',
    badge_description: 'Studied for 50 days in a row',
    badge_icon: '🌟',
    badge_category: 'streak',
  },
  streak_100: {
    badge_id: 'streak_100',
    badge_name: 'Century Club',
    badge_description: 'Studied for 100 days in a row',
    badge_icon: '💯',
    badge_category: 'streak',
  },
  streak_365: {
    badge_id: 'streak_365',
    badge_name: 'Year Legend',
    badge_description: 'Studied for 365 days in a row',
    badge_icon: '👑',
    badge_category: 'streak',
  },
  // Words badges
  words_100: {
    badge_id: 'words_100',
    badge_name: 'Vocabulary Starter',
    badge_description: 'Reviewed 100 words',
    badge_icon: '📚',
    badge_category: 'words',
  },
  words_500: {
    badge_id: 'words_500',
    badge_name: 'Word Collector',
    badge_description: 'Reviewed 500 words',
    badge_icon: '📖',
    badge_category: 'words',
  },
  words_1000: {
    badge_id: 'words_1000',
    badge_name: 'Vocabulary Master',
    badge_description: 'Reviewed 1,000 words',
    badge_icon: '🎓',
    badge_category: 'words',
  },
  // Time badges
  time_10h: {
    badge_id: 'time_10h',
    badge_name: 'Time Investor',
    badge_description: 'Studied for 10 hours total',
    badge_icon: '⏰',
    badge_category: 'time',
  },
  time_50h: {
    badge_id: 'time_50h',
    badge_name: 'Dedicated Learner',
    badge_description: 'Studied for 50 hours total',
    badge_icon: '⏳',
    badge_category: 'time',
  },
  time_100h: {
    badge_id: 'time_100h',
    badge_name: 'Study Marathon',
    badge_description: 'Studied for 100 hours total',
    badge_icon: '🏅',
    badge_category: 'time',
  },
  // Milestone badges
  first_day: {
    badge_id: 'first_day',
    badge_name: 'First Steps',
    badge_description: 'Completed your first study session',
    badge_icon: '🌱',
    badge_category: 'milestone',
  },
  comeback_kid: {
    badge_id: 'comeback_kid',
    badge_name: 'Comeback Kid',
    badge_description: 'Restarted after breaking a streak',
    badge_icon: '🔄',
    badge_category: 'milestone',
  },
  perfect_week: {
    badge_id: 'perfect_week',
    badge_name: 'Perfect Week',
    badge_description: 'Met daily goals for 7 days straight',
    badge_icon: '✨',
    badge_category: 'milestone',
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid || null
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterdayDateString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

function daysDifference(date1Str: string, date2Str: string): number {
  const date1 = new Date(date1Str)
  const date2 = new Date(date2Str)
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

// ============================================
// STREAK FUNCTIONS
// ============================================

/**
 * Get user's current streak data
 */
export async function getStreakData(): Promise<StudyStreak | null> {
  const userId = getCurrentUserId()
  if (!userId) return null

  try {
    const { data, error } = await supabase
      .from('study_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching streak data:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching streak data:', error)
    return null
  }
}

/**
 * Get streak statistics with computed fields
 */
export async function getStreakStats(): Promise<StreakStats> {
  const streakData = await getStreakData()
  const today = getTodayDateString()
  const yesterday = getYesterdayDateString()

  if (!streakData) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalStudyDays: 0,
      lastActivityDate: null,
      streakFrozenUntil: null,
      isActive: false,
      needsActivity: true,
      daysUntilBreak: 0,
    }
  }

  const lastActivity = streakData.last_activity_date
  const isActive = lastActivity === today || lastActivity === yesterday
  const needsActivity = lastActivity !== today

  // Calculate days until streak breaks
  let daysUntilBreak = 0
  if (lastActivity === today) {
    daysUntilBreak = 1 // Safe until tomorrow
  } else if (lastActivity === yesterday) {
    daysUntilBreak = 0 // Need to study today or streak breaks
  } else {
    daysUntilBreak = 0 // Streak already broken
  }

  // Check if streak is frozen
  if (streakData.streak_frozen_until && streakData.streak_frozen_until >= today) {
    daysUntilBreak = Math.max(daysUntilBreak, daysDifference(today, streakData.streak_frozen_until))
  }

  return {
    currentStreak: streakData.current_streak,
    longestStreak: streakData.longest_streak,
    totalStudyDays: streakData.total_study_days,
    lastActivityDate: streakData.last_activity_date,
    streakFrozenUntil: streakData.streak_frozen_until,
    isActive,
    needsActivity,
    daysUntilBreak,
  }
}

/**
 * Record a study activity and update streak
 */
export async function recordStudyActivity(
  activityType: StreakActivity['activity_type'],
  activityCount: number = 1
): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId) return false

  const today = getTodayDateString()
  const yesterday = getYesterdayDateString()

  try {
    // Record the activity
    const { error: activityError } = await supabase
      .from('streak_activities')
      .upsert({
        user_id: userId,
        activity_date: today,
        activity_type: activityType,
        activity_count: activityCount,
        contributed_to_goal: true,
      }, {
        onConflict: 'user_id,activity_date,activity_type',
      })

    if (activityError) {
      console.error('Error recording activity:', activityError)
      return false
    }

    // Get current streak data
    let streakData = await getStreakData()

    if (!streakData) {
      // First time user - initialize streak
      const { data: newStreak, error: createError } = await supabase
        .from('study_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          total_study_days: 1,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating streak:', createError)
        return false
      }

      // Award first day badge
      await awardBadge('first_day')

      return true
    }

    // Check if already studied today
    if (streakData.last_activity_date === today) {
      // Already counted for today, no streak update needed
      return true
    }

    // Calculate new streak
    let newStreak = streakData.current_streak
    const lastActivity = streakData.last_activity_date

    if (lastActivity === yesterday ||
        (streakData.streak_frozen_until && streakData.streak_frozen_until >= yesterday)) {
      // Continue streak
      newStreak += 1
    } else if (daysDifference(lastActivity, today) > 1) {
      // Streak broken - check if this is a comeback
      if (streakData.current_streak >= 3) {
        await awardBadge('comeback_kid')
      }
      newStreak = 1
    } else {
      // Same day or first day
      newStreak = 1
    }

    const newLongest = Math.max(newStreak, streakData.longest_streak)
    const newTotalDays = streakData.total_study_days + 1

    // Update streak data
    const { error: updateError } = await supabase
      .from('study_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        total_study_days: newTotalDays,
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating streak:', updateError)
      return false
    }

    // Check for streak milestone badges
    await checkStreakBadges(newStreak)

    return true
  } catch (error) {
    console.error('Error recording study activity:', error)
    return false
  }
}

/**
 * Check and award streak milestone badges
 */
async function checkStreakBadges(currentStreak: number): Promise<void> {
  const milestones = [3, 7, 14, 30, 50, 100, 365]

  for (const milestone of milestones) {
    if (currentStreak === milestone) {
      await awardBadge(`streak_${milestone}`)
    }
  }
}

// ============================================
// DAILY GOALS FUNCTIONS
// ============================================

/**
 * Get today's daily goal
 */
export async function getTodayGoal(): Promise<DailyGoal | null> {
  const userId = getCurrentUserId()
  if (!userId) return null

  const today = getTodayDateString()

  try {
    const { data, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching daily goal:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching daily goal:', error)
    return null
  }
}

/**
 * Create or get today's daily goal
 */
export async function getOrCreateTodayGoal(): Promise<DailyGoal | null> {
  let goal = await getTodayGoal()

  if (!goal) {
    goal = await createDailyGoal()
  }

  return goal
}

/**
 * Create a new daily goal with default values
 */
export async function createDailyGoal(
  customGoals?: Partial<Pick<DailyGoal, 'words_reviewed_goal' | 'minutes_studied_goal' | 'questions_answered_goal'>>
): Promise<DailyGoal | null> {
  const userId = getCurrentUserId()
  if (!userId) return null

  const today = getTodayDateString()

  try {
    const { data, error } = await supabase
      .from('daily_goals')
      .insert({
        user_id: userId,
        goal_date: today,
        words_reviewed_goal: customGoals?.words_reviewed_goal || 10,
        words_reviewed_actual: 0,
        minutes_studied_goal: customGoals?.minutes_studied_goal || 15,
        minutes_studied_actual: 0,
        questions_answered_goal: customGoals?.questions_answered_goal || 5,
        questions_answered_actual: 0,
        goal_completed: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating daily goal:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating daily goal:', error)
    return null
  }
}

/**
 * Update daily goal progress
 */
export async function updateDailyGoalProgress(
  progress: Partial<Pick<DailyGoal, 'words_reviewed_actual' | 'minutes_studied_actual' | 'questions_answered_actual'>>
): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId) return false

  const today = getTodayDateString()

  try {
    // Get or create today's goal
    let goal = await getOrCreateTodayGoal()
    if (!goal) return false

    // Calculate new values (increment, don't replace)
    const newWordsReviewed = goal.words_reviewed_actual + (progress.words_reviewed_actual || 0)
    const newMinutesStudied = goal.minutes_studied_actual + (progress.minutes_studied_actual || 0)
    const newQuestionsAnswered = goal.questions_answered_actual + (progress.questions_answered_actual || 0)

    // Check if goal is now complete
    const goalComplete =
      newWordsReviewed >= goal.words_reviewed_goal &&
      newMinutesStudied >= goal.minutes_studied_goal &&
      newQuestionsAnswered >= goal.questions_answered_goal

    const updateData: any = {
      words_reviewed_actual: newWordsReviewed,
      minutes_studied_actual: newMinutesStudied,
      questions_answered_actual: newQuestionsAnswered,
      goal_completed: goalComplete,
    }

    if (goalComplete && !goal.goal_completed) {
      updateData.completed_at = new Date().toISOString()

      // Check for perfect week badge
      await checkPerfectWeekBadge()
    }

    const { error } = await supabase
      .from('daily_goals')
      .update(updateData)
      .eq('user_id', userId)
      .eq('goal_date', today)

    if (error) {
      console.error('Error updating daily goal:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating daily goal:', error)
    return false
  }
}

/**
 * Get daily goal progress with percentages
 */
export async function getDailyGoalProgress(): Promise<DailyGoalProgress | null> {
  const goal = await getOrCreateTodayGoal()
  if (!goal) return null

  const wordsPercentage = Math.min(100, Math.round((goal.words_reviewed_actual / goal.words_reviewed_goal) * 100))
  const minutesPercentage = Math.min(100, Math.round((goal.minutes_studied_actual / goal.minutes_studied_goal) * 100))
  const questionsPercentage = Math.min(100, Math.round((goal.questions_answered_actual / goal.questions_answered_goal) * 100))

  const overallProgress = Math.round((wordsPercentage + minutesPercentage + questionsPercentage) / 3)

  return {
    date: goal.goal_date,
    wordsReviewed: {
      goal: goal.words_reviewed_goal,
      actual: goal.words_reviewed_actual,
      percentage: wordsPercentage,
    },
    minutesStudied: {
      goal: goal.minutes_studied_goal,
      actual: goal.minutes_studied_actual,
      percentage: minutesPercentage,
    },
    questionsAnswered: {
      goal: goal.questions_answered_goal,
      actual: goal.questions_answered_actual,
      percentage: questionsPercentage,
    },
    overallProgress,
    isComplete: goal.goal_completed,
  }
}

/**
 * Check if user has completed daily goals for 7 days straight
 */
async function checkPerfectWeekBadge(): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) return

  const today = new Date()
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]

  try {
    const { data, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId)
      .gte('goal_date', sevenDaysAgoStr)
      .lte('goal_date', todayStr)
      .eq('goal_completed', true)

    if (error) {
      console.error('Error checking perfect week:', error)
      return
    }

    if (data && data.length >= 7) {
      await awardBadge('perfect_week')
    }
  } catch (error) {
    console.error('Error checking perfect week:', error)
  }
}

// ============================================
// BADGE FUNCTIONS
// ============================================

/**
 * Get all user's badges
 */
export async function getUserBadges(): Promise<Badge[]> {
  const userId = getCurrentUserId()
  if (!userId) return []

  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Error fetching badges:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching badges:', error)
    return []
  }
}

/**
 * Award a badge to the user if they don't already have it
 */
export async function awardBadge(badgeId: string): Promise<boolean> {
  const userId = getCurrentUserId()
  if (!userId) return false

  const badgeDefinition = BADGE_DEFINITIONS[badgeId]
  if (!badgeDefinition) {
    console.error('Unknown badge ID:', badgeId)
    return false
  }

  try {
    // Check if user already has this badge
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single()

    if (existing) {
      // Already has badge
      return false
    }

    // Award the badge
    const { error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        ...badgeDefinition,
      })

    if (error) {
      console.error('Error awarding badge:', error)
      return false
    }

    console.log('🎖️ Badge awarded:', badgeId)
    return true
  } catch (error) {
    console.error('Error awarding badge:', error)
    return false
  }
}

/**
 * Get badges by category
 */
export async function getBadgesByCategory(category: Badge['badge_category']): Promise<Badge[]> {
  const badges = await getUserBadges()
  return badges.filter(badge => badge.badge_category === category)
}

/**
 * Get badge stats
 */
export async function getBadgeStats(): Promise<{
  total: number
  byCategory: Record<Badge['badge_category'], number>
  recentBadges: Badge[]
}> {
  const badges = await getUserBadges()

  const byCategory: Record<Badge['badge_category'], number> = {
    streak: 0,
    words: 0,
    time: 0,
    accuracy: 0,
    milestone: 0,
  }

  badges.forEach(badge => {
    byCategory[badge.badge_category]++
  })

  const recentBadges = badges.slice(0, 5)

  return {
    total: badges.length,
    byCategory,
    recentBadges,
  }
}

// ============================================
// WORDS AND TIME BADGE CHECKING
// ============================================

/**
 * Check and award words badges based on total vocabulary reviews
 * Call this after vocabulary review activities
 */
export async function checkWordsBadges(): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) return

  try {
    // Get total words reviewed from vocabulary_review_history
    const { data, error } = await supabase
      .from('vocabulary_review_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      console.error('Error checking words count:', error)
      return
    }

    const totalWordsReviewed = data || 0

    // Check milestones
    const milestones = [
      { count: 100, badgeId: 'words_100' },
      { count: 500, badgeId: 'words_500' },
      { count: 1000, badgeId: 'words_1000' },
    ]

    for (const milestone of milestones) {
      if (totalWordsReviewed >= milestone.count) {
        await awardBadge(milestone.badgeId)
      }
    }
  } catch (error) {
    console.error('Error checking words badges:', error)
  }
}

/**
 * Check and award time badges based on total study time
 * Call this after any timed study activity
 */
export async function checkTimeBadges(): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) return

  try {
    // Get total minutes studied from daily_goals
    const { data, error } = await supabase
      .from('daily_goals')
      .select('minutes_studied_actual')
      .eq('user_id', userId)

    if (error) {
      console.error('Error checking study time:', error)
      return
    }

    // Calculate total minutes
    const totalMinutes = data?.reduce((sum, goal) => sum + goal.minutes_studied_actual, 0) || 0
    const totalHours = totalMinutes / 60

    // Check milestones
    const milestones = [
      { hours: 10, badgeId: 'time_10h' },
      { hours: 50, badgeId: 'time_50h' },
      { hours: 100, badgeId: 'time_100h' },
    ]

    for (const milestone of milestones) {
      if (totalHours >= milestone.hours) {
        await awardBadge(milestone.badgeId)
      }
    }
  } catch (error) {
    console.error('Error checking time badges:', error)
  }
}
