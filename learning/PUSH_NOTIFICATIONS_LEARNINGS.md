# Push Notification Implementation: Complete Guide & Learnings

This document captures key learnings, mistakes, and best practices from implementing push notifications for the SSAT Training app using Firebase Cloud Messaging (FCM) and Apple Push Notification service (APNs).

---

## Table of Contents
1. [Push Notification Architecture](#1-push-notification-architecture-firebase-cloud-messaging)
2. [APNs (Apple Push Notification Service) Setup](#2-apns-apple-push-notification-service-setup)
3. [Debugging Approaches & Tools](#3-debugging-approaches--tools)
4. [Common Mistakes & How to Avoid Them](#4-common-mistakes--how-to-avoid-them)
5. [Best Practices Learned](#5-best-practices-learned)
6. [Final Architecture](#6-final-architecture)
7. [Key Takeaways](#7-key-takeaways)
8. [Implementation Checklist](#8-checklist-for-future-push-notification-setup)

---

## 1. Push Notification Architecture (Firebase Cloud Messaging)

### Core Components

- **Firebase Cloud Messaging (FCM)** - Cross-platform notification service that handles both iOS (via APNs) and Android notifications
- **FCM Tokens** - Unique device identifiers stored in database (`fcm_tokens` table in Supabase)
- **Firebase Admin SDK** - Server-side SDK for sending notifications from your website backend

### Implementation Flow

```
Website Backend (Next.js API)
    ↓
Firebase Admin SDK
    ↓
Firebase Cloud Messaging
    ↓
    ├─→ APNs (iOS devices)
    └─→ FCM (Android devices)
    ↓
Flutter App receives notification
```

### Key Setup Steps

#### 1. Flutter App Side

**Dependencies:**
```yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.9
```

**Initialization:**
```dart
// main.dart
await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);

// Request permissions
final messaging = FirebaseMessaging.instance;
final settings = await messaging.requestPermission(
  alert: true,
  badge: true,
  sound: true,
);

// Get token
final token = await messaging.getToken();
// Send token to backend
```

**Handle notifications in different states:**
- **Foreground**: App is open and visible
- **Background**: App is running but not visible
- **Terminated**: App is completely closed

#### 2. Website Backend Side

**Firebase Admin SDK Setup:**
```typescript
import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
```

**API Endpoints:**
- `/api/register-fcm-token` - Store device tokens
- `/api/send-notification` - Send manual notifications
- `/api/cron/vocabulary-review` - Scheduled notifications

#### 3. Database (Supabase)

**FCM Tokens Table:**
```sql
CREATE TABLE fcm_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL UNIQUE,
  device_type TEXT CHECK (device_type IN ('ios', 'android')),
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Row Level Security (RLS):**
```sql
-- Users can only see their own tokens
CREATE POLICY "Users can view own tokens"
  ON fcm_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tokens
CREATE POLICY "Users can insert own tokens"
  ON fcm_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can access all tokens (for cron jobs)
CREATE POLICY "Service role can access all tokens"
  ON fcm_tokens FOR ALL
  USING (auth.role() = 'service_role');
```

---

## 2. APNs (Apple Push Notification Service) Setup

### Critical APNs Concepts

#### APNs Authentication Key (.p8) vs SSL Certificates

| Approach | Type | Expiration | Recommended |
|----------|------|------------|-------------|
| **APNs Authentication Key (.p8)** | Token-based | Never expires | ✅ **Use this** |
| APNs SSL Certificate | Certificate-based | Expires yearly | ❌ Legacy |

**Why .p8 is better:**
- Never expires
- Easier to set up
- Can be reused across multiple apps
- More secure (token-based)

### APNs Environment: Sandbox vs Production

**⚠️ CRITICAL LEARNING: TestFlight uses PRODUCTION, not Sandbox!**

| Environment | Used For | FCM Token Type |
|-------------|----------|----------------|
| **Sandbox** | Debug builds from Xcode, Simulator | Sandbox tokens |
| **Production** | **TestFlight**, App Store releases | Production tokens |

**Common Mistake:**
- Testing with TestFlight but only configuring Sandbox APNs ❌
- Sandbox tokens and Production tokens are **incompatible**
- Must configure Production APNs to work with TestFlight ✅

### APNs Setup Steps

#### Step 1: Apple Developer Portal

1. **Create/Edit App ID:**
   - Go to: Certificates, Identifiers & Profiles → Identifiers
   - Bundle ID: Must match exactly (e.g., `WordyWise` or `com.yourcompany.appname`)
   - Enable: Push Notifications capability

2. **Create APNs Authentication Key:**
   - Go to: Certificates, Identifiers & Profiles → Keys
   - Click: "+" to create new key
   - Name: "Push Notification Key" (or similar)
   - Enable: Apple Push Notifications service (APNs)
   - Download: `.p8` file (⚠️ **Can only download once!**)
   - Note: **Key ID** (e.g., `ABC123XYZ`)
   - Note: **Team ID** (found in membership details)

#### Step 2: Firebase Console

1. **Upload APNs Key:**
   - Go to: Project Settings → Cloud Messaging
   - Scroll to: "Apple app configuration"
   - Click: "Upload APNs Authentication Key"
   - Upload: `.p8` file
   - Enter: Team ID (10 characters)
   - Enter: Key ID (10 characters)

2. **Verify Bundle ID:**
   - Make sure the iOS app in Firebase has correct Bundle ID
   - Should match: Apple Developer Portal App ID
   - Should match: Xcode project Bundle ID

#### Step 3: iOS App Configuration

**Xcode Project (`project.pbxproj`):**
```
PRODUCT_BUNDLE_IDENTIFIER = WordyWise;
```

**GoogleService-Info.plist:**
```xml
<key>BUNDLE_ID</key>
<string>WordyWise</string>
```

**Xcode Capabilities:**
- Go to: Target → Signing & Capabilities
- Add: Push Notifications capability
- Ensure: Correct Team and Bundle ID selected

### Common APNs Errors

#### Error 1: `messaging/third-party-auth-error`

```
Error Code: messaging/third-party-auth-error
Error Message: Auth error from APNS or Web Push Service
```

**Possible Causes:**
1. ❌ APNs Authentication Key not uploaded to Firebase Console
2. ❌ APNs key invalid or expired (if using certificate, not .p8)
3. ❌ Bundle ID mismatch between Firebase and iOS app
4. ❌ Team ID or Key ID incorrect in Firebase
5. ❌ Using sandbox token with production credentials (or vice versa)
6. ❌ Wrong environment (Testing on TestFlight with only Sandbox configured)

**How to Fix:**
1. ✅ Go to Firebase Console → Cloud Messaging → Apple app configuration
2. ✅ Verify APNs Authentication Key (.p8) is uploaded
3. ✅ Check Team ID matches your Apple Developer account
4. ✅ Check Key ID matches the .p8 file
5. ✅ Verify Bundle ID in Firebase matches iOS app exactly
6. ✅ If testing on TestFlight, ensure Production APNs is configured

#### Error 2: `app/invalid-credential`

```
Error Code: app/invalid-credential
Error Message: getaddrinfo ENOTFOUND metadata.google.internal
```

**Cause:**
Firebase Admin SDK trying to use Application Default Credentials (looking for Google Cloud metadata server) instead of service account JSON.

**How to Fix:**
Add `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable to your production server:

```bash
# .env.local (production server)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id",...}'
```

**Important:**
- The private key has literal `\n` that need to be replaced:
  ```typescript
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  ```

---

## 3. Debugging Approaches & Tools

### Effective Logging Strategy

#### 1. Device-Level Logging

```typescript
console.log(`📱 [FCM] Found ${tokens.length} active devices in database:`)
tokens.forEach((token, idx) => {
  const tokenPreview = `${token.fcm_token.substring(0, 15)}...${token.fcm_token.substring(token.fcm_token.length - 10)}`
  console.log(`   ${idx + 1}. ${token.device_type?.toUpperCase() || 'UNKNOWN'} - ${token.device_name || 'Unknown Device'} - Token: ${tokenPreview}`)
})
```

**Output:**
```
📱 [FCM] Found 2 active devices in database:
   1. IOS - iPhone 15 Pro - Token: eF3kJ9mN2pQ5r...8tUvWxYz01
   2. ANDROID - Pixel 7 - Token: aB1cD2eF3gH4i...5jK6lM7nO8
```

#### 2. Platform-Specific Tracking

```typescript
const iosTokens: string[] = []
const androidTokens: string[] = []

tokens.forEach((token, idx) => {
  const deviceType = deviceTypes?.[idx]
  if (deviceType === 'ios') {
    iosTokens.push(token)
  } else if (deviceType === 'android') {
    androidTokens.push(token)
  }
})

console.log(`📊 [FCM] Sending notifications to ${tokens.length} devices:`)
console.log(`   📱 iOS: ${iosTokens.length} devices`)
console.log(`   🤖 Android: ${androidTokens.length} devices`)
```

#### 3. Individual Failure Analysis

```typescript
allResponses.forEach((resp, idx) => {
  if (!resp.success) {
    const token = allTokens[idx]
    const deviceType = deviceTypes?.[idx] || 'unknown'
    const tokenPreview = `${token.substring(0, 20)}...${token.substring(token.length - 10)}`

    console.error(`\n❌ [FCM] Failed notification #${idx + 1}:`)
    console.error(`   Device: ${deviceType}`)
    console.error(`   Token: ${tokenPreview}`)
    console.error(`   Error Code: ${resp.error?.code}`)
    console.error(`   Error Message: ${resp.error?.message}`)

    if (resp.error?.code === 'messaging/third-party-auth-error') {
      console.error(`\n   🔍 APNs Authentication Error Details:`)
      console.error(`   - This is an iOS-specific error`)
      console.error(`   - Firebase cannot authenticate with Apple Push Notification service`)
      console.error(`   - Check Firebase Console > Cloud Messaging > Apple app configuration`)
      console.error(`   - Verify APNs Authentication Key (.p8) is uploaded`)
      console.error(`   - Verify Team ID and Key ID match your Apple Developer account`)
      console.error(`   - Verify Bundle ID in Firebase matches your iOS app: "WordyWise"`)
    }

    console.error(`   Full Error:`, JSON.stringify(resp.error, null, 2))
  }
})
```

### PM2 Cron Job Debugging

#### Initial Problem

```
❌ Failed to parse response: Unexpected token < in JSON at position 0
```

**Cause:** Cron job was receiving HTML instead of JSON (likely a 404 or error page)

#### Debugging Steps

1. **Check endpoint existence:**
   ```bash
   curl -X POST https://midssat.com/api/cron/vocabulary-review \
     -H "Authorization: Bearer YOUR_SECRET"
   ```

2. **Verify authentication:**
   ```typescript
   const authHeader = request.headers.get('authorization')
   const token = authHeader?.replace('Bearer ', '')
   console.log('Auth token received:', token ? 'YES' : 'NO')
   ```

3. **Check PM2 logs:**
   ```bash
   pm2 logs vocabulary-review-cron
   ```

4. **Verify environment variables:**
   ```bash
   pm2 env vocabulary-review-cron | grep CRON_SECRET
   ```

#### Solution

Created dedicated cron endpoint with proper error handling:

```typescript
// app/api/cron/vocabulary-review/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || token !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid cron secret' },
        { status: 401 }
      )
    }

    // ... send notifications ...

    return NextResponse.json({
      success: true,
      message: 'Notifications sent',
      stats: { /* ... */ }
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
```

### Testing Tools

#### 1. Manual curl Testing

```bash
# Test cron endpoint
curl -X POST https://midssat.com/api/cron/vocabulary-review \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json"

# Expected response
{
  "success": true,
  "message": "Vocabulary review notifications sent",
  "timestamp": "2025-01-10T18:00:00.000Z",
  "stats": {
    "totalDevices": 2,
    "successCount": 2,
    "failureCount": 0
  }
}
```

#### 2. Firebase Console Testing

1. Go to: Firebase Console → Cloud Messaging
2. Click: "Send test message"
3. Enter: Device FCM token
4. Send: Test notification

**Useful for:**
- Verifying APNs connectivity
- Testing token validity
- Isolating Firebase vs app issues

#### 3. PM2 Process Manager

```bash
# View logs
pm2 logs vocabulary-review-cron

# Restart cron job
pm2 restart vocabulary-review-cron

# Check status
pm2 list

# View environment variables
pm2 env vocabulary-review-cron
```

---

## 4. Common Mistakes & How to Avoid Them

### Mistake 1: Environment Variable Confusion

**What Happened:**
Multiple similar environment variable names caused confusion:
- `CRON_SECRET` vs `CRON_SECRET_TOKEN`
- Not clear which one to use where

**Learning:**
✅ Use consistent naming conventions across the project
✅ Document all environment variables in one place
✅ Create `.env.example` file as reference:

```bash
# .env.example

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Cron Job Authentication
CRON_SECRET=your-secret-token-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Mistake 2: Bundle ID Inconsistency

**What Happened:**
Bundle ID was different in multiple places:
- `WordyWise` in one place
- `com.w954yfm2j5.ssattraining` in another
- `com.ssattraining.ssattrainingapp` in yet another

**Why It Failed:**
APNs uses Bundle ID to route notifications. If Firebase has Bundle ID "A" but iOS app has Bundle ID "B", notifications fail with `messaging/third-party-auth-error`.

**Learning:**
✅ Bundle ID must be **EXACTLY THE SAME** everywhere:
1. Apple Developer Portal (App ID)
2. Firebase Console (iOS app configuration)
3. Xcode project (`PRODUCT_BUNDLE_IDENTIFIER` in `project.pbxproj`)
4. `GoogleService-Info.plist` (`BUNDLE_ID` key)

**Verification Checklist:**
```bash
# Check Xcode project
grep -r "PRODUCT_BUNDLE_IDENTIFIER" ios/Runner.xcodeproj/project.pbxproj

# Check GoogleService-Info.plist
grep -A1 "BUNDLE_ID" ios/Runner/GoogleService-Info.plist

# Should all show: WordyWise (or your consistent Bundle ID)
```

### Mistake 3: TestFlight = Production Environment

**What Happened:**
Assumed TestFlight was a "testing" environment, so only configured Sandbox APNs.

**Reality:**
- **TestFlight apps use PRODUCTION APNs** ✅
- Sandbox is ONLY for debug builds from Xcode ✅

**Learning:**

| Build Type | APNs Environment | How to Configure |
|------------|------------------|------------------|
| Xcode Debug Build | Sandbox | Usually automatic, or upload Sandbox certificate |
| Xcode Release Build | Production | Upload Production APNs key to Firebase |
| TestFlight | **Production** ⚠️ | Upload Production APNs key to Firebase |
| App Store | Production | Upload Production APNs key to Firebase |

**To test production APNs:**
1. Upload APNs Authentication Key (.p8) to Firebase Console
2. Build and upload to TestFlight
3. Install TestFlight build on device
4. Send test notification

### Mistake 4: Firebase Admin Credentials Not Set

**What Happened:**
Deployed to production server but forgot to set `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable.

**Error:**
```
Error Code: app/invalid-credential
Error Message: getaddrinfo ENOTFOUND metadata.google.internal
```

**Why It Happened:**
Firebase Admin SDK has two initialization methods:

1. **Application Default Credentials** (Development):
   ```typescript
   admin.initializeApp({
     credential: admin.credential.applicationDefault(),
   });
   ```
   - Looks for `GOOGLE_APPLICATION_CREDENTIALS` env var pointing to JSON file
   - Or tries to contact Google Cloud metadata server (only works on GCP)

2. **Service Account JSON** (Production):
   ```typescript
   const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
   });
   ```
   - Uses service account JSON directly
   - Works anywhere (production servers, serverless, etc.)

**Learning:**
✅ **Always use service account JSON for production**
✅ Add to production server's `.env.local`:
```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...",...}'
```
✅ Verify credentials are loaded at startup (add logging)

### Mistake 5: Next.js Static Rendering Issues

**What Happened:**
API routes tried to statically render at build time, causing errors.

**Error:**
```
Error: Dynamic server usage: Route /api/cron/vocabulary-review-notifications
couldn't be rendered statically because it used `request.headers`
```

**Why It Happened:**
Next.js 13+ tries to statically render routes when possible. API routes that use:
- `request.headers`
- `request.cookies`
- `request.nextUrl.searchParams`

...cannot be statically rendered.

**Learning:**
✅ **Always add to API routes using dynamic features:**

```typescript
// At the top of your API route file
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Now safe to use request.headers, etc.
}
```

### Mistake 6: Not Separating iOS/Android Notifications

**What Happened:**
Sent the same notification configuration to all devices, causing APNs errors for Android tokens (and vice versa).

**Why It Failed:**
- iOS requires `apns` configuration
- Android requires `android` configuration
- Sending both to all devices causes errors

**Learning:**
✅ **Group tokens by device type:**

```typescript
const iosTokens: string[] = []
const androidTokens: string[] = []
const unknownTokens: string[] = []

tokens.forEach((token, idx) => {
  const deviceType = deviceTypes?.[idx]
  if (deviceType === 'ios') {
    iosTokens.push(token)
  } else if (deviceType === 'android') {
    androidTokens.push(token)
  } else {
    unknownTokens.push(token)
  }
})
```

✅ **Send platform-specific configs:**

```typescript
// Send to iOS devices (APNS config only)
if (iosTokens.length > 0) {
  const iosMessage: admin.messaging.MulticastMessage = {
    tokens: iosTokens,
    notification: { title, body },
    data: data || {},
    apns: {  // ← iOS-specific
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  }
  await messaging.sendEachForMulticast(iosMessage)
}

// Send to Android devices (Android config only)
if (androidTokens.length > 0) {
  const androidMessage: admin.messaging.MulticastMessage = {
    tokens: androidTokens,
    notification: { title, body },
    data: data || {},
    android: {  // ← Android-specific
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'fcm_default_channel',
      },
    },
  }
  await messaging.sendEachForMulticast(androidMessage)
}
```

### Mistake 7: Token Preview Logging Issues

**What Happened:**
Initially showed full tokens in logs (security risk) or broke on short tokens.

**Why It's a Problem:**
- Full tokens in logs = security risk (if logs are compromised)
- Logging short tokens with substring() can crash if token is too short

**Learning:**
✅ **Show token preview for debugging:**

```typescript
const tokenPreview = token.length > 30
  ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}`
  : `${token.substring(0, 10)}...`

console.log(`Token: ${tokenPreview}`)
```

**Benefits:**
- Enough to identify tokens for debugging
- Doesn't expose full token in logs
- Safe even for short tokens

### Mistake 8: Cron Script Path Assumptions

**What Happened:**
Documentation used `/home/ubuntu` paths but actual server used `/root`.

**Why It's a Problem:**
- Hardcoded paths break on different server setups
- Makes documentation less useful

**Learning:**
✅ **Use environment variables or detect paths:**

```javascript
// Use environment variable
const PROJECT_PATH = process.env.PROJECT_PATH || '/root/v0-ssat-training-website'

// Or detect user home directory
const os = require('os')
const PROJECT_PATH = `${os.homedir()}/v0-ssat-training-website`
```

✅ **Document actual deployment paths:**

```markdown
# PM2 Cron Setup

**Note:** Adjust paths based on your server setup:
- Ubuntu server: `/home/ubuntu/...`
- Root user: `/root/...`
- Custom: Set PROJECT_PATH environment variable
```

---

## 5. Best Practices Learned

### Security

1. **Never Commit Credentials:**
   ```bash
   # .gitignore
   .env.local
   .env.production
   firebase-service-account.json
   *.p8
   ```

2. **Use Bearer Tokens for Cron:**
   ```typescript
   // ✅ Good: Authorization header
   const token = request.headers.get('authorization')?.replace('Bearer ', '')

   // ❌ Bad: Query parameter (exposed in URLs, logs)
   const token = request.nextUrl.searchParams.get('token')
   ```

3. **Validate All Inputs:**
   ```typescript
   if (!token || token !== process.env.CRON_SECRET) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }
   ```

4. **Row Level Security (RLS):**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

   -- Users can only access their own data
   CREATE POLICY "Users own data" ON fcm_tokens
     FOR ALL USING (auth.uid() = user_id);
   ```

### Architecture

1. **Store Device Metadata:**
   ```sql
   CREATE TABLE fcm_tokens (
     -- ... other fields ...
     device_type TEXT,      -- 'ios' or 'android'
     device_name TEXT,      -- 'iPhone 15 Pro'
     device_model TEXT,     -- 'iPhone15,2'
     app_version TEXT,      -- '1.0.0'
     os_version TEXT,       -- 'iOS 17.2'
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );
   ```
   **Benefits:**
   - Better debugging (know which device failed)
   - Analytics (which devices/versions are used)
   - Targeted notifications (only iOS 17+, etc.)

2. **Soft Delete Tokens:**
   ```typescript
   // ❌ Don't delete tokens
   await supabase.from('fcm_tokens').delete().eq('fcm_token', oldToken)

   // ✅ Soft delete (mark as inactive)
   await supabase.from('fcm_tokens').update({ is_active: false }).eq('fcm_token', oldToken)
   ```
   **Benefits:**
   - Keep history for analytics
   - Can reactivate if user reinstalls
   - Helps debug token issues

3. **Handle Token Refresh:**
   ```typescript
   // FCM tokens can change, handle updates
   const { error } = await supabase
     .from('fcm_tokens')
     .upsert({
       user_id: userId,
       fcm_token: newToken,
       device_type: deviceType,
       is_active: true,
       updated_at: new Date().toISOString()
     }, {
       onConflict: 'fcm_token',
       ignoreDuplicates: false
     })
   ```

4. **Platform Separation:**
   ```typescript
   // Send iOS and Android notifications separately
   // This prevents cross-platform errors and allows platform-specific configs
   const iosTokens = tokens.filter((_, idx) => deviceTypes[idx] === 'ios')
   const androidTokens = tokens.filter((_, idx) => deviceTypes[idx] === 'android')
   ```

### Error Handling

1. **Batch Operations:**
   ```typescript
   // ✅ Use sendEachForMulticast for multiple devices
   const response = await messaging.sendEachForMulticast({
     tokens: fcmTokens,
     notification: { title, body },
     data: { /* ... */ }
   })

   // ❌ Don't loop and send individually (slower, harder to track)
   for (const token of fcmTokens) {
     await messaging.send({ token, notification })
   }
   ```

2. **Track Success/Failure:**
   ```typescript
   const successCount = response.responses.filter(r => r.success).length
   const failureCount = response.responses.filter(r => !r.success).length

   console.log(`✅ ${successCount} sent, ❌ ${failureCount} failed`)

   return { successCount, failureCount, responses: response.responses }
   ```

3. **Graceful Degradation:**
   ```typescript
   // Continue if some notifications fail
   const notifications = await Promise.allSettled(
     users.map(user => sendNotificationToUser(user))
   )

   const successful = notifications.filter(n => n.status === 'fulfilled')
   const failed = notifications.filter(n => n.status === 'rejected')
   ```

4. **Helpful Error Messages:**
   ```typescript
   if (error.code === 'messaging/third-party-auth-error') {
     throw new Error(
       'APNs Authentication Error: ' +
       'Firebase cannot authenticate with Apple Push Notification Service. ' +
       'Go to Firebase Console > Project Settings > Cloud Messaging > ' +
       'Apple app configuration and upload your APNs Authentication Key.'
     )
   }
   ```

### Deployment

1. **Test Locally First:**
   ```bash
   # Use development credentials locally
   cp .env.example .env.local
   # Edit .env.local with dev credentials
   npm run dev
   ```

2. **Verify Production Env Vars:**
   ```bash
   # Before deploying, check all required env vars are set
   ssh root@server 'cd /root/project && cat .env.local | grep FIREBASE_SERVICE_ACCOUNT_KEY'
   ```

3. **Monitor Logs:**
   ```bash
   # PM2 logs
   pm2 logs midssat
   pm2 logs vocabulary-review-cron

   # Firebase Console
   # Go to: Firebase Console → Cloud Messaging → Reports

   # Check for errors
   pm2 logs --err
   ```

4. **Gradual Rollout:**
   - Test with 1 device first
   - Then test with small group (5-10 users)
   - Monitor for 24 hours
   - Roll out to all users

---

## 6. Final Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NOTIFICATION SYSTEM                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ 1. DEVICE REGISTRATION                                                │
└──────────────────────────────────────────────────────────────────────┘

Flutter App (iOS/Android)
    │
    │ 1. Initialize Firebase
    │ 2. Request notification permissions
    │ 3. Get FCM token
    │
    ▼
POST /api/register-fcm-token
{
  user_id: "uuid",
  fcm_token: "...",
  device_type: "ios",
  device_name: "iPhone 15 Pro"
}
    │
    ▼
Supabase (fcm_tokens table)
┌─────────────────────────────────┐
│ id        │ user_id  │ fcm_token│
│ device_type│ is_active│ ...     │
└─────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ 2. SCHEDULED NOTIFICATIONS (PM2 Cron)                                 │
└──────────────────────────────────────────────────────────────────────┘

PM2 Cron Job (daily at 6:00 PM)
    │
    │ POST /api/cron/vocabulary-review
    │ Header: Authorization: Bearer <CRON_SECRET>
    │
    ▼
Next.js API Route
    │
    │ 1. Verify CRON_SECRET
    │ 2. Query active FCM tokens from Supabase
    │
    ▼
SELECT * FROM fcm_tokens WHERE is_active = true
    │
    │ Returns: [
    │   { fcm_token: "...", device_type: "ios", ... },
    │   { fcm_token: "...", device_type: "android", ... }
    │ ]
    │
    ▼
Group by device type:
    ├─→ iOS tokens
    │   └─→ Send with APNS config
    │
    └─→ Android tokens
        └─→ Send with Android config
    │
    ▼
Firebase Admin SDK
    │
    │ messaging.sendEachForMulticast()
    │
    ▼
Firebase Cloud Messaging (FCM)
    │
    ├─────────────────────┬─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
APNs (iOS)          FCM (Android)       [Failure Handling]
    │                     │                     │
    ▼                     ▼                     │
iOS Device          Android Device            │
receives            receives                   │
notification        notification               │
                                                │
                                                ▼
                                        Log errors:
                                        - Invalid tokens
                                        - APNs auth errors
                                        - Network errors

┌──────────────────────────────────────────────────────────────────────┐
│ 3. MANUAL NOTIFICATIONS                                               │
└──────────────────────────────────────────────────────────────────────┘

Admin UI / API Call
    │
    │ POST /api/send-notification
    │ {
    │   user_ids: [...],
    │   title: "...",
    │   body: "..."
    │ }
    │
    ▼
Get FCM tokens for user_ids
    │
    ▼
Firebase Admin SDK → FCM → Devices

┌──────────────────────────────────────────────────────────────────────┐
│ 4. ERROR HANDLING & MONITORING                                        │
└──────────────────────────────────────────────────────────────────────┘

Notification sent
    │
    ├─→ Success
    │   └─→ Log success count
    │   └─→ Update stats
    │
    └─→ Failure
        │
        ├─→ Invalid token
        │   └─→ Mark token as inactive
        │
        ├─→ APNs auth error
        │   └─→ Log error with troubleshooting guide
        │   └─→ Alert admin
        │
        └─→ Network error
            └─→ Retry with exponential backoff
```

---

## 7. Key Takeaways

### 🎯 Top 10 Critical Learnings

1. **APNs Authentication Key (.p8) is the modern approach**
   - Never expires
   - Token-based authentication
   - More secure than certificates

2. **TestFlight = Production APNs, NOT Sandbox**
   - This caused hours of debugging!
   - Sandbox is ONLY for debug builds from Xcode
   - Configure Production APNs to work with TestFlight

3. **Bundle ID must be consistent everywhere**
   - Apple Developer Portal
   - Firebase Console
   - Xcode project
   - GoogleService-Info.plist
   - Even one mismatch = notifications fail

4. **Detailed logging saved hours of debugging**
   - Log device types, token previews, error codes
   - Include troubleshooting tips in error messages
   - Log success/failure counts

5. **Separate iOS and Android notification configs**
   - Group tokens by device type
   - Send platform-specific configurations
   - Prevents cross-platform errors

6. **Environment variables must be set on production**
   - `FIREBASE_SERVICE_ACCOUNT_KEY` is required
   - Missing env vars cause cryptic errors
   - Verify env vars before deploying

7. **PM2 cron is simpler than Vercel cron for self-hosted**
   - Full control over schedule
   - Easier debugging (PM2 logs)
   - No cold starts

8. **Store device metadata for better debugging**
   - Device type, name, model, OS version
   - Helps identify which devices have issues
   - Enables targeted notifications

9. **Use soft delete for tokens (is_active flag)**
   - Keep history for analytics
   - Can reactivate if user reinstalls
   - Helps debug token issues

10. **Always add `export const dynamic = 'force-dynamic'` to API routes**
    - Next.js tries to statically render routes
    - API routes using request.headers need this
    - Prevents build-time errors

### 🚨 Common Pitfalls to Avoid

❌ **Don't** use query parameters for authentication (use Bearer tokens)
❌ **Don't** hardcode paths in scripts (use environment variables)
❌ **Don't** send same config to iOS and Android (separate by platform)
❌ **Don't** log full tokens (security risk - use previews)
❌ **Don't** assume TestFlight is sandbox (it's production!)
❌ **Don't** forget to set FIREBASE_SERVICE_ACCOUNT_KEY in production
❌ **Don't** delete tokens (soft delete with is_active flag)
❌ **Don't** skip Row Level Security on database tables

✅ **Do** use APNs Authentication Key (.p8)
✅ **Do** verify Bundle ID consistency everywhere
✅ **Do** add comprehensive logging for debugging
✅ **Do** group notifications by device type
✅ **Do** store device metadata for analytics
✅ **Do** use Bearer tokens for API authentication
✅ **Do** test locally before deploying
✅ **Do** monitor logs after deployment

---

## 8. Checklist for Future Push Notification Setup

Use this checklist when implementing push notifications in a new app:

### Apple Developer Portal Setup
- [ ] Create App ID with Push Notifications capability enabled
- [ ] Note Bundle ID (e.g., `com.yourcompany.appname`)
- [ ] Create APNs Authentication Key (.p8)
- [ ] Download .p8 file (⚠️ can only download once!)
- [ ] Note Key ID (10 characters)
- [ ] Note Team ID (10 characters, found in membership)

### Firebase Console Setup
- [ ] Create Firebase project (or use existing)
- [ ] Add iOS app to Firebase project
- [ ] Set correct Bundle ID in Firebase
- [ ] Download GoogleService-Info.plist
- [ ] Go to Cloud Messaging settings
- [ ] Upload APNs Authentication Key (.p8)
- [ ] Enter Team ID and Key ID
- [ ] Verify Bundle ID matches everywhere

### iOS App Configuration
- [ ] Add GoogleService-Info.plist to Xcode project
- [ ] Set PRODUCT_BUNDLE_IDENTIFIER in Xcode project
- [ ] Verify Bundle ID matches Firebase and Apple Developer Portal
- [ ] Add Push Notifications capability in Xcode
- [ ] Select correct Team in Signing & Capabilities
- [ ] Add firebase_core and firebase_messaging dependencies
- [ ] Initialize Firebase in main.dart
- [ ] Request notification permissions
- [ ] Get FCM token and send to backend

### Backend Setup
- [ ] Install firebase-admin package
- [ ] Create service account key in Firebase Console
- [ ] Add FIREBASE_SERVICE_ACCOUNT_KEY to environment variables
- [ ] Create Firebase Admin SDK initialization code
- [ ] Fix private key newline characters (replace \\n with \n)
- [ ] Create token registration endpoint (/api/register-fcm-token)
- [ ] Create notification sending endpoint (/api/send-notification)
- [ ] Create cron job endpoint (/api/cron/vocabulary-review)
- [ ] Add `export const dynamic = 'force-dynamic'` to API routes

### Database Setup (Supabase)
- [ ] Create fcm_tokens table with schema
- [ ] Add columns: id, user_id, fcm_token, device_type, device_name, is_active, created_at, updated_at
- [ ] Enable Row Level Security (RLS)
- [ ] Create RLS policy: users can view own tokens
- [ ] Create RLS policy: users can insert own tokens
- [ ] Create RLS policy: service role can access all tokens
- [ ] Create unique constraint on fcm_token
- [ ] Create index on user_id for faster queries

### Notification Logic Implementation
- [ ] Implement token registration handler
- [ ] Group tokens by device type (iOS/Android)
- [ ] Create platform-specific notification configs
- [ ] Send iOS notifications with APNS config only
- [ ] Send Android notifications with Android config only
- [ ] Add comprehensive logging (device type, token preview, errors)
- [ ] Implement error handling for invalid tokens
- [ ] Mark invalid tokens as inactive in database
- [ ] Track success/failure counts
- [ ] Return detailed response with stats

### PM2 Cron Setup (for scheduled notifications)
- [ ] Create cron script in /root/ssat-cron/vocabulary-review-cron.js
- [ ] Add CRON_SECRET to environment variables
- [ ] Configure PM2 ecosystem file with cron schedule
- [ ] Start PM2 cron job
- [ ] Verify cron job runs on schedule
- [ ] Check PM2 logs for errors

### Testing
- [ ] Test token registration on iOS device
- [ ] Test token registration on Android device
- [ ] Verify tokens stored in database with correct device_type
- [ ] Send test notification via Firebase Console
- [ ] Send test notification via API endpoint
- [ ] Test notification in app foreground state
- [ ] Test notification in app background state
- [ ] Test notification when app is terminated
- [ ] Test on TestFlight (production environment)
- [ ] Verify APNs works for production tokens
- [ ] Test cron job manually
- [ ] Wait for scheduled cron and verify it runs
- [ ] Monitor PM2 logs for errors
- [ ] Check Firebase Console for delivery reports

### Production Deployment
- [ ] Set all environment variables on production server
- [ ] Verify FIREBASE_SERVICE_ACCOUNT_KEY is set correctly
- [ ] Deploy backend code
- [ ] Test with one device first
- [ ] Monitor logs for 24 hours
- [ ] Gradually roll out to more users
- [ ] Set up alerting for notification failures
- [ ] Document troubleshooting steps for team

### Documentation
- [ ] Document Bundle ID used
- [ ] Document where APNs key is stored
- [ ] Document cron schedule
- [ ] Document environment variables needed
- [ ] Create troubleshooting guide
- [ ] Document common errors and fixes

---

## 9. Quick Reference

### Common Commands

```bash
# Check PM2 cron logs
pm2 logs vocabulary-review-cron

# Restart PM2 cron
pm2 restart vocabulary-review-cron

# View all PM2 processes
pm2 list

# Check environment variables
pm2 env vocabulary-review-cron | grep CRON_SECRET

# Test cron endpoint manually
curl -X POST https://midssat.com/api/cron/vocabulary-review \
  -H "Authorization: Bearer YOUR_SECRET"

# Check Xcode Bundle ID
grep -r "PRODUCT_BUNDLE_IDENTIFIER" ios/Runner.xcodeproj/project.pbxproj

# Check GoogleService-Info.plist Bundle ID
grep -A1 "BUNDLE_ID" ios/Runner/GoogleService-Info.plist
```

### Important File Locations

```
Project Structure:
├── app/
│   └── api/
│       ├── register-fcm-token/
│       │   └── route.ts              # Token registration endpoint
│       ├── send-notification/
│       │   └── route.ts              # Manual notification endpoint
│       └── cron/
│           └── vocabulary-review/
│               └── route.ts          # Cron job endpoint
├── lib/
│   ├── firebase-admin.ts             # Firebase Admin SDK setup
│   └── supabase.ts                   # Supabase client
├── ios/
│   ├── Runner/
│   │   ├── GoogleService-Info.plist  # Firebase iOS config
│   │   └── Info.plist                # iOS app config
│   └── Runner.xcodeproj/
│       └── project.pbxproj           # Xcode project (Bundle ID)
└── .env.local                        # Environment variables
```

### Environment Variables

```bash
# Required for Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Required for cron job authentication
CRON_SECRET=your-secret-token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Key URLs

- **Firebase Console:** https://console.firebase.google.com
  - Cloud Messaging: Project Settings → Cloud Messaging
  - Service Account: Project Settings → Service Accounts

- **Apple Developer Portal:** https://developer.apple.com/account
  - Certificates, Identifiers & Profiles
  - Keys (for APNs Authentication Key)

- **Supabase Dashboard:** https://app.supabase.com
  - Database: Table Editor
  - Authentication: Users
  - SQL Editor: Run SQL queries

---

## 10. Additional Resources

### Official Documentation

- **Firebase Cloud Messaging:** https://firebase.google.com/docs/cloud-messaging
- **Firebase Admin SDK:** https://firebase.google.com/docs/admin/setup
- **APNs (Apple):** https://developer.apple.com/documentation/usernotifications
- **Flutter Firebase Messaging:** https://pub.dev/packages/firebase_messaging
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers

### Troubleshooting Guides

- **APNs Authentication Errors:** https://firebase.google.com/docs/cloud-messaging/ios/certs
- **FCM Error Codes:** https://firebase.google.com/docs/cloud-messaging/send-message#admin_sdk_error_reference
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security

### Tools

- **FCM Token Tester:** Firebase Console → Cloud Messaging → Send test message
- **APNs Provider API Tester:** https://github.com/firebase/quickstart-ios/tree/master/messaging
- **PM2 Documentation:** https://pm2.keymetrics.io/docs/usage/quick-start/

---

## Conclusion

Implementing push notifications involves many moving parts:
- Apple Developer Portal (APNs setup)
- Firebase Console (FCM configuration)
- Backend (Node.js/Next.js API)
- Database (Supabase for token storage)
- Mobile app (Flutter with Firebase plugins)
- Cron jobs (PM2 for scheduled notifications)

The key to success is:
1. **Consistency** - Bundle IDs, environment variables, configurations must match
2. **Logging** - Comprehensive logging saves hours of debugging
3. **Testing** - Test each component individually before integrating
4. **Documentation** - Document everything (this guide is proof!)

By following the best practices and avoiding the common mistakes outlined in this guide, you can implement a robust push notification system that works reliably across iOS and Android platforms.

---

**Last Updated:** January 10, 2025
**Maintainer:** Based on real-world implementation experience
**Project:** SSAT Training App (midssat.com)
