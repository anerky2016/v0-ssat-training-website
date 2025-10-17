# Firebase Email/Password Authentication - Quick Reference

Firebase email/password authentication has been successfully integrated into your SSAT Prep website!

## 🎯 What's New

Your website now supports **email/password sign-up and sign-in** in addition to the existing Google OAuth.

### Features Added

✅ **User Sign-Up** - New users can create accounts with email and password
✅ **User Sign-In** - Existing users can log in with their credentials
✅ **Password Reset** - Users can reset forgotten passwords via email
✅ **Auth Dialog** - Beautiful tabbed dialog with sign-up and sign-in forms
✅ **Toast Notifications** - User-friendly success/error messages
✅ **Supabase Tracking** - Login events tracked with provider information
✅ **NextAuth Integration** - Seamless integration with existing Google OAuth

---

## 🚀 Quick Start

### 1. Set Up Firebase (10 minutes)

Follow the comprehensive guide: **[docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)**

**TL;DR:**
1. Create Firebase project at https://console.firebase.google.com/
2. Enable Email/Password authentication
3. Copy Firebase config to `.env.local`
4. Restart dev server

### 2. Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

See `.env.example` for the complete template.

### 3. Test It Out

```bash
npm run dev
```

Then:
1. Open http://localhost:3001
2. Click the sign-in button
3. Try the "Sign Up" tab to create an account
4. Try the "Sign In" tab to log in

---

## 📁 Files Created/Modified

### New Files

**Authentication:**
- `lib/firebase.ts` - Firebase app initialization
- `lib/firebase-auth.ts` - Auth helper functions (signUp, signIn, passwordReset)
- `components/auth/sign-up-form.tsx` - Sign-up form component
- `components/auth/sign-in-form.tsx` - Sign-in form component
- `components/auth/auth-dialog.tsx` - Combined auth dialog with tabs
- `hooks/use-toast.ts` - Toast notification hook

**Documentation:**
- `docs/FIREBASE_SETUP.md` - Comprehensive setup guide
- `FIREBASE_AUTH.md` - This quick reference (you are here)

### Modified Files

**Configuration:**
- `.env.example` - Added Firebase environment variables
- `package.json` - Added `firebase` dependency

**Authentication:**
- `app/api/auth/[...nextauth]/route.ts` - Added Credentials provider
- `hooks/use-login-tracker.ts` - Added provider tracking
- `lib/supabase.ts` - Added provider fields to interface

**UI:**
- `app/layout.tsx` - Added Toaster component

---

## 🔧 How to Use

### Using the Auth Dialog Component

```tsx
import { AuthDialog } from '@/components/auth/auth-dialog'

// Basic usage with default button
<AuthDialog />

// Custom trigger button
<AuthDialog>
  <Button>Create Account</Button>
</AuthDialog>

// Open to sign-up tab by default
<AuthDialog defaultTab="signup">
  <Button>Get Started</Button>
</AuthDialog>
```

### Using Auth Functions Directly

```tsx
import { signUpWithEmail, signInWithEmail, sendPasswordReset } from '@/lib/firebase-auth'

// Sign up
await signUpWithEmail({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
})

// Sign in
await signInWithEmail({
  email: 'user@example.com',
  password: 'password123'
})

// Password reset
await sendPasswordReset('user@example.com')
```

---

## 🔐 Authentication Methods

Your app now supports **three authentication methods**:

| Method | Provider | How to Use |
|--------|----------|------------|
| Email/Password | Firebase | Use sign-up/sign-in forms |
| Google OAuth | Google (via NextAuth) | Click "Continue with Google" |
| Apple OAuth* | Apple (via NextAuth) | Configure in NextAuth route |

*Apple OAuth requires additional setup (not configured yet)

---

## 📊 Login Tracking

All logins are tracked in Supabase with provider information:

```sql
SELECT
  email,
  name,
  provider,  -- 'credentials' or 'google'
  login_at
FROM user_login_logs
ORDER BY login_at DESC;
```

### Run Supabase Migration (Optional)

To enable provider tracking in Supabase:

```sql
-- Run this in Supabase SQL Editor
-- See: supabase/migration_v2.sql

ALTER TABLE user_login_logs
ADD COLUMN provider TEXT,
ADD COLUMN provider_id TEXT;
```

---

## 🐛 Troubleshooting

### Common Issues

**"Firebase: Error (auth/configuration-not-found)"**
→ Add Firebase env variables to `.env.local` and restart server

**"Email already in use"**
→ User already exists - use sign-in instead

**"Invalid email or password"**
→ Check credentials or try password reset

**Reset email not received**
→ Check spam folder, verify email is correct

For more issues, see: [docs/FIREBASE_SETUP.md#troubleshooting](docs/FIREBASE_SETUP.md#troubleshooting)

---

## 📚 Documentation

- **[docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)** - Complete Firebase setup guide
- **[supabase/README.md](supabase/README.md)** - Supabase login tracking
- **[SUPABASE_LOGIN_TRACKING.md](SUPABASE_LOGIN_TRACKING.md)** - Login tracking details

---

## 🎨 Customization

### Update Auth Dialog Styling

Edit: `components/auth/auth-dialog.tsx`

```tsx
<DialogContent className="sm:max-w-[500px]"> {/* Change width */}
```

### Update Form Validation

Edit sign-up form: `components/auth/sign-up-form.tsx`

```tsx
<Input
  minLength={8}  // Require 8+ character passwords
  pattern="..." // Add regex pattern
/>
```

### Update Password Requirements

Password requirements are set by Firebase (default: 6+ characters).

To change, go to:
Firebase Console → Authentication → Settings → Password policy

---

## 🔒 Security

### Best Practices

✅ Keep `.env.local` in `.gitignore`
✅ Use different Firebase projects for dev/staging/production
✅ Enable email enumeration protection in Firebase Console
✅ Add authorized domains in Firebase Console
✅ Monitor authentication events in Firebase Console

### What's Exposed (Safe)

- Firebase API Key (public, safe to expose)
- Firebase Auth Domain
- Firebase Project ID

### What's Private

- Service account keys (never expose!)
- `.env.local` file

---

## 🚀 Next Steps

### Optional Enhancements

1. **Email Verification** - Require users to verify email
2. **Profile Management** - Let users update name, email, password
3. **Account Linking** - Link Google + email/password accounts
4. **Multi-Factor Auth** - Add SMS or authenticator app
5. **Social Sign-In** - Add Apple, Facebook, Twitter

See [docs/FIREBASE_SETUP.md#next-steps](docs/FIREBASE_SETUP.md#next-steps) for guides.

---

## ✅ Testing Checklist

- [ ] Create Firebase project
- [ ] Enable email/password authentication in Firebase
- [ ] Add Firebase env variables to `.env.local`
- [ ] Restart dev server (`npm run dev`)
- [ ] Test sign-up flow
- [ ] Test sign-in flow
- [ ] Test password reset
- [ ] Verify user in Firebase Console → Authentication → Users
- [ ] Verify login tracked in Supabase (if configured)
- [ ] Test Google OAuth still works

---

## 📞 Support

**Issues?**
1. Check [docs/FIREBASE_SETUP.md#troubleshooting](docs/FIREBASE_SETUP.md#troubleshooting)
2. Check browser console (F12 → Console)
3. Check Firebase Console → Authentication → Users
4. Check server logs (terminal running `npm run dev`)

---

**Authentication is ready!** 🎉

Users can now sign up and sign in with email/password OR continue using Google OAuth.
