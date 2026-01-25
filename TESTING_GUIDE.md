# Testing Guide - Daily Streak & Rewards System

## Pre-requisites

Before testing, ensure:
- ✅ Application deployed to production (https://www.midssat.com)
- ✅ Database migration run in Supabase (008_streaks_and_badges.sql)
- ⚠️ **Must be logged in** - Features only work for authenticated users

## Quick Test Checklist

### 1. Visual Components Test (No Database Required)

**Header Components:**
- [ ] Visit homepage while logged in
- [ ] Check for flame icon 🔥 with streak count in header
- [ ] Check for badges button in header
- [ ] Click badges button - modal should open with grid

**Progress Page:**
- [ ] Navigate to `/progress` page
- [ ] Should see 3 cards in a grid:
  - Streak card (left)
  - Daily goals card (center)
  - Recent badges card (right)

### 2. Database Integration Test

**First Time User (New Streak):**

1. **Sign in** to the website
2. **Open browser console** (F12 → Console tab)
3. **Run test code** to simulate activity:

```javascript
// Test 1: Track flashcard session (should create streak)
fetch('/api/test-streak', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'flashcard', count: 5 })
})

// Or manually trigger tracking
import { trackFlashcardSession } from '@/lib/activity-tracker'
await trackFlashcardSession(5)
```

4. **Refresh the page** - you should see:
   - 🔥 "1 day" streak in header
   - Daily goals updated (+5 words reviewed)
   - "First Steps" badge earned 🌱

### 3. Manual Testing via Browser Console

Open browser console and run these commands to test the system:

#### Test Streak Creation
```javascript
// Import the functions (in browser console, you'll need to navigate to a page that imports them)
// Then check the Network tab to see API calls

// Alternative: Call the functions directly if you have them loaded
const { recordStudyActivity } = await import('/lib/streaks.ts')
await recordStudyActivity('vocabulary', 10)
```

#### Test Daily Goals
```javascript
const { updateDailyGoalProgress } = await import('/lib/streaks.ts')

// Update words reviewed
await updateDailyGoalProgress({
  words_reviewed_actual: 10
})

// Update study time
await updateDailyGoalProgress({
  minutes_studied_actual: 15
})

// Update questions answered
await updateDailyGoalProgress({
  questions_answered_actual: 5
})
```

### 4. End-to-End Integration Testing

**Test Activity Tracking in Real Features:**

#### A. Flashcard Test
1. Go to `/vocabulary/flashcards`
2. Review 5 flashcards
3. **Expected Result:**
   - Streak should update (or be created)
   - Daily goals: +5 words reviewed
   - If first activity: "First Steps" badge earned

#### B. Quiz Test
1. Go to `/vocabulary/quiz`
2. Complete a quiz with 5 questions
3. **Expected Result:**
   - Streak continues
   - Daily goals: +5 questions answered

#### C. Sentence Completion Test
1. Go to `/vocabulary/sentence-completion`
2. Complete 3 sentences
3. **Expected Result:**
   - Streak continues
   - Daily goals: +3 questions answered

#### D. Story Reading Test
1. Go to `/vocabulary/stories`
2. Generate and read a story
3. **Expected Result:**
   - Streak continues
   - Daily goals: +5 minutes studied (estimated)
   - Daily goals: +words reviewed (vocabulary words in story)

### 5. Streak Continuation Testing

**Day 2 Test (Next Day):**
1. Come back tomorrow
2. Complete any activity
3. **Expected Result:**
   - Streak increments from 1 → 2 days
   - New daily goals created for today
   - Previous day's goals marked as completed (if they were)

**Day 3 Test:**
1. Complete activity on day 3
2. **Expected Result:**
   - Streak → 3 days
   - "Getting Started" badge earned 🔥

**Day 7 Test:**
1. Keep streak alive for 7 days
2. **Expected Result:**
   - "Week Warrior" badge earned ⚡

### 6. Streak Break Testing

**Missing a Day:**
1. Don't log in for 2+ days
2. Come back and complete an activity
3. **Expected Result:**
   - Streak resets to 1
   - If previous streak was 3+: "Comeback Kid" badge earned 🔄
   - Longest streak preserved in stats

### 7. Badge Testing

**All Badge Milestones:**

| Badge | Requirement | Test Method |
|-------|-------------|-------------|
| 🌱 First Steps | First activity ever | Complete any activity as new user |
| 🔥 Getting Started | 3-day streak | Keep streak for 3 days |
| ⚡ Week Warrior | 7-day streak | Keep streak for 7 days |
| 💪 Two Week Champion | 14-day streak | Keep streak for 14 days |
| 🏆 Monthly Master | 30-day streak | Keep streak for 30 days |
| 📚 Vocabulary Starter | 100 words reviewed | Review 100 words total |
| ⏰ Time Investor | 10 hours studied | Study for 10 hours total |
| 🔄 Comeback Kid | Restart after break | Break streak, come back |
| ✨ Perfect Week | 7 days of completed goals | Complete all goals for 7 days |

### 8. Database Verification (Advanced)

**Check Supabase Tables Directly:**

1. Go to Supabase Dashboard → Table Editor
2. Check these tables:

**study_streaks:**
```sql
SELECT * FROM study_streaks WHERE user_id = 'YOUR_USER_ID';
```
- Should show current_streak, longest_streak, last_activity_date

**daily_goals:**
```sql
SELECT * FROM daily_goals WHERE user_id = 'YOUR_USER_ID'
ORDER BY goal_date DESC LIMIT 7;
```
- Should show daily progress for last 7 days

**user_badges:**
```sql
SELECT * FROM user_badges WHERE user_id = 'YOUR_USER_ID'
ORDER BY earned_at DESC;
```
- Should show all earned badges with timestamps

**streak_activities:**
```sql
SELECT * FROM streak_activities WHERE user_id = 'YOUR_USER_ID'
ORDER BY activity_date DESC LIMIT 10;
```
- Should show recent activities

### 9. UI Component Testing

**Streak Display (Header):**
- [ ] Shows flame icon when streak > 0
- [ ] Shows correct streak number
- [ ] Animated flame on active streak
- [ ] "Study today!" indicator when at risk

**Daily Goals Card:**
- [ ] Three progress bars (words, time, questions)
- [ ] Central circular progress ring (0-100%)
- [ ] Celebration message when all goals complete
- [ ] Real-time updates (refresh every 30s)

**Badges Modal:**
- [ ] Opens when clicking badges button
- [ ] Shows all badges in grid layout
- [ ] Category tabs work (All, Streak, Words, Time, etc.)
- [ ] Earned badges show date
- [ ] Locked badges show requirements
- [ ] Hover animations work

### 10. Performance Testing

**Page Load Speed:**
- [ ] Header components load quickly
- [ ] Progress page loads in < 2 seconds
- [ ] No console errors
- [ ] No layout shift

**Data Refresh:**
- [ ] Components auto-refresh every 30 seconds
- [ ] Manual refresh works (reload page)
- [ ] Real-time updates when activity tracked

### 11. Error Handling Testing

**No Database Connection:**
- [ ] Components don't crash
- [ ] Shows "0 days" or empty state
- [ ] Error logged to console only

**Not Logged In:**
- [ ] Streak components hidden in header
- [ ] Progress page shows login prompt
- [ ] No errors thrown

**Invalid Data:**
- [ ] Negative numbers ignored
- [ ] NaN values handled gracefully
- [ ] Empty responses handled

### 12. Mobile Testing

**Responsive Design:**
- [ ] Header streak display hidden on mobile (< 1024px)
- [ ] Progress page cards stack on mobile
- [ ] Badges modal works on mobile
- [ ] Touch interactions work

### 13. Cross-Browser Testing

Test on:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers

## Quick Test Script (Copy-Paste)

Run this in the browser console on any page while logged in:

```javascript
// Test complete activity tracking flow
async function testStreakSystem() {
  console.log('🧪 Testing Streak System...')

  // Test 1: Track flashcard session
  console.log('Test 1: Tracking flashcard session (5 cards)...')
  await fetch('/api/track-activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'flashcards',
      count: 5
    })
  })

  // Test 2: Check streak stats
  console.log('Test 2: Fetching streak stats...')
  const streakRes = await fetch('/api/streak-stats')
  const streakData = await streakRes.json()
  console.log('Streak:', streakData)

  // Test 3: Check daily goals
  console.log('Test 3: Fetching daily goals...')
  const goalsRes = await fetch('/api/daily-goals')
  const goalsData = await goalsRes.json()
  console.log('Daily Goals:', goalsData)

  // Test 4: Check badges
  console.log('Test 4: Fetching badges...')
  const badgesRes = await fetch('/api/badges')
  const badgesData = await badgesRes.json()
  console.log('Badges:', badgesData)

  console.log('✅ Testing complete! Check logs above.')
}

// Run tests
testStreakSystem()
```

## Expected Results Summary

After completing a few activities, you should see:

**Header:**
- 🔥 1-7+ day streak (depending on consistency)
- 🏆 X badges earned

**Progress Page:**
- Streak card showing current/longest streak
- Daily goals with partial or complete progress
- Recent badges section with earned badges

**Database:**
- `study_streaks` table has your entry
- `daily_goals` has entries for each day you studied
- `user_badges` has your earned badges
- `streak_activities` logs all your activities

## Troubleshooting

**No streak showing:**
- Check if database migration ran successfully
- Verify you're logged in (check Firebase auth)
- Check browser console for errors
- Verify Supabase RLS policies are active

**Activities not tracking:**
- Ensure tracking functions are called in components
- Check Network tab for failed API calls
- Verify Supabase connection is working

**Badges not appearing:**
- Check `user_badges` table in Supabase
- Verify badge requirements are met
- Look for JavaScript errors in console

## Next Steps After Testing

Once basic testing is complete:

1. **Integrate tracking** into all vocabulary features
2. **Monitor analytics** - which features users engage with most
3. **Gather feedback** - do users find it motivating?
4. **Iterate** - adjust goals, add badges, improve UX

---

**Testing completed by:** ___________
**Date:** ___________
**Issues found:** ___________
