# Firestore Security Rules for Location Sync

This document outlines the Firestore security rules needed for the multi-device location sync feature.

## Required Rules

Add these rules to your Firestore security rules in Firebase Console:

### Path: Firebase Console → Firestore Database → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // User documents - users can only read/write their own data
    match /users/{userId} {
      // Allow user to read and write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Specifically allow updates to currentLocation field
      allow update: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.data.keys().hasAll(['currentLocation'])
                    && request.resource.data.currentLocation.keys().hasAll(['path', 'timestamp', 'deviceId']);
    }

    // Add other collection rules here as needed
  }
}
```

## Explanation

### User Document Structure

```typescript
/users/{userId}/
{
  currentLocation: {
    path: string,           // Current page path
    timestamp: number,      // Unix timestamp
    deviceId: string,       // Unique device identifier
    deviceName?: string,    // Optional device name
    pageTitle?: string,     // Optional page title
    progress?: number       // Optional progress percentage
  },
  updatedAt: Timestamp      // Server timestamp
}
```

### Security Considerations

1. **Authentication Required**: All reads and writes require authentication
2. **User Isolation**: Users can only access their own documents
3. **Field Validation**: The update rule validates required fields
4. **No Cross-User Access**: Users cannot read or write other users' location data

## How to Apply Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the rules above and paste into the editor
5. Click **Publish**

## Testing Rules

### Test Read Access
```javascript
// Should succeed - user reading own document
allow read: if request.auth.uid == 'user123' && resource.id == 'user123'

// Should fail - user reading another user's document
allow read: if request.auth.uid == 'user123' && resource.id == 'user456'
```

### Test Write Access
```javascript
// Should succeed - updating own location
allow update: if request.auth.uid == 'user123'
           && resource.id == 'user123'
           && request.resource.data.currentLocation exists

// Should fail - updating another user's location
allow update: if request.auth.uid == 'user123'
           && resource.id == 'user456'
```

## Enable Firestore

If you haven't enabled Firestore yet:

1. Go to Firebase Console
2. Click **Firestore Database** in the left sidebar
3. Click **Create database**
4. Choose **Start in production mode** (we have custom rules)
5. Select your preferred location
6. Click **Enable**

## Monitoring

Monitor location sync usage:

1. Go to **Firestore Database** → **Usage**
2. Check:
   - Read operations
   - Write operations
   - Storage used
3. Set up billing alerts if needed

## Troubleshooting

### "Permission Denied" Error

If you see permission denied errors:

1. Check that the user is authenticated
2. Verify the user ID matches the document ID
3. Ensure all required fields are present in the update
4. Check Firebase Console → Firestore → Rules for syntax errors

### Rules Not Working

1. Make sure you clicked **Publish** after editing rules
2. Wait 1-2 minutes for rules to propagate
3. Clear browser cache and reload
4. Check the Firebase Console logs for rule evaluation errors
