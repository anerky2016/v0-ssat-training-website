# Facebook Sign-In Setup Guide

This guide walks you through setting up Facebook Login for the SSAT Prep application.

## Prerequisites

- A Facebook account
- Access to [Facebook Developers](https://developers.facebook.com/)

## Setup Steps

### 1. Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Use case**: Choose **Authenticate and request data from users with Facebook Login**
4. Click **Next**
5. Select **App type**: Choose **Consumer**
6. Click **Next**
7. Fill in app details:
   - **App name**: `SSAT Prep`
   - **App contact email**: your email
8. Click **Create App**
9. Complete the security check if prompted

### 2. Configure Facebook Login

1. From your app dashboard, find **Facebook Login** in the **Add Products** section
2. Click **Set Up** on Facebook Login
3. Select **Web** as your platform
4. Enter your **Site URL**:
   - Development: `http://localhost:3001`
   - Production: `https://yourdomain.com`
5. Click **Save** → **Continue**

### 3. Configure OAuth Redirect URIs

1. In the left sidebar, go to **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs**:
   - Development: `http://localhost:3001/api/auth/callback/facebook`
   - Production: `https://yourdomain.com/api/auth/callback/facebook`
3. Click **Save Changes**

### 4. Get App Credentials

1. In the left sidebar, click **Settings** → **Basic**
2. Copy your credentials:
   - **App ID** (this is your `FACEBOOK_CLIENT_ID`)
   - **App Secret** (this is your `FACEBOOK_CLIENT_SECRET`)
     - Click **Show** to reveal the secret
     - You may need to re-enter your Facebook password

### 5. Configure App Domains

1. Still in **Settings** → **Basic**
2. Add **App Domains**:
   - Development: `localhost`
   - Production: `yourdomain.com`
3. Add **Privacy Policy URL** (required for public apps):
   - Example: `https://yourdomain.com/privacy`
4. Add **Terms of Service URL** (optional but recommended):
   - Example: `https://yourdomain.com/terms`
5. Click **Save Changes**

### 6. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Facebook credentials to `.env.local`:
   ```env
   FACEBOOK_CLIENT_ID=your-app-id
   FACEBOOK_CLIENT_SECRET=your-app-secret
   ```

### 7. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3001
3. Click "Sign In" → "Continue with Facebook"
4. You should be redirected to Facebook's login page
5. After signing in, you should be redirected back to the app

## App Review and Going Public

During development, your app is in **Development Mode** and only accessible to:
- App administrators
- App developers
- App testers

To make your app available to the public:

### 1. Add Test Users (Optional)

1. Go to **Roles** → **Test Users**
2. Click **Add** to create test users
3. Share credentials with your team for testing

### 2. Switch to Live Mode

1. In the top navigation, toggle from **Development** to **Live** mode
2. Click **Switch Mode**

**Requirements for Live Mode:**
- Privacy Policy URL must be set
- App must comply with Facebook Platform Policy
- May require App Review for certain permissions

### 3. Submit for App Review (if needed)

If you need additional permissions beyond basic profile and email:

1. Go to **App Review** → **Permissions and Features**
2. Request the permissions you need
3. Provide detailed use cases
4. Submit for review

**Note**: Basic profile and email permissions don't require review.

## Permissions

By default, Facebook Login provides:
- `public_profile`: User's name, profile picture
- `email`: User's email address

If you need additional data (friends list, etc.), you'll need to request additional permissions and may require App Review.

## Production Deployment

When deploying to production:

1. **Update App Settings**:
   - Add production domain to **App Domains**
   - Add production OAuth redirect URI
   - Ensure Privacy Policy and Terms of Service URLs are accessible

2. **Set Environment Variables** in your hosting platform:
   - `NEXTAUTH_URL` → your production URL
   - `FACEBOOK_CLIENT_ID` → your App ID
   - `FACEBOOK_CLIENT_SECRET` → your App Secret

3. **Switch to Live Mode** in Facebook Dashboard

4. **Monitor Usage**:
   - Check Analytics in Facebook Dashboard
   - Monitor for any policy violations

## Troubleshooting

### "URL Blocked" error
- Check that your domain is added to **App Domains**
- Verify the OAuth redirect URI matches exactly
- Ensure the app is in the correct mode (Development/Live)

### "App Not Setup" error
- Make sure Facebook Login product is added to your app
- Verify OAuth redirect URIs are configured
- Check that the app is not disabled

### "Invalid OAuth access token" error
- Verify `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` are correct
- Ensure there are no extra spaces in your `.env.local` file
- Try regenerating your App Secret

### Users can't see the login option
- If your app is in Development Mode, only admins, developers, and test users can use it
- Switch to Live Mode or add users as testers

## Security Notes

- Never commit `.env.local` to version control
- Keep your App Secret confidential
- Regenerate your App Secret if it's compromised
- Regularly review App Settings and permissions
- Monitor for suspicious activity in Facebook Analytics

## Important Privacy Considerations

- Clearly state what data you collect in your Privacy Policy
- Only request permissions you actually need
- Allow users to delete their data
- Comply with GDPR and other privacy regulations
- Consider implementing data deletion callbacks

## Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Facebook Developers Console](https://developers.facebook.com/)
- [NextAuth.js Facebook Provider](https://next-auth.js.org/providers/facebook)
- [Facebook Platform Policy](https://developers.facebook.com/policy)
- [Facebook App Review](https://developers.facebook.com/docs/app-review)

## Comparison: Facebook vs Google vs Apple

| Feature | Facebook | Google | Apple |
|---------|----------|--------|-------|
| Cost | Free | Free | $99/year |
| Setup Complexity | Medium | Low | High |
| Required for Public | App Review (for some permissions) | No | Developer Program |
| Privacy Options | Standard | Standard | Email hiding |
| User Base | 2.9B+ users | 2.5B+ users | 1.5B+ devices |
| Login Speed | Fast | Fast | Fast |
| Data Access | Profile, Email | Profile, Email | Minimal (can hide email) |
