/**
 * Client-side FCM Service Utilities
 * Helper functions to interact with push notification APIs from the frontend
 */

export interface SendNotificationParams {
  title: string;
  body: string;
  data?: Record<string, string>;
  userId?: string;
  userIds?: string[];
  deviceType?: 'ios' | 'android';
  sendToAll?: boolean;
}

export interface SendNotificationResponse {
  success: boolean;
  message: string;
  sentCount?: number;
  failedCount?: number;
  totalCount?: number;
  messageId?: string;
  error?: string;
}

/**
 * Send push notification to users
 */
export async function sendPushNotification(
  params: SendNotificationParams
): Promise<SendNotificationResponse> {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send notification');
    }

    return data;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      message: 'Failed to send notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send notification to a specific user
 */
export async function sendNotificationToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<SendNotificationResponse> {
  return sendPushNotification({
    title,
    body,
    data,
    userId,
  });
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToUsers(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<SendNotificationResponse> {
  return sendPushNotification({
    title,
    body,
    data,
    userIds,
  });
}

/**
 * Send notification to all users
 */
export async function sendNotificationToAll(
  title: string,
  body: string,
  data?: Record<string, string>,
  deviceType?: 'ios' | 'android'
): Promise<SendNotificationResponse> {
  return sendPushNotification({
    title,
    body,
    data,
    sendToAll: true,
    deviceType,
  });
}

/**
 * Get count of active device tokens
 */
export async function getActiveTokenCount(): Promise<number> {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch token count');
    }

    const data = await response.json();
    return data.activeTokensCount || 0;
  } catch (error) {
    console.error('Error fetching active token count:', error);
    return 0;
  }
}

/**
 * Predefined notification templates
 */
export const NotificationTemplates = {
  newLesson: (lessonTitle: string) => ({
    title: 'New Lesson Available!',
    body: `Check out "${lessonTitle}" in your SSAT training`,
    data: { type: 'new_lesson', route: '/lessons' },
  }),

  dailyChallenge: () => ({
    title: 'Daily Challenge',
    body: "Complete today's practice test and improve your score!",
    data: { type: 'daily_challenge', route: '/practice' },
  }),

  studyReminder: () => ({
    title: 'Time to Study!',
    body: 'Keep up your momentum and practice your SSAT skills',
    data: { type: 'study_reminder', route: '/' },
  }),

  streakMilestone: (days: number) => ({
    title: `${days} Day Streak! 🔥`,
    body: `Amazing! You've studied for ${days} days in a row!`,
    data: { type: 'streak_milestone', route: '/progress' },
  }),

  reviewReminder: (count: number) => ({
    title: 'Review Ready',
    body: `${count} lesson${count > 1 ? 's' : ''} ${count > 1 ? 'are' : 'is'} ready for review`,
    data: { type: 'review_reminder', route: '/progress' },
  }),

  achievement: (title: string) => ({
    title: 'Achievement Unlocked! 🏆',
    body: `You've earned: ${title}`,
    data: { type: 'achievement', route: '/profile' },
  }),

  testReminder: (testName: string, daysUntil: number) => ({
    title: 'Test Reminder',
    body: `${testName} is ${daysUntil} day${daysUntil > 1 ? 's' : ''} away. Keep practicing!`,
    data: { type: 'test_reminder', route: '/practice' },
  }),

  welcomeBack: (name: string) => ({
    title: `Welcome back, ${name}!`,
    body: "We've missed you! Continue your SSAT preparation",
    data: { type: 'welcome_back', route: '/' },
  }),
};

/**
 * Send a templated notification to a user
 */
export async function sendTemplatedNotification(
  userId: string,
  template: ReturnType<typeof NotificationTemplates[keyof typeof NotificationTemplates]>
): Promise<SendNotificationResponse> {
  return sendNotificationToUser(userId, template.title, template.body, template.data);
}

/**
 * Send a templated notification to all users
 */
export async function sendTemplatedNotificationToAll(
  template: ReturnType<typeof NotificationTemplates[keyof typeof NotificationTemplates]>,
  deviceType?: 'ios' | 'android'
): Promise<SendNotificationResponse> {
  return sendNotificationToAll(template.title, template.body, template.data, deviceType);
}

/**
 * Example usage in a component:
 *
 * import { sendPushNotification, NotificationTemplates } from '@/lib/fcm-client-service'
 *
 * // Send to specific user
 * await sendNotificationToUser(
 *   'user-id-123',
 *   'Hello!',
 *   'This is a test notification'
 * )
 *
 * // Send to all users
 * await sendNotificationToAll(
 *   'New Feature!',
 *   'Check out our latest update'
 * )
 *
 * // Use a template
 * await sendTemplatedNotificationToAll(
 *   NotificationTemplates.dailyChallenge()
 * )
 */
