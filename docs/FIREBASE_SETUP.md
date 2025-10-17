# Firebase Authentication Setup Guide

This guide will walk you through setting up Firebase Authentication for email/password sign-up and sign-in on your SSAT Prep website.

## Table of Contents

1. [Overview](#overview)
2. [Quick Setup (10 Minutes)](#quick-setup-10-minutes)
3. [Testing the Integration](#testing-the-integration)
4. [How It Works](#how-it-works)
5. [Troubleshooting](#troubleshooting)
6. [Security Best Practices](#security-best-practices)

---

## Overview

Firebase Authentication provides:
- Email/password sign-up and sign-in
- Password reset functionality
- Secure user management
- Integration with existing Google OAuth (via NextAuth)

### What's Been Implemented

✅ **Backend:**
- Firebase SDK integrated
- NextAuth Credentials provider configured
- Firebase auth verification in API routes

✅ **Frontend:**
- Sign-up form with validation
- Sign-in form with password reset
- Auth dialog with tabs for sign-up/sign-in
- Toast notifications for user feedback

✅ **Tracking:**
- Login tracking via Supabase
- Provider detection (Google vs Email/Password)

---

## Quick Setup (10 Minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `ssat-prep` (or your preferred name)
4. Disable Google Analytics (optional, can enable later)
5. Click **"Create project"**
6. Wait ~30 seconds for project creation

### Step 2: Register Your Web App

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `SSAT Prep Website`
3. ✅ Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. You'll see your Firebase configuration - **keep this page open!**

### Step 3: Enable Email/Password Authentication

1. In Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"** (if first time)
3. Go to **"Sign-in method"** tab
4. Click **"Email/Password"**
5. ✅ Enable **"Email/Password"**
6. ❌ Leave **"Email link (passwordless sign-in)"** disabled
7. Click **"Save"**

### Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon in sidebar)
2. Scroll down to **"Your apps"** → **Web apps**
3. Find your app and look for the **firebaseConfig** object

It should look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
}
```

### Step 5: Add Environment Variables

1. Copy your Firebase config values
2. Open your `.env.local` file (create it if it doesn't exist)
3. Add these variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important:**
- Replace all values with YOUR actual Firebase config
- Don't commit `.env.local` to Git (it's already in `.gitignore`)
- All these variables are prefixed with `NEXT_PUBLIC_` because they're used on the client

### Step 6: Restart Development Server

```bash
# Stop your dev server (Ctrl+C)
# Start it again
npm run dev
```

### Step 7: Update Supabase Schema (Optional)

If you want to track which authentication provider users are using (Google vs Email/Password):

1. Go to your Supabase dashboard
2. Open **SQL Editor**
3. Run the migration in `supabase/migration_v2.sql`

This adds `provider` and `provider_id` columns to track authentication methods.

---

## Testing the Integration

### Test Sign-Up

1. Go to your website: `http://localhost:3001`
2. Open the authentication dialog (click sign-in button)
3. Switch to the **"Sign Up"** tab
4. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123` (min 6 characters)
5. Click **"Sign Up"**
6. You should see a success toast and be redirected

### Verify in Firebase Console

1. Go to Firebase Console → **Authentication** → **Users** tab
2. You should see your new user listed with:
   - Email: `test@example.com`
   - Display Name: `Test User`
   - Provider: `Password`
   - Created timestamp

### Test Sign-In

1. Sign out (if signed in)
2. Open authentication dialog
3. Switch to **"Sign In"** tab
4. Enter the same credentials:
   - Email: `test@example.com`
   - Password: `test123`
5. Click **"Sign In"**
6. You should be signed in successfully

### Test Password Reset

1. Go to Sign In form
2. Click **"Forgot password?"**
3. Enter your email
4. Click **"Send Reset Email"**
5. Check your email inbox for password reset link
6. Click the link and set a new password

### Verify in Supabase (if configured)

1. Go to Supabase dashboard → **Table Editor** → `user_login_logs`
2. You should see your logins tracked with:
   - Email
   - Name
   - Provider: `credentials` (for email/password)
   - Login timestamp

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Sign Up     │  │   Sign In    │  │ Password     │      │
│  │  Form        │  │   Form       │  │ Reset        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                   │              │
└─────────┼─────────────────┼───────────────────┼──────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Auth Functions                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  lib/firebase-auth.ts                                │   │
│  │  - signUpWithEmail()                                 │   │
│  │  - signInWithEmail()                                 │   │
│  │  - sendPasswordReset()                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Firebase SDK                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  lib/firebase.ts                                     │   │
│  │  - Firebase app initialization                       │   │
│  │  - Auth instance                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                  NextAuth Integration                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  app/api/auth/[...nextauth]/route.ts                │   │
│  │  - Credentials Provider                              │   │
│  │  - Google Provider (existing)                        │   │
│  │  - Session management                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Tracking                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  hooks/use-login-tracker.ts                          │   │
│  │  - Tracks all logins (Google + Email/Password)       │   │
│  │  - Logs provider type                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

**Sign-Up Flow:**

1. User fills sign-up form → `SignUpForm.tsx`
2. Form calls → `signUpWithEmail()` in `lib/firebase-auth.ts`
3. Firebase creates user account
4. User profile updated with display name
5. Success toast shown
6. User redirected to home page

**Sign-In Flow:**

1. User fills sign-in form → `SignInForm.tsx`
2. Form calls → `signIn('credentials', {...})` from NextAuth
3. NextAuth Credentials provider → `authorize()` function
4. Credentials verified with Firebase → `signInWithEmailAndPassword()`
5. If valid → NextAuth creates session
6. Login tracked → `useLoginTracker()` hook
7. User logged in Supabase → `logUserLogin()`
8. Success toast shown
9. User redirected to home page

**Password Reset Flow:**

1. User clicks "Forgot password?"
2. Enters email
3. Calls → `sendPasswordReset()` in `lib/firebase-auth.ts`
4. Firebase sends password reset email
5. User clicks link in email
6. Firebase auth UI opens (hosted by Firebase)
7. User sets new password
8. User can sign in with new password

---

## Troubleshooting

### Build Errors

**Error: "Firebase: Error (auth/configuration-not-found)"**

**Cause:** Firebase environment variables not set

**Fix:**
1. Check `.env.local` exists in project root
2. Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
3. Restart dev server: `npm run dev`

---

**Error: "supabaseUrl is required"**

**Cause:** Supabase not configured (this is okay!)

**Fix:** The app gracefully handles missing Supabase. To enable tracking:
1. Set up Supabase (see `supabase/README.md`)
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`

---

### Sign-Up Issues

**Error: "Email already in use"**

**Cause:** User already registered with that email

**Fix:**
- Use a different email, OR
- Sign in instead of signing up, OR
- Delete user in Firebase Console → Authentication → Users

---

**Error: "Password should be at least 6 characters"**

**Cause:** Firebase requires minimum 6 character passwords

**Fix:** Use a longer password (6+ characters)

---

**Error: "Invalid email address"**

**Cause:** Email format is invalid

**Fix:** Use a valid email format (e.g., `user@example.com`)

---

### Sign-In Issues

**Error: "Invalid email or password"**

**Causes:**
- Email not registered
- Wrong password
- Account created with Google OAuth (different provider)

**Fix:**
- Check spelling
- Try password reset
- If signed up with Google, use Google sign-in instead

---

**Error: "Too many failed attempts. Please try again later."**

**Cause:** Firebase rate limiting after multiple failed login attempts

**Fix:** Wait 5-10 minutes before trying again

---

### Password Reset Issues

**Reset email not received**

**Checks:**
1. Check spam/junk folder
2. Verify email is correct
3. Wait a few minutes (can take time)

**If still not working:**
- Check Firebase Console → Authentication → Templates
- Verify email templates are enabled
- Check sender email configuration

---

**Reset link expired**

**Cause:** Password reset links expire after 1 hour

**Fix:** Request a new password reset email

---

### Session Issues

**User logged out unexpectedly**

**Causes:**
- Session expired (default: 30 days)
- Browser cleared cookies
- Different browser/device

**Fix:** Sign in again

---

**Changes not reflecting**

**Fix:**
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache
3. Restart dev server

---

## Security Best Practices

### Environment Variables

✅ **Do:**
- Keep `.env.local` in `.gitignore`
- Use different Firebase projects for dev/staging/production
- Rotate API keys if exposed

❌ **Don't:**
- Commit `.env.local` to Git
- Share Firebase credentials publicly
- Use production Firebase config in development

---

### Firebase Console Security

**Enable Security Features:**

1. **Email Enumeration Protection** (recommended)
   - Go to Firebase Console → Authentication → Settings
   - Enable **"Email enumeration protection"**
   - This prevents attackers from discovering registered emails

2. **Password Policy** (optional)
   - Set minimum password length (default: 6)
   - Consider requiring uppercase, numbers, special characters

3. **Authorized Domains**
   - Go to Authentication → Settings → Authorized domains
   - Only add domains you control:
     - `localhost` (for development)
     - `your-domain.com` (production)
     - `your-domain.vercel.app` (if using Vercel)

---

### Rate Limiting

Firebase automatically implements:
- Login attempt rate limiting
- Password reset request limiting
- Account creation rate limiting

**Additional Protection:**
- Consider implementing CAPTCHA for sign-up forms
- Monitor Firebase Console → Authentication → Usage for suspicious activity

---

### User Data Protection

**GDPR Compliance:**

Firebase provides:
- User data deletion (via Firebase Console or API)
- Data export capabilities
- Privacy controls

**To delete a user:**
1. Firebase Console → Authentication → Users
2. Click the user
3. Click **"Delete account"**
4. This also removes from your Supabase tracking (manual deletion needed)

---

## Next Steps

### Optional Enhancements

1. **Add Email Verification**
   - Require users to verify email before accessing content
   - See: [Firebase Email Verification Docs](https://firebase.google.com/docs/auth/web/manage-users#send_a_user_a_verification_email)

2. **Add Social Providers**
   - Already have Google OAuth
   - Can add: Apple, Facebook, Twitter, GitHub
   - Configure in NextAuth route

3. **Add Profile Management**
   - Let users update display name
   - Let users change password
   - Let users update email

4. **Add Account Linking**
   - Allow users to link Google + Email/Password accounts
   - See: [Firebase Account Linking Docs](https://firebase.google.com/docs/auth/web/account-linking)

5. **Add Multi-Factor Authentication (MFA)**
   - Add SMS or authenticator app verification
   - See: [Firebase MFA Docs](https://firebase.google.com/docs/auth/web/multi-factor)

---

## Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Firebase Console](https://console.firebase.google.com/)
- [Supabase Dashboard](https://app.supabase.com/)

---

## Support

If you encounter issues:

1. Check this guide's **Troubleshooting** section
2. Check browser console for errors (F12 → Console tab)
3. Check Firebase Console → Authentication → Users
4. Check server logs (`npm run dev` terminal output)
5. Review `supabase/README.md` for database tracking issues

---

**Setup complete!** 🎉

Your SSAT Prep website now supports:
- ✅ Email/password sign-up
- ✅ Email/password sign-in
- ✅ Password reset
- ✅ Google OAuth (existing)
- ✅ Login tracking (if Supabase configured)
