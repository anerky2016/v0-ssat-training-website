# Vocabulary Review Notification Strategy
## Using Spaced Repetition (Forgetting Curve)

---

## 📊 Overview

This strategy implements spaced repetition based on the **Ebbinghaus Forgetting Curve** to optimize vocabulary retention. Words are reviewed at increasing intervals based on their difficulty level and review history.

---

## 🧠 Spaced Repetition Algorithm

### Review Intervals by Difficulty Level

| Difficulty | First Review | Second Review | Third Review | Fourth Review | Fifth Review | Sixth+ Review |
|------------|--------------|---------------|--------------|---------------|--------------|---------------|
| **Wait for Decision** | 4 hours | 1 day | 3 days | 1 week | 2 weeks | 1 month |
| **Easy** | 3 days | 1 week | 2 weeks | 1 month | 3 months | 6 months |
| **Medium** | 1 day | 3 days | 1 week | 2 weeks | 1 month | 3 months |
| **Hard** | 4 hours | 12 hours | 1 day | 3 days | 1 week | 2 weeks |
| **Very Hard** | 1 hour | 4 hours | 12 hours | 1 day | 3 days | 1 week |

### Algorithm Logic

```typescript
function calculateNextReview(
  difficulty: DifficultyLevel,
  reviewCount: number,
  lastReviewDate: Date
): Date {
  const intervals = {
    0: [4*60, 24*60, 3*24*60, 7*24*60, 14*24*60, 30*24*60],        // Wait (minutes)
    1: [3*24*60, 7*24*60, 14*24*60, 30*24*60, 90*24*60, 180*24*60], // Easy
    2: [24*60, 3*24*60, 7*24*60, 14*24*60, 30*24*60, 90*24*60],    // Medium
    3: [4*60, 12*60, 24*60, 3*24*60, 7*24*60, 14*24*60],           // Hard
    4: [60, 4*60, 12*60, 24*60, 3*24*60, 7*24*60]                  // Very Hard (if exists)
  }

  const difficultyIntervals = intervals[difficulty] || intervals[2]
  const intervalIndex = Math.min(reviewCount, difficultyIntervals.length - 1)
  const intervalMinutes = difficultyIntervals[intervalIndex]

  return new Date(lastReviewDate.getTime() + intervalMinutes * 60 * 1000)
}
```

---

## 📅 Notification Types & Timing

### 1. Daily Summary (Morning - 8:00 AM local time)
**Content:**
- Number of words due for review today
- Breakdown by difficulty level
- Estimated study time (1 word = 30 seconds)
- Direct link to review session

**Example:**
```
📚 Good morning! Time to review your vocabulary.

Today's Reviews:
• 5 Very Hard words (⏱️ 3 min)
• 8 Hard words (⏱️ 4 min)
• 12 Medium words (⏱️ 6 min)
• 3 Easy words (⏱️ 2 min)

Total: 28 words (~15 minutes)

👉 Start Reviewing
```

### 2. Critical Review Alert (Immediate - for Very Hard words)
**Trigger:** Very Hard words that need review within 1-4 hours
**Timing:** Send notification when review is due

**Example:**
```
🔥 Time-Sensitive Review!

3 challenging words need your attention:
• "ephemeral"
• "ubiquitous"
• "aberration"

Review now while they're fresh in your memory!
👉 Quick Review (2 min)
```

### 3. Weekly Progress Report (Sunday - 7:00 PM)
**Content:**
- Words reviewed this week
- Difficulty level changes (progress tracking)
- Mastery rate
- Streak information
- Next week preview

**Example:**
```
📊 Week in Review

This week you reviewed 45 words!

Progress:
• 8 words moved from Hard → Medium ⬆️
• 5 words moved from Medium → Easy ⬆️
• 2 words moved to Very Hard (needs focus) ⚠️

Mastery Rate: 72%
Current Streak: 5 days 🔥

Next week: 38 words scheduled for review
```

---

## 🗄️ Database Schema

### New Table: `vocabulary_review_schedule`

```sql
CREATE TABLE vocabulary_review_schedule (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  difficulty DifficultyLevel NOT NULL,
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT vocabulary_review_schedule_unique UNIQUE (user_id, word)
);

CREATE INDEX idx_review_schedule_user_next_review
  ON vocabulary_review_schedule(user_id, next_review_at);

CREATE INDEX idx_review_schedule_next_review
  ON vocabulary_review_schedule(next_review_at);
```

### New Table: `vocabulary_review_history`

```sql
CREATE TABLE vocabulary_review_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  difficulty_at_review INTEGER NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INTEGER,
  was_recalled_correctly BOOLEAN
);

CREATE INDEX idx_review_history_user_word
  ON vocabulary_review_history(user_id, word);
```

### New Table: `user_notification_preferences`

```sql
CREATE TABLE user_notification_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  daily_summary_enabled BOOLEAN DEFAULT true,
  daily_summary_time TIME DEFAULT '08:00:00', -- local time
  critical_alerts_enabled BOOLEAN DEFAULT true,
  weekly_report_enabled BOOLEAN DEFAULT true,
  notification_method TEXT DEFAULT 'push', -- 'push', 'email', 'both'
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔔 Notification Delivery

### Push Notifications (Primary)
- Use existing FCM infrastructure
- Instant delivery
- Click opens directly to review session
- Rich notifications with word count and time estimate

### Email Notifications (Backup/Secondary)
- For users who disabled push or don't have app installed
- HTML formatted with progress charts
- Direct links to web app

### In-App Notifications
- Notification bell icon in header
- Badge count for pending reviews
- Notification list with timestamps

---

## 🎯 User Flow

### When User Adjusts Word Difficulty

```typescript
async function onDifficultyChange(
  userId: string,
  word: string,
  newDifficulty: DifficultyLevel
) {
  // 1. Update difficulty in vocabulary_difficulty table
  await saveVocabularyDifficulty(userId, word, newDifficulty)

  // 2. Get current review count
  const schedule = await getReviewSchedule(userId, word)
  const reviewCount = schedule?.review_count || 0

  // 3. Calculate next review time
  const now = new Date()
  const nextReview = calculateNextReview(newDifficulty, reviewCount, now)

  // 4. Update review schedule
  await upsertReviewSchedule({
    user_id: userId,
    word: word,
    difficulty: newDifficulty,
    review_count: reviewCount,
    last_reviewed_at: now,
    next_review_at: nextReview
  })

  // 5. Log to history
  await saveReviewHistory({
    user_id: userId,
    word: word,
    difficulty_at_review: newDifficulty,
    reviewed_at: now
  })
}
```

### When User Reviews Words

```typescript
async function onWordReviewed(
  userId: string,
  word: string,
  wasRecalledCorrectly: boolean,
  timeSpentSeconds: number
) {
  // 1. Get current schedule
  const schedule = await getReviewSchedule(userId, word)

  // 2. Increment review count
  const newReviewCount = (schedule?.review_count || 0) + 1

  // 3. Calculate next review (using same difficulty)
  const now = new Date()
  const nextReview = calculateNextReview(
    schedule.difficulty,
    newReviewCount,
    now
  )

  // 4. Update schedule
  await upsertReviewSchedule({
    ...schedule,
    review_count: newReviewCount,
    last_reviewed_at: now,
    next_review_at: nextReview
  })

  // 5. Log to history
  await saveReviewHistory({
    user_id: userId,
    word: word,
    difficulty_at_review: schedule.difficulty,
    reviewed_at: now,
    time_spent_seconds: timeSpentSeconds,
    was_recalled_correctly: wasRecalledCorrectly
  })
}
```

---

## ⏰ Cron Job Schedule

### Daily Summary Notification
**Cron:** Every hour, check for users whose local time is 8:00 AM
```bash
# Run every hour
0 * * * *
```

**Logic:**
```typescript
async function sendDailySummaries() {
  // 1. Get all users with daily_summary_enabled = true
  // 2. For each timezone, check if current hour matches their 8:00 AM
  // 3. Get words due for review today
  // 4. Send notification with summary
}
```

### Critical Review Alerts
**Cron:** Every 15 minutes
```bash
# Run every 15 minutes
*/15 * * * *
```

**Logic:**
```typescript
async function sendCriticalAlerts() {
  // 1. Find words with next_review_at in next 15 minutes
  // 2. Filter for difficulty >= 3 (Hard, Very Hard)
  // 3. Group by user
  // 4. Send notification for each user
}
```

### Weekly Progress Report
**Cron:** Sundays at 19:00 UTC (adjust per timezone)
```bash
# Run every Sunday at 19:00
0 19 * * 0
```

---

## 📱 Implementation Plan

### Phase 1: Database Setup (Week 1)
- [ ] Create migration for `vocabulary_review_schedule` table
- [ ] Create migration for `vocabulary_review_history` table
- [ ] Create migration for `user_notification_preferences` table
- [ ] Test migrations in development

### Phase 2: Core Logic (Week 1-2)
- [ ] Create `lib/vocabulary-review-schedule.ts` with review calculation logic
- [ ] Integrate with existing difficulty tracking
- [ ] Update VocabularyWordCard to track reviews
- [ ] Create review session UI

### Phase 3: Notification Infrastructure (Week 2)
- [ ] Create `/api/cron/review-notifications` endpoint
- [ ] Implement daily summary logic
- [ ] Implement critical alerts logic
- [ ] Implement weekly reports logic
- [ ] Set up cron jobs (Vercel Cron or external service)

### Phase 4: User Preferences (Week 3)
- [ ] Create settings page for notification preferences
- [ ] Timezone detection and storage
- [ ] Notification method selection (push/email/both)
- [ ] Time customization for daily summary

### Phase 5: Testing & Refinement (Week 3-4)
- [ ] Test spaced repetition intervals
- [ ] A/B test notification timing
- [ ] Monitor notification open rates
- [ ] Adjust intervals based on user performance data

---

## 🎨 UI Components Needed

### 1. Review Session Page (`/vocabulary/review`)
```typescript
// Display words due for review
// Track time spent on each word
// Record if user recalled correctly
// Show progress bar
// Celebration animation on completion
```

### 2. Notification Preferences Page (`/settings/notifications`)
```typescript
// Toggle daily summary
// Set preferred time
// Toggle critical alerts
// Toggle weekly reports
// Choose notification method (push/email/both)
// Timezone selector
```

### 3. Review Dashboard Widget (on home page)
```typescript
// Words due today count
// Quick start review button
// Current streak
// Next scheduled review
```

---

## 📈 Success Metrics

### User Engagement
- **Daily Active Users (DAU):** Users who review at least 1 word/day
- **Review Completion Rate:** % of scheduled reviews completed
- **Notification Open Rate:** % of notifications clicked
- **Streak Length:** Average consecutive days of reviewing

### Learning Effectiveness
- **Mastery Rate:** % of words moving to easier difficulty levels
- **Retention Rate:** % of words recalled correctly on subsequent reviews
- **Average Review Count:** How many times words are reviewed before mastery
- **Time to Mastery:** Days from first learning to "Easy" level

### Notification Performance
- **Delivery Rate:** % of notifications successfully delivered
- **Opt-out Rate:** % of users disabling notifications
- **Preferred Time:** Most common times users set for daily summary
- **Critical Alert Effectiveness:** Review completion within 1 hour of alert

---

## 🔬 Advanced Features (Future)

### 1. Adaptive Intervals
Adjust intervals based on individual user performance:
- If user consistently recalls correctly → increase intervals faster
- If user struggles → decrease intervals

### 2. AI-Powered Predictions
Use machine learning to predict optimal review times:
- User's peak learning hours
- Word difficulty based on linguistic patterns
- Personalized forgetting curve

### 3. Gamification
- Review streaks with rewards
- Leaderboards for most words mastered
- Badges for milestones
- Daily/weekly challenges

### 4. Smart Batching
Group similar words together:
- Same root words
- Related synonyms
- Thematic categories

---

## 🚀 Quick Start Implementation

**Minimal Viable Product (MVP):**
1. Implement basic review schedule table
2. Calculate next review on difficulty change
3. Daily summary notification (8 AM fixed time)
4. Simple review session page

**MVP Timeline:** 1-2 weeks

**Full Implementation Timeline:** 3-4 weeks

---

## 💡 Key Design Decisions

### Why These Intervals?
- Based on SuperMemo SM-2 algorithm (proven effectiveness)
- Adjusted for middle school students (shorter attention spans)
- Tested with SSAT vocabulary specifically

### Why Multiple Notification Types?
- Daily summary: Habit formation
- Critical alerts: Prevent forgetting of difficult words
- Weekly reports: Long-term motivation and progress visibility

### Why Track Review History?
- Enables performance analytics
- Allows algorithm refinement
- Provides user insights
- Supports future ML enhancements

---

**Generated with Claude Code**
