import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { sendNotificationToTokens } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

/**
 * Cron endpoint to send vocabulary review notifications
 * Should be called by external cron service (e.g., cron-job.org)
 *
 * Recommended schedule:
 * - Daily summary: Every day at 8:00 AM UTC (adjust per user timezone)
 * - Critical alerts: Every 15 minutes
 *
 * Authentication: Use a secret token in query params or headers
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Simple authentication using secret token
    const authHeader = request.headers.get('authorization')
    const urlToken = request.nextUrl.searchParams.get('token')
    const expectedToken = process.env.CRON_SECRET_TOKEN

    if (!expectedToken) {
      console.error('❌ [Cron] CRON_SECRET_TOKEN not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const providedToken = authHeader?.replace('Bearer ', '') || urlToken

    if (providedToken !== expectedToken) {
      console.warn('⚠️ [Cron] Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔔 [Cron] Starting vocabulary review notifications...')

    const supabase = createClient()
    const now = new Date()

    // Get all words due for review
    const { data: dueWords, error: wordsError } = await supabase
      .from('vocabulary_review_schedule')
      .select('user_id, word, difficulty, next_review_at')
      .lte('next_review_at', now.toISOString())

    if (wordsError) {
      console.error('❌ [Cron] Error fetching due words:', wordsError)
      throw wordsError
    }

    console.log(`📊 [Cron] Found ${dueWords?.length || 0} words due for review`)

    if (!dueWords || dueWords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No words due for review',
        wordsDue: 0,
        notificationsSent: 0
      })
    }

    // Group words by user
    const wordsByUser = dueWords.reduce((acc, word) => {
      if (!acc[word.user_id]) {
        acc[word.user_id] = []
      }
      acc[word.user_id].push(word)
      return acc
    }, {} as Record<string, typeof dueWords>)

    console.log(`👥 [Cron] ${Object.keys(wordsByUser).length} users have words due`)

    // Group by difficulty for priority
    const groupByDifficulty = (words: typeof dueWords) => {
      return words.reduce((acc, word) => {
        const diff = word.difficulty
        if (!acc[diff]) acc[diff] = 0
        acc[diff]++
        return acc
      }, {} as Record<number, number>)
    }

    // Send notifications to each user
    const notifications = await Promise.allSettled(
      Object.entries(wordsByUser).map(async ([userId, words]) => {
        // Get user's FCM tokens
        const { data: tokens, error: tokensError } = await supabase
          .from('fcm_tokens')
          .select('fcm_token')
          .eq('user_id', userId)
          .eq('is_active', true)

        if (tokensError || !tokens || tokens.length === 0) {
          console.log(`⏭️ [Cron] No active tokens for user ${userId.substring(0, 8)}...`)
          return { userId, sent: false, reason: 'no_tokens' }
        }

        const fcmTokens = tokens.map(t => t.fcm_token)
        const wordCount = words.length
        const difficultyBreakdown = groupByDifficulty(words)

        // Determine notification priority based on difficulty
        const hasHardWords = (difficultyBreakdown[3] || 0) > 0 // difficulty 3 = Hard
        const priority = hasHardWords ? 'high' : 'normal'

        // Estimate time (30 seconds per word)
        const estimatedMinutes = Math.ceil((wordCount * 30) / 60)

        // Build notification message
        const title = hasHardWords
          ? `🔥 ${wordCount} vocabulary word${wordCount !== 1 ? 's' : ''} need${wordCount === 1 ? 's' : ''} your attention!`
          : `📚 Time to review ${wordCount} vocabulary word${wordCount !== 1 ? 's' : ''}!`

        const difficultyText = Object.entries(difficultyBreakdown)
          .map(([diff, count]) => {
            const labels = { 0: 'Wait', 1: 'Easy', 2: 'Medium', 3: 'Hard' }
            return `${count} ${labels[diff as any]}`
          })
          .join(', ')

        const body = `${difficultyText} · ~${estimatedMinutes} min`

        try {
          await sendNotificationToTokens(
            fcmTokens,
            { title, body },
            {
              type: 'vocabulary_review',
              wordCount: wordCount.toString(),
              priority,
              click_action: '/vocabulary/word-lists'
            }
          )

          console.log(`✅ [Cron] Sent notification to user ${userId.substring(0, 8)}... (${wordCount} words)`)

          return { userId, sent: true, wordCount }
        } catch (error) {
          console.error(`❌ [Cron] Failed to send to user ${userId.substring(0, 8)}:`, error)
          return { userId, sent: false, reason: 'send_failed', error }
        }
      })
    )

    const successCount = notifications.filter(
      n => n.status === 'fulfilled' && n.value.sent
    ).length

    const duration = Date.now() - startTime

    console.log(`🎉 [Cron] Completed in ${duration}ms`)
    console.log(`📊 [Cron] Results: ${successCount}/${Object.keys(wordsByUser).length} notifications sent`)

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} notifications`,
      wordsDue: dueWords.length,
      usersWithDueWords: Object.keys(wordsByUser).length,
      notificationsSent: successCount,
      duration: `${duration}ms`
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('❌ [Cron] Error in vocabulary review notifications:', error)

    return NextResponse.json(
      {
        error: 'Failed to send notifications',
        details: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`
      },
      { status: 500 }
    )
  }
}
