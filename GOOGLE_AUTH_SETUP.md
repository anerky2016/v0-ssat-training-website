# Google Sign-In Setup Guide

This application uses Google OAuth for authentication. Follow these steps to set it up.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "SSAT Prep")
4. Click "Create"

### 2. Configure OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **Create**
4. Fill in the required fields:
   - App name: `SSAT Prep`
   - User support email: your email
   - Developer contact information: your email
5. Click **Save and Continue**
6. Skip the Scopes section (click **Save and Continue**)
7. Add test users if needed (for development)
8. Click **Save and Continue**

### 3. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Fill in:
   - Name: `SSAT Prep Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3001` (for development)
     - Your production URL (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs:
     - `http://localhost:3001/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   NEXTAUTH_URL=http://localhost:3001
   NEXTAUTH_SECRET=your-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

### 5. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3001
3. Click "Sign In" or "Get Started"
4. You should be redirected to Google's login page
5. After signing in, you should be redirected back to the app

## Production Deployment

When deploying to production:

1. Update the OAuth consent screen to "Production" status
2. Add your production domain to:
   - Authorized JavaScript origins
   - Authorized redirect URIs
3. Set environment variables in your hosting platform:
   - `NEXTAUTH_URL` → your production URL
   - `NEXTAUTH_SECRET` → a secure random string
   - `GOOGLE_CLIENT_ID` → your Google Client ID
   - `GOOGLE_CLIENT_SECRET` → your Google Client Secret

## Troubleshooting

### "Redirect URI mismatch" error
- Verify the redirect URI in Google Console matches exactly: `http://localhost:3001/api/auth/callback/google`
- Check that `NEXTAUTH_URL` in `.env.local` is set correctly

### "Invalid client" error
- Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
- Make sure there are no extra spaces or line breaks

### Session not persisting
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Clear browser cookies and try again

## Security Notes

- Never commit `.env.local` to version control
- Keep your `GOOGLE_CLIENT_SECRET` confidential
- Rotate your `NEXTAUTH_SECRET` periodically
- Use a strong, random `NEXTAUTH_SECRET` in production

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
