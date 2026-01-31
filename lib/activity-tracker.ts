/**
 * Activity Tracker - Automatically records study activities for streaks and goals
 * Import and call these functions whenever a user completes a learning activity
 */

import { recordStudyActivity, updateDailyGoalProgress, checkWordsBadges, checkTimeBadges } from './streaks'

// TypeScript declarations for analytics
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void
    umami?: {
      track: (eventName: string, params?: Record<string, any>) => void
    }
  }
}

/**
 * Send event to Google Analytics 4 and Umami
 */
function trackAnalyticsEvent(
  eventName: string,
  params: Record<string, any> = {}
): void {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      ...params
    })
  }

  // Umami
  if (window.umami) {
    window.umami.track(eventName, params)
  }
}

/**
 * Track vocabulary word review
 * Call this when user reviews vocabulary words (flashcards, word lists, etc.)
 */
export async function trackWordReview(wordCount: number = 1): Promise<void> {
  try {
    // Record activity for streak
    await recordStudyActivity('vocabulary', wordCount)

    // Update daily goal
    await updateDailyGoalProgress({
      words_reviewed_actual: wordCount,
    })

    // Check for words badges
    await checkWordsBadges()

    // Send to analytics
    trackAnalyticsEvent('word_review', {
      word_count: wordCount,
      event_label: 'vocabulary'
    })
  } catch (error) {
    console.error('Error tracking word review:', error)
  }
}

/**
 * Track quiz/question completion
 * Call this when user completes quiz questions
 */
export async function trackQuizCompletion(questionCount: number = 1): Promise<void> {
  try {
    // Record activity for streak
    await recordStudyActivity('quiz', questionCount)

    // Update daily goal
    await updateDailyGoalProgress({
      questions_answered_actual: questionCount,
    })

    // Send to analytics
    trackAnalyticsEvent('quiz_completed', {
      question_count: questionCount,
      event_label: 'quiz'
    })
  } catch (error) {
    console.error('Error tracking quiz completion:', error)
  }
}

/**
 * Track sentence completion
 * Call this when user completes sentence completion exercises
 */
export async function trackSentenceCompletion(questionCount: number = 1): Promise<void> {
  try {
    // Record activity for streak
    await recordStudyActivity('sentence_completion', questionCount)

    // Update daily goal
    await updateDailyGoalProgress({
      questions_answered_actual: questionCount,
    })

    // Send to analytics
    trackAnalyticsEvent('sentence_completion', {
      question_count: questionCount,
      event_label: 'sentence_completion'
    })
  } catch (error) {
    console.error('Error tracking sentence completion:', error)
  }
}

/**
 * Track flashcard session
 * Call this when user completes flashcard review
 */
export async function trackFlashcardSession(cardCount: number = 1): Promise<void> {
  try {
    // Record activity for streak
    await recordStudyActivity('flashcards', cardCount)

    // Update daily goal
    await updateDailyGoalProgress({
      words_reviewed_actual: cardCount,
    })

    // Check for words badges
    await checkWordsBadges()

    // Send to analytics
    trackAnalyticsEvent('flashcard_session', {
      card_count: cardCount,
      event_label: 'flashcards'
    })
  } catch (error) {
    console.error('Error tracking flashcard session:', error)
  }
}

/**
 * Track story reading
 * Call this when user reads a generated story
 */
export async function trackStoryReading(minutesSpent: number = 5): Promise<void> {
  try {
    // Record activity for streak
    await recordStudyActivity('story', 1)

    // Update daily goal (approximate time)
    await updateDailyGoalProgress({
      minutes_studied_actual: minutesSpent,
    })

    // Check for time badges
    await checkTimeBadges()

    // Send to analytics
    trackAnalyticsEvent('story_read', {
      minutes_spent: minutesSpent,
      event_label: 'story'
    })
  } catch (error) {
    console.error('Error tracking story reading:', error)
  }
}

/**
 * Track reading comprehension
 * Call this when user completes reading passages
 */
export async function trackReadingCompletion(minutesSpent: number = 10): Promise<void> {
  try {
    // Record activity for streak
    await recordStudyActivity('reading', 1)

    // Update daily goal
    await updateDailyGoalProgress({
      minutes_studied_actual: minutesSpent,
    })

    // Check for time badges
    await checkTimeBadges()

    // Send to analytics
    trackAnalyticsEvent('reading_completed', {
      minutes_spent: minutesSpent,
      event_label: 'reading'
    })
  } catch (error) {
    console.error('Error tracking reading completion:', error)
  }
}

/**
 * Track general study time
 * Call this for activities that don't fit other categories
 */
export async function trackStudyTime(minutesSpent: number): Promise<void> {
  try {
    // Update daily goal
    await updateDailyGoalProgress({
      minutes_studied_actual: minutesSpent,
    })

    // Check for time badges
    await checkTimeBadges()
  } catch (error) {
    console.error('Error tracking study time:', error)
  }
}

/**
 * Combined tracker for vocabulary activities
 * Tracks both words reviewed and time spent
 */
export async function trackVocabularyActivity(
  wordCount: number,
  minutesSpent: number
): Promise<void> {
  try {
    // Record activity for streak
    await recordStudyActivity('vocabulary', wordCount)

    // Update daily goal
    await updateDailyGoalProgress({
      words_reviewed_actual: wordCount,
      minutes_studied_actual: minutesSpent,
    })

    // Check for words and time badges
    await checkWordsBadges()
    await checkTimeBadges()

    // Send to analytics
    trackAnalyticsEvent('vocabulary_activity', {
      word_count: wordCount,
      minutes_spent: minutesSpent,
      event_label: 'vocabulary'
    })
  } catch (error) {
    console.error('Error tracking vocabulary activity:', error)
  }
}

/**
 * Export trackAnalyticsEvent for use in other components
 */
export { trackAnalyticsEvent }
