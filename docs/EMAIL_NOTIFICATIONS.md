# Email Notifications Setup Guide

This guide explains how to set up email notifications for study reminders.

## Overview

The email notification system sends daily reminders to students and parents when lessons are due for review using spaced repetition.

## Features

- ✅ **Browser Notifications**: Already working! Users can enable browser notifications in their settings
- ⏳ **Email Notifications**: Requires additional setup (see below)
- 📧 Daily email reminders at 9 AM
- 🎯 Personalized with lesson titles and review schedules
- 🔔 Opt-in/opt-out preferences per user

## Current Status

### ✅ Implemented
- Browser notification system (fully functional)
- Email API routes (`/api/notifications/email`)
- Cron job endpoint (`/api/cron/daily-reminders`)
- Email HTML templates
- Notification settings UI

### ⏳ Requires Setup
- Email service integration (Resend)
- Database for user preferences
- Environment variables configuration
- Vercel cron job deployment

## Setup Instructions

### 1. Install Resend

```bash
npm install resend
```

### 2. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain)
3. Get your API key from the dashboard

### 3. Configure Environment Variables

Add to your `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
CRON_SECRET=your-cron-secret-here
```

Generate a secure CRON_SECRET:
```bash
openssl rand -base64 32
```

### 4. Uncomment Email Sending Code

In `app/api/notifications/email/route.ts`, uncomment the Resend integration code:

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: 'SSAT Prep <noreply@yourdomain.com>',
  to: [session.user.email],
  subject: `${lessonsDue.length} Lesson${lessonsDue.length === 1 ? '' : 's'} Ready for Review`,
  html: generateEmailHTML(session.user.name, lessonsDue, upcomingReviews),
});
```

### 5. Add Database Support (Optional)

For production use, you'll want to store user preferences in a database:

```typescript
// Example schema (Prisma)
model UserNotificationPreferences {
  id                        String   @id @default(cuid())
  userId                    String   @unique
  emailNotificationsEnabled Boolean  @default(false)
  emailFrequency            String   @default("daily") // daily, weekly
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt

  user                      User     @relation(fields: [userId], references: [id])
}
```

### 6. Deploy to Vercel

The `vercel.json` file is already configured to run the cron job daily at 9 AM:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Add environment variables in Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `RESEND_API_KEY` and `CRON_SECRET`

## Alternative: Manual Cron Setup

If you're not using Vercel, you can use a service like [cron-job.org](https://cron-job.org):

1. Create a new cron job
2. URL: `https://yourdomain.com/api/cron/daily-reminders`
3. Method: `POST`
4. Headers: `Authorization: Bearer YOUR_CRON_SECRET`
5. Schedule: Daily at 9:00 AM

## Testing

### Test Browser Notifications

1. Visit `/progress`
2. Enable browser notifications in settings
3. Complete a lesson and mark it as done
4. Visit the site again the next day to see the notification

### Test Email API (Manual)

```bash
# Get an auth token by signing in first
curl -X POST https://yourdomain.com/api/notifications/email \
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

### Test Cron Endpoint

```bash
curl -X POST https://yourdomain.com/api/cron/daily-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Architecture

```
┌─────────────────┐
│   User Browser  │
│                 │
│  [Settings UI]  │◄──── Browser Notifications (✅ Working)
│                 │
└────────┬────────┘
         │
         │ HTTP POST
         ▼
┌─────────────────────────────┐
│    Next.js API Routes       │
│                             │
│  /api/notifications/email   │◄──── User-triggered
│  /api/cron/daily-reminders  │◄──── Cron-triggered (9 AM daily)
│                             │
└────────┬────────────────────┘
         │
         │ Email API
         ▼
┌─────────────────┐
│     Resend      │──────► 📧 Email to users
└─────────────────┘
```

## User Flow

1. **Sign in** with Google OAuth
2. **Complete lessons** and mark as done
3. **Enable notifications** in `/progress` settings
   - Browser notifications work immediately ✅
   - Email notifications require Resend setup ⏳
4. **Receive reminders**:
   - Browser: When visiting site with lessons due
   - Email: Daily at 9 AM if lessons are due

## Current Limitations

- Email notifications require additional setup with Resend
- User preferences are stored in localStorage (browser-only)
- No database for persistent user settings across devices
- Cron job implementation is a placeholder

## Future Enhancements

- [ ] Add database support for user preferences
- [ ] Implement Resend email sending
- [ ] Add email frequency options (daily, weekly, custom)
- [ ] Weekly summary emails
- [ ] Parent email CC functionality
- [ ] Email templates with better styling
- [ ] Unsubscribe links in emails
- [ ] Email open/click tracking

## Troubleshooting

### Browser Notifications Not Working

- Check browser settings allow notifications
- Try in a different browser
- Ensure HTTPS (required for notifications)

### Email Notifications Not Working

- Verify `RESEND_API_KEY` is set correctly
- Check domain is verified in Resend
- Review Resend logs for errors
- Check `CRON_SECRET` matches in environment

### Cron Job Not Running

- Verify `vercel.json` is deployed
- Check Vercel cron job logs
- Ensure `CRON_SECRET` is set in Vercel environment

## Support

For issues or questions:
- Check the [Resend documentation](https://resend.com/docs)
- Review Vercel [cron jobs documentation](https://vercel.com/docs/cron-jobs)
- Open an issue in the project repository
