/**
 * Activity Tracker - Automatically records study activities for streaks and goals
 * Import and call these functions whenever a user completes a learning activity
 */

import { recordStudyActivity, updateDailyGoalProgress } from './streaks'

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
  } catch (error) {
    console.error('Error tracking vocabulary activity:', error)
  }
}
