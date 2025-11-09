# Vocabulary Review Notifications Setup Guide

This guide explains how to set up the external cron service for vocabulary review notifications that survives server restarts and redeployments.

---

## 🎯 Why External Cron Service?

**Problem with Server-Based Crons:**
- Server restarts/redeployments reset timers
- Serverless platforms (Vercel, Netlify) have unreliable cron execution
- Docker container restarts lose scheduled jobs

**Solution: External Cron Service:**
- ✅ Independent of server lifecycle
- ✅ Reliable scheduling even during deployments
- ✅ Easy monitoring and management
- ✅ Free tiers available

---

## 📋 Prerequisites

1. Application deployed and accessible via HTTPS
2. Environment variable `CRON_SECRET_TOKEN` set (for authentication)
3. Firebase Cloud Messaging (FCM) configured
4. Supabase migration 006 applied (review scheduling tables)

---

## 🔧 Step 1: Configure Environment Variables

Add to your `.env.local` and production environment:

```bash
# Generate a secure random token
CRON_SECRET_TOKEN=your-super-secret-random-token-here-min-32-chars
```

**Generate a secure token:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🌐 Step 2: Choose a Cron Service

### Option A: PM2 on Ubuntu Server (⭐ RECOMMENDED)

**Pros:**
- Full control over your infrastructure
- No external dependencies
- Faster execution (local network)
- Better logging and monitoring
- Free (no service limits)
- Survives server restarts

**Setup:**
See detailed guide: [PM2 Cron Setup](./PM2_CRON_SETUP.md)

**Quick Start:**
```bash
# On your Ubuntu server
cd /home/ubuntu/ssat-cron
pm2 start ecosystem.config.js
pm2 save
```

---

### Option B: cron-job.org (External Service - Free)

**Pros:**
- Free forever
- Reliable
- Easy to use
- Email notifications on failures
- Up to 1 request per minute

**Setup:**
1. Go to https://cron-job.org
2. Create a free account
3. Click "Create Cronjob"

### Option C: EasyCron (Free Tier)

**Pros:**
- Free tier: 250 cron jobs/month
- Good UI
- Logs and monitoring

**Setup:**
1. Go to https://www.easycron.com
2. Sign up for free account
3. Add new cron job

### Option D: Uptime Robot (Free Monitors)

**Pros:**
- Primary use: monitoring
- Can trigger URLs every 5 minutes
- Free tier: 50 monitors

**Setup:**
1. Go to https://uptimerobot.com
2. Create free account
3. Add HTTP(S) monitor

---

## ⚙️ Step 3: Configure Cron Jobs

### Job 1: Daily Summary Notification

**Purpose:** Send daily review reminders at 8:00 AM

**URL:**
```
https://your-domain.com/api/cron/vocabulary-review-notifications?token=YOUR_CRON_SECRET_TOKEN
```

**Schedule:**
- **Frequency:** Daily
- **Time:** 08:00 AM (8:00)
- **Timezone:** Your users' primary timezone (e.g., America/New_York)
- **Method:** GET
- **Expected Response:** HTTP 200

**cron-job.org format:**
```
0 8 * * *
```

**Configuration Example (cron-job.org):**
```
Title: SSAT Vocabulary Daily Review
URL: https://your-domain.com/api/cron/vocabulary-review-notifications?token=YOUR_SECRET
Schedule: 0 8 * * *
Enabled: ✓
```

### Job 2: Critical Review Alerts (Optional)

**Purpose:** Send alerts for Hard words every 15 minutes

**URL:**
```
https://your-domain.com/api/cron/vocabulary-review-notifications?token=YOUR_CRON_SECRET_TOKEN
```

**Schedule:**
- **Frequency:** Every 15 minutes
- **Time:** */15 * * * *
- **Method:** GET

**Note:** Only enable this if you want frequent notifications. It will only notify users with hard words due.

---

## 🔐 Step 4: Secure the Endpoint

The API endpoint is secured with a secret token. Configure the cron service to include authentication:

### Method 1: URL Query Parameter (Easiest)
```
https://your-domain.com/api/cron/vocabulary-review-notifications?token=YOUR_SECRET
```

### Method 2: Authorization Header (More Secure)
```
Header: Authorization: Bearer YOUR_SECRET
URL: https://your-domain.com/api/cron/vocabulary-review-notifications
```

**For cron-job.org with headers:**
1. Click "Advanced" when creating job
2. Add custom header:
   - Name: `Authorization`
   - Value: `Bearer YOUR_CRON_SECRET_TOKEN`

---

## 📊 Step 5: Monitor and Test

### Test the Endpoint Manually

```bash
# Test with curl
curl "https://your-domain.com/api/cron/vocabulary-review-notifications?token=YOUR_SECRET"

# Expected response:
{
  "success": true,
  "message": "Sent X notifications",
  "wordsDue": 25,
  "usersWithDueWords": 3,
  "notificationsSent": 3,
  "duration": "1234ms"
}
```

### Monitor in Production

**Check Application Logs:**
```
🔔 [Cron] Starting vocabulary review notifications...
📊 [Cron] Found 25 words due for review
👥 [Cron] 3 users have words due
✅ [Cron] Sent notification to user abc123... (8 words)
🎉 [Cron] Completed in 1234ms
📊 [Cron] Results: 3/3 notifications sent
```

**Set up Alerts:**
1. Enable email notifications in cron service
2. Alert on HTTP status != 200
3. Alert on execution failure

---

## 🎛️ Notification Behavior

The endpoint will:

1. **Query Supabase** for words where `next_review_at <= NOW()`
2. **Group by user** - one notification per user
3. **Prioritize Hard words** - different message for challenging words
4. **Include statistics** - word count, difficulty breakdown, estimated time
5. **Send via FCM** - to all user's active devices
6. **Skip users without tokens** - no notification sent

### Sample Notifications

**Normal Review:**
```
Title: 📚 Time to review 12 vocabulary words!
Body: 3 Easy, 5 Medium, 4 Wait · ~6 min
```

**Critical Review (with Hard words):**
```
Title: 🔥 8 vocabulary words need your attention!
Body: 5 Hard, 3 Medium · ~4 min
```

---

## 🔧 Troubleshooting

### Issue: "Unauthorized" Error

**Cause:** Token mismatch
**Solution:**
1. Verify `CRON_SECRET_TOKEN` in production environment
2. Check URL encoding of token in cron service
3. Ensure no extra spaces in token

### Issue: No Notifications Sent

**Possible Causes:**
1. No words are due for review
2. Users don't have FCM tokens registered
3. FCM tokens are inactive

**Check Logs:**
```
⏭️ [Cron] No active tokens for user abc123...
```

**Solutions:**
1. Verify users have marked words with difficulty
2. Check FCM token registration in `fcm_tokens` table
3. Ensure notification permissions granted on device

### Issue: Timeout Errors

**Cause:** Too many users/words to process
**Solution:**
1. Increase cron timeout if possible
2. Batch process users (implement pagination)
3. Add `VERCEL_MAX_DURATION=60` for Vercel

---

## 📈 Scaling Considerations

### For 100+ Users

- **Batch Processing:** Process users in chunks
- **Rate Limiting:** Add delays between FCM calls
- **Dedicated Endpoint:** Separate endpoints for daily vs. critical alerts

### For 1000+ Users

- **Queue System:** Use Redis/BullMQ for job queue
- **Multiple Workers:** Parallel processing
- **Database Indexing:** Ensure indexes on `next_review_at`

---

## 🧪 Testing Schedule

### Local Testing

```bash
# Set environment variable
export CRON_SECRET_TOKEN="test-secret-123"

# Start dev server
npm run dev

# Test endpoint
curl "http://localhost:3001/api/cron/vocabulary-review-notifications?token=test-secret-123"
```

### Staging Environment

1. Deploy to staging
2. Set `CRON_SECRET_TOKEN` in staging environment
3. Create test cron job pointing to staging URL
4. Verify notifications arrive

---

## 📝 Maintenance Checklist

**Monthly:**
- [ ] Review cron execution logs
- [ ] Check notification delivery rates
- [ ] Verify no timeout errors
- [ ] Monitor FCM token count

**Quarterly:**
- [ ] Rotate `CRON_SECRET_TOKEN`
- [ ] Review and optimize review intervals
- [ ] Analyze user engagement with notifications

---

## 🎯 Success Metrics

Track these metrics to measure notification effectiveness:

- **Delivery Rate:** % of cron executions that succeed
- **Notification Open Rate:** % of notifications clicked
- **Review Completion Rate:** % of due words reviewed within 24 hours
- **User Opt-out Rate:** % of users disabling notifications

---

## 🔗 Related Documentation

- [Vocabulary Review Notification Strategy](./VOCABULARY_REVIEW_NOTIFICATION_STRATEGY.md)
- [Firebase Cloud Messaging Setup](../README.md#firebase-cloud-messaging)
- [Supabase Migrations](../supabase/README.md)

---

**Generated with Claude Code**
