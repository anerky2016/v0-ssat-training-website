# Firebase Phone Authentication Setup Guide

This guide will help you enable phone number (SMS) authentication for your SSAT Prep website using Firebase.

## Overview

Firebase Phone Authentication allows users to sign in using their phone number by receiving an SMS verification code.

### Features

✅ **Phone number sign-up/sign-in**
✅ **SMS verification codes**
✅ **Optional name collection**
✅ **Invisible reCAPTCHA for bot protection**
✅ **Automatic phone number formatting**
✅ **Works alongside Google OAuth**

---

## Quick Setup (10 Minutes)

### Step 1: Go to Firebase Console

1. Open https://console.firebase.google.com/
2. Click on your project: **midssat-6448b**

### Step 2: Enable Phone Authentication

1. In the left sidebar, click **"Authentication"**
2. If first time, click **"Get started"**
3. Click the **"Sign-in method"** tab
4. Find **"Phone"** in the providers list
5. Click on **"Phone"**
6. Toggle **ON** to enable
7. Click **"Save"**

### Step 3: Configure Test Phone Numbers (Optional - for development)

To avoid using real SMS credits during development:

1. Still in **"Sign-in method"** tab, scroll down to **"Phone numbers for testing"**
2. Click **"Add phone number"**
3. Enter a test phone number (e.g., `+15555550100`)
4. Enter a test verification code (e.g., `123456`)
5. Click **"Add"**

Now you can use this test number with the code `123456` without sending real SMS.

### Step 4: Set Up Billing (Required for Production!)

⚠️ **Important:** Phone authentication requires Firebase Blaze (pay-as-you-go) plan.

**Free tier includes:**
- 10,000 verifications/month (free)
- $0.05 per verification after that (US/Canada)

**To upgrade:**
1. Click the gear icon → **"Usage and billing"**
2. Click **"Details & settings"**
3. Click **"Modify plan"**
4. Select **"Blaze Plan"**
5. Add payment method
6. Set budget alerts (recommended: $10/month)

**Cost estimate:**
- 100 users/day = ~3,000/month = **FREE**
- 500 users/day = ~15,000/month = **~$25/month**

### Step 5: Configure Authorized Domains

1. In **"Sign-in method"** tab, scroll to **"Authorized domains"**
2. Verify these domains are listed:
   - `localhost` (for development)
   - `midssat.com` (your production domain)
   - Your Vercel domain if using (e.g., `midssat.vercel.app`)
3. If missing, click **"Add domain"** and add them

### Step 6: Verify Environment Variables

Your `.env.local` should already have:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCZJCWD9KXzDlxix6OWfbYJWd83R_gVnuo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=midssat-6448b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=midssat-6448b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=midssat-6448b.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=608689191309
NEXT_PUBLIC_FIREBASE_APP_ID=1:608689191309:web:9e2a61cfa0dbf7b295a5c4
```

### Step 7: Start Development Server

```bash
npm run dev
```

---

## Testing Phone Authentication

### Test with Real Phone Number

1. Go to http://localhost:3001
2. Click **"Sign In"** button
3. (Optional) Enter your name
4. Enter phone number with country code (e.g., `+1 555 123 4567`)
5. Click **"Send Verification Code"**
6. Check your phone for SMS
7. Enter the 6-digit code
8. Click **"Verify & Sign In"**

### Test with Test Phone Number (Development)

1. Use the test number you configured (e.g., `+15555550100`)
2. Enter the test code you set (e.g., `123456`)
3. No SMS will be sent, but authentication will succeed

---

## How It Works

### Authentication Flow

```
┌─────────────────────────────────────────┐
│  User enters phone number               │
│  (e.g., +1 555 123 4567)               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  reCAPTCHA verification (invisible)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Firebase sends SMS with 6-digit code   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  User enters verification code          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Firebase verifies code                 │
│  → User is authenticated                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Login tracked in Supabase              │
│  User redirected to home page           │
└─────────────────────────────────────────┘
```

### Phone Number Format

The system automatically formats phone numbers:

- **Entered:** `555 123 4567`
- **Formatted:** `+15551234567` (assumes US if no country code)
- **Best practice:** Include country code: `+1 555 123 4567`

### Supported Countries

Firebase supports phone auth in 200+ countries. Common country codes:

- 🇺🇸 United States/Canada: `+1`
- 🇬🇧 United Kingdom: `+44`
- 🇦🇺 Australia: `+61`
- 🇮🇳 India: `+91`
- 🇨🇳 China: `+86`

---

## Troubleshooting

### "reCAPTCHA verification failed"

**Cause:** reCAPTCHA not initialized or blocked

**Fix:**
1. Check browser console for errors
2. Disable ad blockers
3. Try in incognito mode
4. Clear browser cache

---

### "Invalid phone number"

**Cause:** Phone number format is incorrect

**Fix:**
- Include country code: `+1 555 123 4567`
- Remove spaces/dashes: `+15551234567`
- Check [E.164 format](https://en.wikipedia.org/wiki/E.164)

---

### "SMS quota exceeded"

**Cause:** Daily SMS limit reached (10,000/month on free tier)

**Fix:**
1. Upgrade to Blaze plan
2. Use test phone numbers for development
3. Set up budget alerts

---

### "Too many requests"

**Cause:** Rate limiting (10 SMS per phone number per hour)

**Fix:**
- Wait 1 hour
- Use different phone number
- Use test phone number in development

---

###"Code expired"

**Cause:** Verification codes expire after 10 minutes

**Fix:**
- Request a new code
- Enter code within 10 minutes

---

### User can't receive SMS

**Checks:**
1. Phone number is correct
2. Phone has signal/service
3. Not blocked by carrier spam filter
4. Check Firebase Console → Authentication → Usage for delivery status

---

## Verify Setup in Firebase Console

### Check Users

1. Go to Firebase Console → **Authentication** → **Users**
2. After first sign-in, you should see:
   - Phone number (e.g., `+15551234567`)
   - Display name (if provided)
   - Provider: `phone`
   - Created timestamp

### Check Usage

1. Go to **Authentication** → **Usage**
2. Monitor:
   - Daily active users
   - Phone verification count
   - SMS costs (if on Blaze plan)

### Check Logs

1. Go to Firebase Console → **Analytics** → **Streamview** (if enabled)
2. Filter for `phone_sign_in` events

---

## Security & Privacy

### Best Practices

✅ **Enable reCAPTCHA** - Prevents bot abuse (already enabled)
✅ **Use HTTPS only** - Firebase requires secure connections
✅ **Rate limiting** - Firebase automatically limits to 10 SMS/hour per number
✅ **Set budget alerts** - Prevent unexpected charges

### Phone Number Privacy

- Phone numbers are stored in Firebase Authentication
- Visible in Firebase Console → Authentication → Users
- Can be deleted via Firebase Console or API
- Not publicly exposed (only visible to you as admin)

### GDPR Compliance

To delete user data:
1. Firebase Console → Authentication → Users
2. Click user → **Delete account**
3. Also delete from Supabase `user_login_logs` table

---

## Costs & Pricing

### Free Tier (Spark Plan)

- ❌ Phone auth not available
- Must upgrade to Blaze

### Blaze Plan (Pay-as-you-go)

**Phone Authentication:**
- 10,000 verifications/month: **FREE**
- Additional verifications: $0.05 each (US/Canada)
- Other countries: varies ($0.01-$0.06)

**Example costs:**
- 50 users/day × 30 days = 1,500/month = **$0** (within free tier)
- 500 users/day × 30 days = 15,000/month = **$25/month**
- 1,000 users/day × 30 days = 30,000/month = **$100/month**

**How to minimize costs:**
1. Use test phone numbers during development
2. Set up budget alerts
3. Monitor usage in Firebase Console
4. Consider email auth for some users (free)

---

## Alternative: Email Verification (Free)

If SMS costs are too high, you can:
1. Keep Google OAuth (free, already enabled)
2. Add email/password auth (free)
3. Use phone auth only for premium users

---

## Next Steps

### Optional Enhancements

1. **Add phone number verification badge**
   - Show checkmark for verified phone numbers

2. **Allow users to change phone number**
   - Add profile page
   - Re-verify new number

3. **Add multi-factor authentication (MFA)**
   - Require phone + password
   - Or phone + Google OAuth

4. **Customize SMS message**
   - Firebase Console → Authentication → Templates
   - Customize verification SMS text

5. **Add phone number to profile**
   - Display in user settings
   - Allow users to update

---

## Resources

- [Firebase Phone Auth Docs](https://firebase.google.com/docs/auth/web/phone-auth)
- [Phone Auth Pricing](https://firebase.google.com/pricing)
- [reCAPTCHA Documentation](https://developers.google.com/recaptcha)
- [E.164 Phone Number Format](https://en.wikipedia.org/wiki/E.164)

---

## Support

**Issues?**
1. Check Firebase Console → Authentication → Users
2. Check browser console (F12 → Console)
3. Check this guide's Troubleshooting section
4. Check Firebase Console → Authentication → Usage for errors

---

**Setup complete!** 🎉

Your users can now sign in with their phone numbers via SMS verification.
