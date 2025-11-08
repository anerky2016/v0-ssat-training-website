import * as admin from 'firebase-admin';

let app: admin.app.App | undefined;

/**
 * Initialize Firebase Admin SDK
 * This is used for server-side operations like sending push notifications
 */
export function getFirebaseAdmin(): admin.app.App {
  if (app) {
    return app;
  }

  try {
    // Check if service account credentials are provided
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
      // Initialize with service account (production)
      const parsedServiceAccount = JSON.parse(serviceAccount);

      app = admin.initializeApp({
        credential: admin.credential.cert(parsedServiceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });

      console.log('✅ Firebase Admin initialized with service account');
    } else {
      // Initialize with application default credentials (development)
      // This requires GOOGLE_APPLICATION_CREDENTIALS env variable pointing to service account JSON file
      app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });

      console.log('✅ Firebase Admin initialized with application default credentials');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }

  return app;
}

/**
 * Get Firebase Admin Messaging instance
 */
export function getMessaging(): admin.messaging.Messaging {
  const adminApp = getFirebaseAdmin();
  return adminApp.messaging();
}

/**
 * Send notification to a specific device token
 */
export async function sendNotificationToToken(
  token: string,
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>
): Promise<string> {
  try {
    const messaging = getMessaging();

    const message: admin.messaging.Message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'fcm_default_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    console.log('✅ Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
}

/**
 * Send notification to multiple device tokens
 */
export async function sendNotificationToTokens(
  tokens: string[],
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>
): Promise<admin.messaging.BatchResponse> {
  try {
    const messaging = getMessaging();

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'fcm_default_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(`✅ Successfully sent ${response.successCount} notifications`);

    if (response.failureCount > 0) {
      console.warn(`⚠️ Failed to send ${response.failureCount} notifications`);
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed for token ${tokens[idx]}:`, resp.error);
        }
      });
    }

    return response;
  } catch (error) {
    console.error('❌ Error sending batch notifications:', error);
    throw error;
  }
}

/**
 * Send notification to a topic
 */
export async function sendNotificationToTopic(
  topic: string,
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>
): Promise<string> {
  try {
    const messaging = getMessaging();

    const message: admin.messaging.Message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'fcm_default_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    console.log('✅ Successfully sent notification to topic:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification to topic:', error);
    throw error;
  }
}

/**
 * Validate a device token
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const messaging = getMessaging();
    await messaging.send({
      token,
      data: { test: 'true' },
    }, true); // dryRun mode
    return true;
  } catch (error) {
    console.error('❌ Invalid token:', error);
    return false;
  }
}

export default getFirebaseAdmin;
