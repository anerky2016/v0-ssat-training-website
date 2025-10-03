# Apple Sign-In Setup Guide

This guide walks you through setting up Sign in with Apple for the SSAT Prep application.

## Prerequisites

- An Apple Developer account (requires enrollment in the Apple Developer Program - $99/year)
- Access to [Apple Developer Portal](https://developer.apple.com/)
- Your application's domain name

## Setup Steps

### 1. Create an App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add button)
4. Select **App IDs** → Click **Continue**
5. Select **App** → Click **Continue**
6. Fill in:
   - Description: `SSAT Prep Web`
   - Bundle ID: Use a reverse-domain format (e.g., `com.yourcompany.ssatprep`)
7. Under **Capabilities**, check **Sign In with Apple**
8. Click **Continue** → **Register**

### 2. Create a Services ID

1. In **Identifiers**, click **+** (Add button)
2. Select **Services IDs** → Click **Continue**
3. Fill in:
   - Description: `SSAT Prep Sign In`
   - Identifier: `com.yourcompany.ssatprep.signin` (this will be your `APPLE_CLIENT_ID`)
4. Check **Sign In with Apple**
5. Click **Configure** next to Sign In with Apple
6. Configure:
   - Primary App ID: Select the App ID you created in step 1
   - Domains and Subdomains:
     - For development: `localhost`
     - For production: `yourdomain.com`
   - Return URLs:
     - For development: `http://localhost:3001/api/auth/callback/apple`
     - For production: `https://yourdomain.com/api/auth/callback/apple`
7. Click **Save** → **Continue** → **Register**

### 3. Create a Key for Client Secret

1. Navigate to **Keys** → Click **+** (Add button)
2. Fill in:
   - Key Name: `SSAT Prep Sign In Key`
3. Check **Sign In with Apple**
4. Click **Configure** next to Sign In with Apple
5. Select your Primary App ID from step 1
6. Click **Save** → **Continue** → **Register**
7. **IMPORTANT**: Download the `.p8` key file immediately (you can only download it once)
8. Note down:
   - Key ID (10-character string)
   - Team ID (found in the top-right of the developer portal)

### 4. Generate Client Secret

Apple Sign-In requires a JWT token as the client secret. You need to generate this programmatically.

Create a file `generate-apple-secret.js`:

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Configuration
const teamId = 'YOUR_TEAM_ID'; // 10-character Team ID
const clientId = 'com.yourcompany.ssatprep.signin'; // Your Services ID
const keyId = 'YOUR_KEY_ID'; // 10-character Key ID
const privateKey = fs.readFileSync('./AuthKey_XXXXXXXXXX.p8', 'utf8'); // Your .p8 file

// Generate token
const token = jwt.sign(
  {},
  privateKey,
  {
    algorithm: 'ES256',
    expiresIn: '180d', // Token valid for 180 days (max)
    audience: 'https://appleid.apple.com',
    issuer: teamId,
    subject: clientId,
    header: {
      alg: 'ES256',
      kid: keyId,
    },
  }
);

console.log('Apple Client Secret (valid for 180 days):');
console.log(token);
```

Install jsonwebtoken:
```bash
npm install jsonwebtoken
```

Run the script:
```bash
node generate-apple-secret.js
```

Copy the generated token - this is your `APPLE_CLIENT_SECRET`.

**Note**: This token expires in 180 days. You'll need to regenerate it before expiration.

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Apple credentials:
   ```env
   APPLE_CLIENT_ID=com.yourcompany.ssatprep.signin
   APPLE_CLIENT_SECRET=<generated-jwt-token>
   ```

### 6. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3001
3. Click "Sign In" → "Continue with Apple"
4. You should be redirected to Apple's login page
5. After signing in, you should be redirected back to the app

## Production Deployment

When deploying to production:

1. Update the Services ID:
   - Add your production domain to **Domains and Subdomains**
   - Add production callback URL: `https://yourdomain.com/api/auth/callback/apple`

2. Set environment variables in your hosting platform:
   - `NEXTAUTH_URL` → your production URL
   - `APPLE_CLIENT_ID` → your Services ID
   - `APPLE_CLIENT_SECRET` → generated JWT token

3. **Important**: Regenerate the client secret before the 180-day expiration

## Troubleshooting

### "invalid_client" error
- Verify `APPLE_CLIENT_ID` matches your Services ID exactly
- Ensure the client secret hasn't expired
- Check that the callback URL is configured correctly in Apple Developer Portal

### "invalid_request" error
- Verify your domain is added to the Services ID configuration
- Check that the return URL matches exactly (including protocol)

### Token Expiration
- Client secrets expire after 180 days
- Set a reminder to regenerate before expiration
- Consider automating secret rotation in production

## Security Notes

- Never commit `.env.local` or the `.p8` key file to version control
- Store the `.p8` key file securely (you cannot download it again)
- Keep your Team ID and Key ID confidential
- Rotate client secrets regularly (before 180-day expiration)

## Resources

- [Sign in with Apple Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Apple Developer Portal](https://developer.apple.com/account/)
- [NextAuth.js Apple Provider](https://next-auth.js.org/providers/apple)
- [JWT Library for Node.js](https://www.npmjs.com/package/jsonwebtoken)

## Apple vs Google Sign-In Differences

| Feature | Apple | Google |
|---------|-------|--------|
| Cost | $99/year developer program | Free |
| Secret Type | JWT (expires every 180 days) | Static client secret |
| Privacy | Allows email hiding | Shows real email |
| Setup Complexity | Higher (requires key generation) | Lower |
