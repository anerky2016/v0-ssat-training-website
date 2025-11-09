import * as admin from 'firebase-admin';

let app: admin.app.App | undefined;

/**
 * Initialize Firebase Admin SDK
 * This is used for server-side operations like sending push notifications
 */
export function getFirebaseAdmin(): admin.app.App {
  // Check if app is already cached
  if (app) {
    return app;
  }

  // Check if Firebase Admin app already exists (important for Next.js hot reloading)
  // admin.apps is an array of all initialized apps
  const existingApp = admin.apps[0];
  if (existingApp) {
    app = existingApp;
    return app;
  }

  try {
    // Check if service account credentials are provided
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
      // Initialize with service account (production)
      const parsedServiceAccount = JSON.parse(serviceAccount);

      // Fix private key format: replace literal \n with actual newlines
      if (parsedServiceAccount.private_key) {
        parsedServiceAccount.private_key = parsedServiceAccount.private_key.replace(/\\n/g, '\n');
      }

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
  } catch (error: any) {
    // If error is about duplicate app, try to get existing app
    if (error?.code === 'app/duplicate-app') {
      const existingApp = admin.apps[0];
      if (existingApp) {
        app = existingApp;
        return app;
      }
    }
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
  data?: Record<string, string>,
  deviceType?: 'ios' | 'android'
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
    };

    // Only include platform-specific configs for the appropriate device type
    if (deviceType === 'android' || !deviceType) {
      // Default to Android if device type is unknown
      message.android = {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'fcm_default_channel',
        },
      };
    }

    if (deviceType === 'ios') {
      // Note: If you get "Auth error from APNS" errors, you need to configure
      // APNS credentials in Firebase Console: Project Settings > Cloud Messaging > Apple app configuration
      message.apns = {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      };
    }

    const response = await messaging.send(message);
    console.log('✅ Successfully sent notification:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error sending notification:', error);
    
    // Provide helpful error messages for common APNS issues
    if (error?.code === 'messaging/third-party-auth-error' && deviceType === 'ios') {
      const helpfulError = new Error(
        'APNS Authentication Error: Firebase cannot authenticate with Apple Push Notification Service. ' +
        'This usually means:\n' +
        '1. APNS credentials are not configured in Firebase Console\n' +
        '2. APNS key/certificate is invalid or expired\n' +
        '3. APNS credentials don\'t match your app\'s bundle ID\n' +
        '4. Using sandbox token with production credentials (or vice versa)\n\n' +
        'To fix: Go to Firebase Console > Project Settings > Cloud Messaging > ' +
        'Apple app configuration and upload your APNS Authentication Key or Certificate.'
      );
      helpfulError.name = error.name;
      (helpfulError as any).code = error.code;
      (helpfulError as any).errorInfo = error.errorInfo;
      throw helpfulError;
    }
    
    throw error;
  }
}

/**
 * Send notification to multiple device tokens
 * @param tokens - Array of FCM tokens
 * @param notification - Notification content
 * @param data - Optional custom data
 * @param deviceTypes - Optional array of device types corresponding to tokens (ios or android)
 */
export async function sendNotificationToTokens(
  tokens: string[],
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>,
  deviceTypes?: ('ios' | 'android')[]
): Promise<admin.messaging.BatchResponse> {
  try {
    const messaging = getMessaging();

    // Group tokens by device type for more efficient sending
    const iosTokens: string[] = [];
    const androidTokens: string[] = [];
    const unknownTokens: string[] = [];

    tokens.forEach((token, idx) => {
      const deviceType = deviceTypes?.[idx];
      if (deviceType === 'ios') {
        iosTokens.push(token);
      } else if (deviceType === 'android') {
        androidTokens.push(token);
      } else {
        unknownTokens.push(token);
      }
    });

    const allResponses: admin.messaging.SendResponse[] = [];
    const allTokens: string[] = [];

    // Send to iOS devices (with APNS config only)
    // Note: If you get "Auth error from APNS" errors, you need to configure
    // APNS credentials in Firebase Console: Project Settings > Cloud Messaging > Apple app configuration
    if (iosTokens.length > 0) {
      const iosMessage: admin.messaging.MulticastMessage = {
        tokens: iosTokens,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: data || {},
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const iosResponse = await messaging.sendEachForMulticast(iosMessage);
      allResponses.push(...iosResponse.responses);
      allTokens.push(...iosTokens);
    }

    // Send to Android devices (with Android config only)
    if (androidTokens.length > 0) {
      const androidMessage: admin.messaging.MulticastMessage = {
        tokens: androidTokens,
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
      };

      const androidResponse = await messaging.sendEachForMulticast(androidMessage);
      allResponses.push(...androidResponse.responses);
      allTokens.push(...androidTokens);
    }

    // Send to unknown devices (default to Android config)
    if (unknownTokens.length > 0) {
      const unknownMessage: admin.messaging.MulticastMessage = {
        tokens: unknownTokens,
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
      };

      const unknownResponse = await messaging.sendEachForMulticast(unknownMessage);
      allResponses.push(...unknownResponse.responses);
      allTokens.push(...unknownTokens);
    }

    // Combine results
    const successCount = allResponses.filter(r => r.success).length;
    const failureCount = allResponses.filter(r => !r.success).length;

    console.log(`✅ Successfully sent ${successCount} notifications`);

    if (failureCount > 0) {
      console.warn(`⚠️ Failed to send ${failureCount} notifications`);
      allResponses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed for token ${allTokens[idx]}:`, resp.error);
        }
      });
    }

    return {
      successCount,
      failureCount,
      responses: allResponses,
    } as admin.messaging.BatchResponse;
  } catch (error: any) {
    console.error('❌ Error sending batch notifications:', error);
    
    // Provide helpful error messages for common APNS issues
    if (error?.code === 'messaging/third-party-auth-error') {
      const iosCount = tokens.filter((_, idx) => deviceTypes?.[idx] === 'ios').length;
      if (iosCount > 0) {
        const helpfulError = new Error(
          `APNS Authentication Error: Firebase cannot authenticate with Apple Push Notification Service for ${iosCount} iOS device(s). ` +
          'This usually means:\n' +
          '1. APNS credentials are not configured in Firebase Console\n' +
          '2. APNS key/certificate is invalid or expired\n' +
          '3. APNS credentials don\'t match your app\'s bundle ID\n' +
          '4. Using sandbox token with production credentials (or vice versa)\n\n' +
          'To fix: Go to Firebase Console > Project Settings > Cloud Messaging > ' +
          'Apple app configuration and upload your APNS Authentication Key or Certificate.'
        );
        helpfulError.name = error.name;
        (helpfulError as any).code = error.code;
        (helpfulError as any).errorInfo = error.errorInfo;
        throw helpfulError;
      }
    }
    
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
