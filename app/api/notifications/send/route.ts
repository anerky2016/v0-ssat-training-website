import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { sendNotificationToToken, sendNotificationToTokens } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

/**
 * POST /api/notifications/send
 * Send push notifications to users
 *
 * Body:
 * - title: string (required)
 * - body: string (required)
 * - data: object (optional) - custom data to send with notification
 * - userId: string (optional) - send to specific user
 * - userIds: string[] (optional) - send to multiple specific users
 * - deviceType: 'ios' | 'android' (optional) - filter by device type
 * - sendToAll: boolean (optional) - send to all users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, body: notificationBody, data, userId, userIds, deviceType, sendToAll } = body;

    // Validate required fields
    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: 'Missing required fields: title, body' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient();

    // Build query to get FCM tokens
    let query = supabase
      .from('fcm_tokens')
      .select('fcm_token, device_type, user_id')
      .eq('is_active', true);

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      query = query.in('user_id', userIds);
    } else if (!sendToAll) {
      return NextResponse.json(
        { error: 'Must specify userId, userIds, or sendToAll' },
        { status: 400 }
      );
    }

    if (deviceType && ['ios', 'android'].includes(deviceType)) {
      query = query.eq('device_type', deviceType);
    }

    // Get tokens
    const { data: tokens, error: tokensError } = await query;

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      return NextResponse.json(
        { error: 'Failed to fetch device tokens', details: tokensError.message },
        { status: 500 }
      );
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        { error: 'No active device tokens found for the specified criteria' },
        { status: 404 }
      );
    }

    // Prepare notification data
    const notificationData = data || {};
    const fcmTokens = tokens.map((t) => t.fcm_token);

    console.log(`📱 Sending notification to ${fcmTokens.length} devices`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${notificationBody}`);

    // Send notifications
    try {
      if (fcmTokens.length === 1) {
        // Send to single token
        const response = await sendNotificationToToken(
          fcmTokens[0],
          { title, body: notificationBody },
          notificationData
        );

        // Update last_used_at
        await supabase
          .from('fcm_tokens')
          .update({ last_used_at: new Date().toISOString() })
          .eq('fcm_token', fcmTokens[0]);

        return NextResponse.json({
          success: true,
          message: 'Notification sent successfully',
          sentCount: 1,
          totalCount: 1,
          messageId: response,
        });
      } else {
        // Send to multiple tokens
        const response = await sendNotificationToTokens(
          fcmTokens,
          { title, body: notificationBody },
          notificationData
        );

        // Update last_used_at for successful sends
        const successfulTokens = fcmTokens.filter((token, idx) => response.responses[idx].success);

        if (successfulTokens.length > 0) {
          await supabase
            .from('fcm_tokens')
            .update({ last_used_at: new Date().toISOString() })
            .in('fcm_token', successfulTokens);
        }

        // Mark failed tokens as inactive
        const failedTokens = fcmTokens.filter((token, idx) => !response.responses[idx].success);

        if (failedTokens.length > 0) {
          console.warn(`⚠️ Marking ${failedTokens.length} failed tokens as inactive`);
          await supabase
            .from('fcm_tokens')
            .update({ is_active: false })
            .in('fcm_token', failedTokens);
        }

        return NextResponse.json({
          success: true,
          message: 'Notifications sent',
          sentCount: response.successCount,
          failedCount: response.failureCount,
          totalCount: fcmTokens.length,
        });
      }
    } catch (fcmError) {
      console.error('FCM Error:', fcmError);
      return NextResponse.json(
        {
          error: 'Failed to send notification via FCM',
          details: fcmError instanceof Error ? fcmError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send notification endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/send/test
 * Test endpoint to check if FCM is configured properly
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Count active tokens
    const { count, error } = await supabase
      .from('fcm_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch token count', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activeTokensCount: count || 0,
      message: 'FCM notification system is ready',
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
