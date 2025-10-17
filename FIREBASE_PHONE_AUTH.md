# Firebase Phone Authentication - Quick Reference

Firebase phone (SMS) authentication has been successfully integrated into your SSAT Prep website!

## 🎯 What's Implemented

Your website now supports **phone number sign-up and sign-in** via SMS verification codes.

### Features

✅ **Phone number authentication** - Users sign in with their phone number
✅ **SMS verification codes** - 6-digit codes sent via SMS
✅ **Optional name collection** - Users can provide their name during sign-up
✅ **Invisible reCAPTCHA** - Bot protection without user interaction
✅ **Auto phone formatting** - Handles various phone number formats
✅ **Test phone numbers** - Development without using real SMS credits
✅ **Works with Google OAuth** - Users can choose phone or Google sign-in

---

## 🚀 Quick Start

### 1. Enable Phone Auth in Firebase (5 minutes)

**Steps:**
1. Go to https://console.firebase.google.com/
2. Click your project: **midssat-6448b**
3. Click **Authentication** → **Sign-in method**
4. Click **Phone** → Toggle ON → **Save**

### 2. Upgrade to Blaze Plan (Required for Production)

⚠️ **Phone auth requires Firebase Blaze (pay-as-you-go) plan**

**Free tier includes:**
- 10,000 verifications/month = **FREE**
- Additional: $0.05/verification (US/Canada)

**To upgrade:**
1. Firebase Console → Settings (gear icon) → **Usage and billing**
2. **Modify plan** → Select **Blaze**
3. Add payment method
4. Set budget alert (recommended: $10/month)

### 3. Add Test Phone Number (Optional - for development)

Avoid using real SMS credits during development:

1. **Authentication** → **Sign-in method** → Scroll down
2. **Phone numbers for testing** → **Add phone number**
3. Phone: `+15555550100`
4. Code: `123456`
5. **Add**

Now you can test with `+15555550100` and code `123456` without sending SMS!

### 4. Test It Out

```bash
# Already have .env.local with Firebase config ✓
npm run dev
```

Then:
1. Open http://localhost:3001
2. Click **Sign In**
3. Enter phone number: `+15555550100` (test number)
4. Click **Send Verification Code**
5. Enter code: `123456`
6. Click **Verify & Sign In**

---

## 📁 What's Been Implemented

### New Files

**Phone Authentication:**
- `lib/firebase-auth.ts` - Phone auth helper functions
  - `initializeRecaptcha()` - Initialize reCAPTCHA
  - `sendPhoneVerificationCode()` - Send SMS code
  - `verifyPhoneCode()` - Verify code and sign in
- `components/auth/phone-sign-in-form.tsx` - Phone sign-in UI
  - Step 1: Enter phone number + name (optional)
  - Step 2: Enter verification code
- `components/auth/auth-dialog.tsx` - Updated for phone auth

**Documentation:**
- `docs/FIREBASE_PHONE_AUTH_SETUP.md` - Comprehensive setup guide
- `FIREBASE_PHONE_AUTH.md` - This quick reference

### Modified Files

- `app/api/auth/[...nextauth]/route.ts` - Removed Credentials provider (phone auth handled by Firebase directly)
- `.env.local` - Created with Firebase configuration

### Removed Files

- `components/auth/sign-up-form.tsx` - Removed (was email/password)
- `components/auth/sign-in-form.tsx` - Removed (was email/password)

---

## 🔧 How to Use

### Authentication Dialog

```tsx
import { AuthDialog } from '@/components/auth/auth-dialog'

// Basic usage
<AuthDialog />

// Custom trigger button
<AuthDialog>
  <Button>Get Started</Button>
</AuthDialog>
```

### Phone Auth Functions

```tsx
import {
  initializeRecaptcha,
  sendPhoneVerificationCode,
  verifyPhoneCode,
} from '@/lib/firebase-auth'

// Initialize reCAPTCHA
const verifier = initializeRecaptcha('recaptcha-container')

// Send SMS code
await sendPhoneVerificationCode('+15551234567', verifier)

// Verify code
const user = await verifyPhoneCode('123456', 'John Doe')
```

---

## 📞 Phone Number Format

### Supported Formats

The system handles these formats:

| Input | Auto-formatted to |
|-------|-------------------|
| `555 123 4567` | `+15551234567` (assumes US) |
| `+1 555 123 4567` | `+15551234567` |
| `(555) 123-4567` | `+15551234567` |
| `+44 20 1234 5678` | `+442012345678` (UK) |

### Best Practice

Always include country code: `+1 555 123 4567`

### Common Country Codes

- 🇺🇸 US/Canada: `+1`
- 🇬🇧 UK: `+44`
- 🇦🇺 Australia: `+61`
- 🇮🇳 India: `+91`

---

## 💰 Costs

### Free Tier

- ❌ Phone auth NOT available on free Spark plan
- Must upgrade to Blaze

### Blaze Plan (Pay-as-you-go)

**Pricing:**
- First 10,000 verifications/month: **FREE**
- Additional: $0.05 each (US/Canada)

**Cost Examples:**
| Daily Users | Monthly Verifications | Cost |
|-------------|----------------------|------|
| 50 | 1,500 | **$0** (free tier) |
| 500 | 15,000 | **$25/month** |
| 1,000 | 30,000 | **$100/month** |

**How to minimize costs:**
1. Use test phone numbers in development ✓
2. Set up budget alerts
3. Monitor usage in Firebase Console
4. Keep Google OAuth as free alternative

---

## 🔍 Verify Setup

### In Firebase Console

**Check phone auth enabled:**
1. Firebase Console → **Authentication** → **Sign-in method**
2. **Phone** should show "Enabled"

**Check users (after first sign-in):**
1. **Authentication** → **Users**
2. Should see phone number, name, provider: `phone`

**Monitor usage:**
1. **Authentication** → **Usage**
2. View verification count, costs

---

## 🐛 Troubleshooting

### Common Issues

**"Phone authentication is not enabled"**
→ Enable Phone in Firebase Console → Authentication → Sign-in method

**"reCAPTCHA verification failed"**
→ Disable ad blockers, try incognito mode

**"Invalid phone number"**
→ Include country code: `+1 555 123 4567`

**"SMS quota exceeded"**
→ Upgrade to Blaze plan or use test phone numbers

**"Too many requests"**
→ Rate limit: 10 SMS/hour per number. Wait or use different number.

**"Code expired"**
→ Codes expire in 10 minutes. Request new code.

**SMS not received**
→ Check phone number, signal, spam filter. View delivery status in Firebase Console → Authentication → Usage

For more troubleshooting, see: `docs/FIREBASE_PHONE_AUTH_SETUP.md`

---

## 🔐 Security & Privacy

### Built-in Security

✅ **reCAPTCHA** - Prevents bot abuse (invisible)
✅ **Rate limiting** - Max 10 SMS/hour per number
✅ **Code expiration** - Codes expire in 10 minutes
✅ **HTTPS only** - Firebase requires secure connections

### Phone Number Privacy

- Stored securely in Firebase Authentication
- Only visible to you (admin) in Firebase Console
- Not publicly exposed
- Can be deleted for GDPR compliance

### GDPR Compliance

Delete user data:
1. Firebase Console → Authentication → Users → Delete account
2. Supabase → user_login_logs table → Delete records

---

## 📊 Authentication Flow

```
User Flow:
┌─────────────────────────┐
│ 1. Enter phone number   │
│    (optional: name)     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 2. reCAPTCHA verifies   │
│    (invisible)          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 3. SMS sent with code   │
│    (6 digits)           │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 4. Enter verification   │
│    code                 │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 5. User authenticated!  │
│    Logged in Supabase   │
└─────────────────────────┘
```

---

## 📚 Documentation

- **Setup Guide:** `docs/FIREBASE_PHONE_AUTH_SETUP.md` (comprehensive, 400+ lines)
- **Quick Reference:** This file
- **Firebase Docs:** https://firebase.google.com/docs/auth/web/phone-auth
- **Pricing:** https://firebase.google.com/pricing

---

## ✅ Next Steps

### 1. Enable Phone Auth in Firebase Console (5 min)
- [ ] Go to Firebase Console
- [ ] Enable Phone sign-in method
- [ ] Add test phone number for development

### 2. Upgrade to Blaze Plan (for production)
- [ ] Add payment method
- [ ] Set budget alert
- [ ] Monitor usage

### 3. Test Authentication
- [ ] Test with test phone number
- [ ] Test with real phone number
- [ ] Verify in Firebase Console → Users
- [ ] Check Supabase login tracking

### 4. Deploy to Production
- [ ] Verify authorized domains include production domain
- [ ] Test on production site
- [ ] Monitor costs in Firebase Console

---

## 🎉 What Works Now

**Development (with test phone number):**
✅ Sign in with `+15555550100` and code `123456`
✅ No SMS sent, no costs
✅ Instant verification
✅ Full testing of auth flow

**Production (after enabling):**
✅ Real SMS sent to users
✅ 10,000 free verifications/month
✅ Works globally (200+ countries)
✅ Tracked in Supabase

**Alternative Sign-in:**
✅ Google OAuth (free, no limits)
✅ Apple OAuth (if configured)
✅ Facebook OAuth (if configured)

---

## 📞 Support

**Issues?**
1. Check `docs/FIREBASE_PHONE_AUTH_SETUP.md` Troubleshooting section
2. Check browser console (F12 → Console)
3. Check Firebase Console → Authentication → Users
4. Check Firebase Console → Authentication → Usage

**Ready to enable phone authentication!** 🚀

Your SSAT Prep website now has phone number sign-in ready to go. Just enable it in Firebase Console and start testing!
