import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * POST /api/notifications/register-token
 * Register or update an FCM token for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fcmToken, deviceType, deviceName, userId } = body;

    // Validate required fields
    if (!fcmToken || !deviceType) {
      return NextResponse.json(
        { error: 'Missing required fields: fcmToken, deviceType' },
        { status: 400 }
      );
    }

    // Validate device type
    if (!['ios', 'android'].includes(deviceType)) {
      return NextResponse.json(
        { error: 'Invalid device type. Must be "ios" or "android"' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient();

    // Get the authenticated user if userId not provided
    let finalUserId = userId;
    if (!finalUserId) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        // If no authenticated user, still allow registration with null user_id
        // This allows anonymous device registration
        finalUserId = null;
      } else {
        finalUserId = user.id;
      }
    }

    // Check if token already exists
    const { data: existingToken, error: checkError } = await supabase
      .from('fcm_tokens')
      .select('*')
      .eq('fcm_token', fcmToken)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing token:', checkError);
      return NextResponse.json(
        { error: 'Database error', details: checkError.message },
        { status: 500 }
      );
    }

    if (existingToken) {
      // Update existing token
      const { data, error } = await supabase
        .from('fcm_tokens')
        .update({
          device_type: deviceType,
          device_name: deviceName || existingToken.device_name,
          last_used_at: new Date().toISOString(),
          is_active: true,
          user_id: finalUserId || existingToken.user_id,
        })
        .eq('fcm_token', fcmToken)
        .select()
        .single();

      if (error) {
        console.error('Error updating token:', error);
        return NextResponse.json(
          { error: 'Failed to update token', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Token updated successfully',
        data,
      });
    } else {
      // Insert new token
      const { data, error } = await supabase
        .from('fcm_tokens')
        .insert({
          fcm_token: fcmToken,
          device_type: deviceType,
          device_name: deviceName || `${deviceType === 'ios' ? 'iPhone' : 'Android'} Device`,
          user_id: finalUserId,
          is_active: true,
          last_used_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting token:', error);
        return NextResponse.json(
          { error: 'Failed to register token', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Token registered successfully',
        data,
      });
    }
  } catch (error) {
    console.error('Error in register-token endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/register-token
 * Deactivate or delete an FCM token
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { fcmToken } = body;

    if (!fcmToken) {
      return NextResponse.json(
        { error: 'Missing required field: fcmToken' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Soft delete by marking as inactive
    const { data, error } = await supabase
      .from('fcm_tokens')
      .update({ is_active: false })
      .eq('fcm_token', fcmToken)
      .select()
      .single();

    if (error) {
      console.error('Error deactivating token:', error);
      return NextResponse.json(
        { error: 'Failed to deactivate token', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token deactivated successfully',
      data,
    });
  } catch (error) {
    console.error('Error in delete token endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
