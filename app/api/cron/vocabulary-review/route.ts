import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { sendNotificationToTokens } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Cron Job API Route for Vocabulary Review Push Notifications
 *
 * This endpoint sends push notifications to users to remind them
 * to review their vocabulary words.
 *
 * Setup: Add to your crontab (crontab -e):
 * 0 18 * * * curl -X POST https://midssat.com/api/cron/vocabulary-review -H "Authorization: Bearer YOUR_CRON_SECRET"
 *
 * Security: This endpoint requires a CRON_SECRET token in the Authorization header
 */

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || token !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid cron secret' },
        { status: 401 }
      )
    }

    // Get all active FCM tokens from database
    const supabase = createClient()
    const { data: tokens, error } = await supabase
      .from('fcm_tokens')
      .select('fcm_token')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching FCM tokens:', error)
      return NextResponse.json(
        { error: 'Failed to fetch device tokens', details: error.message },
        { status: 500 }
      )
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active devices to send notifications to',
        timestamp: new Date().toISOString(),
        deviceCount: 0
      })
    }

    // Extract token strings
    const fcmTokens = tokens.map(t => t.fcm_token)

    // Send push notification to all active devices
    const notification = {
      title: '📚 Time for Vocabulary Review!',
      body: 'Review your vocabulary words to strengthen your memory and ace the SSAT!'
    }

    const data = {
      type: 'vocabulary_review',
      timestamp: new Date().toISOString()
    }

    const response = await sendNotificationToTokens(fcmTokens, notification, data)

    console.log('Vocabulary review cron job executed:', {
      timestamp: new Date().toISOString(),
      totalDevices: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount
    })

    return NextResponse.json({
      success: true,
      message: 'Vocabulary review notifications sent',
      timestamp: new Date().toISOString(),
      stats: {
        totalDevices: tokens.length,
        successCount: response.successCount,
        failureCount: response.failureCount
      }
    })
  } catch (error) {
    console.error('Vocabulary review cron job error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Allow GET for testing purposes
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid cron secret' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    message: 'Vocabulary review cron endpoint is active',
    info: 'Use POST method to trigger vocabulary review notifications',
    timestamp: new Date().toISOString()
  })
}
