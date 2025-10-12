# Email Notifications Setup Guide

This guide explains how to set up email notifications for study reminders using your existing SMTP configuration.

## Overview

The email notification system sends daily reminders to students and parents when lessons are due for review using spaced repetition. It uses your **existing PurelyMail SMTP** setup - no additional services needed!

## Features

- ✅ **Browser Notifications**: Fully working! Users can enable in settings
- ✅ **Email Notifications**: Uses your existing SMTP (PurelyMail)
- 📧 Daily email reminders at 9 AM
- 🎯 Personalized with lesson titles and review schedules
- 🔔 Opt-in/opt-out preferences per user
- 🖥️ Simple Ubuntu cron job or Vercel cron

## Architecture

```
┌─────────────────┐
│   User Browser  │
│  [Settings UI]  │◄──── Browser Notifications (✅ Working)
└────────┬────────┘
         │
┌────────▼───────────────────┐
│   Ubuntu Cron Job          │
│   (or Vercel Cron)         │
│                            │
│   0 9 * * * curl POST      │
│   /api/cron/daily-reminders│
└────────┬───────────────────┘
         │
┌────────▼────────────────────┐
│    Next.js API Routes       │
│  /api/cron/daily-reminders  │
│  /api/notifications/email   │
└────────┬────────────────────┘
         │
┌────────▼────────────────────┐
│   PurelyMail SMTP           │
│   (Already configured!)     │
└────────┬────────────────────┘
         │
         ▼
    📧 Email to users
```

## Quick Setup (3 Steps!)

### Step 1: Generate Cron Secret

```bash
openssl rand -base64 32
```

Add to your `.env.local`:
```env
CRON_SECRET=your-generated-secret-here
```

Your SMTP credentials are already configured, so nothing else needed!

### Step 2: Choose Your Cron Method

**Option A: Ubuntu Cron Job (Recommended for Simplicity)**

Add to your crontab:
```bash
crontab -e
```

Add this line (replace with your actual domain and secret):
```cron
0 9 * * * curl -X POST https://yourdomain.com/api/cron/daily-reminders -H "Authorization: Bearer YOUR_CRON_SECRET"
```

This runs daily at 9 AM.

**Option B: Vercel Cron (if deployed on Vercel)**

The `vercel.json` is already configured! Just:
1. Deploy to Vercel
2. Add `CRON_SECRET` to Vercel environment variables
3. Done! Vercel handles the rest

**Option C: External Cron Service**

Use [cron-job.org](https://cron-job.org) or similar:
- URL: `https://yourdomain.com/api/cron/daily-reminders`
- Method: `POST`
- Header: `Authorization: Bearer YOUR_CRON_SECRET`
- Schedule: `0 9 * * *`

### Step 3: Deploy & Test

```bash
# Test the endpoint locally
curl -X POST http://localhost:3001/api/cron/daily-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Deploy
git push
```

## Environment Variables

You already have these from your contact form setup:

```env
# SMTP Configuration (already set up!)
SMTP_HOST=smtp.purelymail.com
SMTP_PORT=587
SMTP_USER=your-email@midssat.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@midssat.com

# New: Cron Job Secret
CRON_SECRET=your-generated-secret-here
```

## How It Works

1. **User completes a lesson** → Marked with next review date (spaced repetition)
2. **Cron job runs at 9 AM** → Calls `/api/cron/daily-reminders`
3. **API fetches users** → Gets lessons due for each user (from localStorage currently)
4. **Sends emails** → Uses nodemailer + your SMTP credentials
5. **User receives email** → With lessons due and upcoming reviews

## Email Template

The email includes:
- Personalized greeting with student name
- List of lessons due for review today
- Review number (Review #1, Review #2, etc.)
- Upcoming reviews in next 7 days
- Direct links to lessons
- Beautiful HTML formatting

## Testing

### Test Browser Notifications (Works Now!)

1. Visit `/progress`
2. Enable browser notifications
3. Complete a lesson and mark it done
4. Visit site next day → See notification

### Test Email Sending

```bash
# Test the email API (need to be signed in)
curl -X POST http://localhost:3001/api/notifications/email \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "lessonsDue": [
      {
        "topicTitle": "Fractions - Simplifying",
        "nextReviewDate": "2025-01-10",
        "reviewCount": 0
      }
    ],
    "upcomingReviews": []
  }'
```

### Test Cron Job

```bash
# Test locally
curl -X POST http://localhost:3001/api/cron/daily-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test production
curl -X POST https://yourdomain.com/api/cron/daily-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Ubuntu Cron Job Examples

### Basic Daily Reminder (9 AM)
```cron
0 9 * * * curl -X POST https://yourdomain.com/api/cron/daily-reminders -H "Authorization: Bearer YOUR_SECRET"
```

### With Logging
```cron
0 9 * * * curl -X POST https://yourdomain.com/api/cron/daily-reminders -H "Authorization: Bearer YOUR_SECRET" >> /var/log/ssat-reminders.log 2>&1
```

### Multiple Times Per Day
```cron
# 9 AM and 5 PM
0 9,17 * * * curl -X POST https://yourdomain.com/api/cron/daily-reminders -H "Authorization: Bearer YOUR_SECRET"
```

### Weekdays Only
```cron
# Monday-Friday at 9 AM
0 9 * * 1-5 curl -X POST https://yourdomain.com/api/cron/daily-reminders -H "Authorization: Bearer YOUR_SECRET"
```

## Current Limitations

Since user data is in localStorage (browser-only):
- ❌ Can't send emails yet (need database for user emails)
- ❌ Can't persist preferences across devices
- ✅ Browser notifications work great!

To enable email sending, you'll need to:
1. Add a database (Prisma + PostgreSQL recommended)
2. Store user lesson completions in database
3. Store email notification preferences
4. Update cron job to fetch from database

## Future Enhancements

- [ ] Add database for persistent storage
- [ ] Store lesson completions server-side
- [ ] Email notification preferences per user
- [ ] Weekly summary emails
- [ ] Parent email CC functionality
- [ ] Customizable reminder times
- [ ] Unsubscribe links
- [ ] Email open/click tracking

## Why This Approach?

✅ **Simple**: Uses your existing SMTP setup
✅ **Free**: No additional services needed
✅ **Reliable**: SMTP is battle-tested
✅ **Flexible**: Works with any cron system
✅ **No Dependencies**: Just nodemailer (already installed)

No need for Resend, SendGrid, or other services - you already have everything!

## Troubleshooting

### Browser Notifications Not Working
- Check browser allows notifications
- Ensure HTTPS (required for notifications)
- Try different browser

### Email Not Sending
- Verify SMTP credentials in .env
- Check SMTP_HOST, SMTP_PORT are correct
- Test with simple nodemailer script first
- Check SMTP logs

### Cron Job Not Running
- Verify crontab syntax: `crontab -l`
- Check system time zone
- Test curl command manually first
- Check cron logs: `/var/log/syslog` or `/var/log/cron`

### Authorization Failed
- Verify CRON_SECRET matches in .env and cron command
- Check no extra spaces in Authorization header
- Try base64 encoding the secret

## Support

For issues:
- Check server logs: `pm2 logs` or `journalctl`
- Check Next.js API route logs
- Test endpoints manually with curl
- Review SMTP connection with telnet

## Security Notes

- ✅ CRON_SECRET protects endpoint from unauthorized access
- ✅ Session authentication required for email API
- ✅ SMTP credentials in environment variables (not code)
- ✅ Rate limiting recommended for production
- ⚠️ Add IP whitelist for cron endpoint if possible
