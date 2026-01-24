# Daily Streak & Rewards System

## Overview

The Daily Streak & Rewards System encourages consistent study habits by tracking user activity, maintaining study streaks, setting daily goals, and awarding achievement badges.

## Features

### 1. Study Streaks 🔥
- Tracks consecutive days of study activity
- Shows current streak and longest streak
- Visual indicators when user needs to study today
- Streak freeze feature (for future implementation)

### 2. Daily Goals 🎯
- Three goal types:
  - **Words Reviewed**: Target vocabulary words (default: 10)
  - **Minutes Studied**: Time spent studying (default: 15 min)
  - **Questions Answered**: Quiz/practice questions (default: 5)
- Visual progress rings showing completion percentage
- Celebration when goals are completed
- Automatic goal creation each day

### 3. Achievement Badges 🏆
Categories:
- **Streak Badges**: 3, 7, 14, 30, 50, 100, 365 day streaks
- **Word Badges**: 100, 500, 1000 words reviewed
- **Time Badges**: 10h, 50h, 100h total study time
- **Milestone Badges**: First day, comeback kid, perfect week

### 4. Activity Tracking
Automatically tracks:
- Vocabulary reviews (flashcards, word lists)
- Quiz completions
- Sentence completion exercises
- Story reading
- General study time

## Database Schema

### Tables Created

#### `study_streaks`
- Stores user's current and longest streak
- Tracks last activity date
- Total study days
- Streak freeze status

#### `daily_goals`
- One record per user per day
- Goal targets and actual progress
- Completion status

#### `user_badges`
- Earned badges with timestamps
- Badge category and metadata

#### `streak_activities`
- Detailed log of daily activities
- Activity type and count

## Implementation Guide

### 1. Database Migration

Run the migration to create required tables:
```bash
# The migration file is in: supabase/migrations/008_streaks_and_badges.sql
# It will be automatically applied when you deploy to Supabase
```

### 2. Using the Streak API

```typescript
import { getStreakStats, recordStudyActivity } from '@/lib/streaks'

// Get user's streak information
const stats = await getStreakStats()
console.log(`Current streak: ${stats.currentStreak} days`)

// Record a study activity (automatically updates streak)
await recordStudyActivity('vocabulary', 5) // 5 vocabulary words reviewed
await recordStudyActivity('quiz', 10) // 10 quiz questions answered
```

### 3. Using the Activity Tracker (Recommended)

Instead of calling streak functions directly, use the activity tracker helpers:

```typescript
import {
  trackWordReview,
  trackQuizCompletion,
  trackSentenceCompletion,
  trackFlashcardSession,
  trackStoryReading,
} from '@/lib/activity-tracker'

// When user reviews flashcards
await trackFlashcardSession(10) // 10 cards reviewed

// When user completes a quiz
await trackQuizCompletion(5) // 5 questions answered

// When user finishes reading a story
await trackStoryReading(10) // spent 10 minutes
```

### 4. Displaying Streak Information

#### In Header (Mini Display)
```typescript
import { StreakDisplay } from '@/components/streak-display'

// In your header component
<StreakDisplay className="hidden lg:flex" />
```

#### Full Streak Card
```typescript
import { StreakCard } from '@/components/streak-display'

// On progress page or dashboard
<StreakCard />
```

#### Daily Goals
```typescript
import { DailyGoalsCard } from '@/components/daily-goals'

<DailyGoalsCard />
```

#### Badges
```typescript
import { BadgesButton, RecentBadges } from '@/components/badges-display'

// Button that opens badges dialog
<BadgesButton />

// Show recent badges
<RecentBadges />
```

## Integration Examples

### Example 1: Flashcard Component

```typescript
// In your flashcard review component
import { trackFlashcardSession } from '@/lib/activity-tracker'

const handleCardComplete = async () => {
  // Your existing logic
  setCurrentCard(currentCard + 1)

  // Track the activity
  await trackFlashcardSession(1)
}
```

### Example 2: Quiz Completion

```typescript
// When user submits a quiz
import { trackQuizCompletion } from '@/lib/activity-tracker'

const handleQuizSubmit = async (answers: Answer[]) => {
  // Calculate score
  const score = calculateScore(answers)

  // Track the activity
  await trackQuizCompletion(answers.length)

  // Show results
  setResults(score)
}
```

### Example 3: Vocabulary Review

```typescript
// When user marks a word as reviewed
import { trackWordReview } from '@/lib/activity-tracker'

const handleWordReview = async (wordId: string) => {
  // Your existing logic
  await markWordAsReviewed(wordId)

  // Track the activity
  await trackWordReview(1)
}
```

## Activity Types

| Type | When to Use |
|------|-------------|
| `vocabulary` | Flashcards, word lists, vocabulary drills |
| `quiz` | Multiple choice quizzes, practice tests |
| `sentence_completion` | Fill-in-the-blank sentence exercises |
| `flashcards` | Specifically flashcard review sessions |
| `story` | Reading AI-generated stories |
| `reading` | Reading comprehension passages |

## Badge System

### Streak Badges
- `streak_3` 🔥 - Getting Started (3 days)
- `streak_7` ⚡ - Week Warrior (7 days)
- `streak_14` 💪 - Two Week Champion
- `streak_30` 🏆 - Monthly Master
- `streak_50` 🌟 - Dedication Expert
- `streak_100` 💯 - Century Club
- `streak_365` 👑 - Year Legend

### Word Badges
- `words_100` 📚 - Vocabulary Starter
- `words_500` 📖 - Word Collector
- `words_1000` 🎓 - Vocabulary Master

### Time Badges
- `time_10h` ⏰ - Time Investor (10 hours)
- `time_50h` ⏳ - Dedicated Learner (50 hours)
- `time_100h` 🏅 - Study Marathon (100 hours)

### Milestone Badges
- `first_day` 🌱 - First Steps (completed first session)
- `comeback_kid` 🔄 - Restarted after breaking a streak
- `perfect_week` ✨ - Met daily goals for 7 days straight

## Best Practices

### 1. Track Activities Immediately
Call tracking functions right after the user completes an activity, not before.

### 2. Be Generous with Tracking
Even small activities count! A user reviewing 1 word is still progress.

### 3. Don't Track Passive Actions
Only track active learning:
- ✅ Completing a quiz
- ✅ Reviewing flashcards
- ✅ Reading a story
- ❌ Browsing word lists
- ❌ Opening a page
- ❌ Navigating menus

### 4. Handle Errors Gracefully
The tracking functions are already wrapped in try-catch blocks. If tracking fails, it won't break the user experience.

### 5. Show Streak Status
Display streak information prominently to motivate users:
- In the header (always visible)
- On the progress page (detailed view)
- In completion screens ("Great job! Keep your streak going!")

## Customization

### Adjusting Default Goals

Users can customize their daily goals. To set custom goals programmatically:

```typescript
import { createDailyGoal } from '@/lib/streaks'

await createDailyGoal({
  words_reviewed_goal: 20,  // 20 words instead of 10
  minutes_studied_goal: 30, // 30 minutes instead of 15
  questions_answered_goal: 10, // 10 questions instead of 5
})
```

### Adding New Badges

1. Add badge definition to `lib/streaks.ts`:
```typescript
export const BADGE_DEFINITIONS = {
  // ... existing badges
  my_new_badge: {
    badge_id: 'my_new_badge',
    badge_name: 'Badge Name',
    badge_description: 'What user did to earn it',
    badge_icon: '🎖️',
    badge_category: 'milestone',
  },
}
```

2. Award the badge when appropriate:
```typescript
import { awardBadge } from '@/lib/streaks'

// When condition is met
await awardBadge('my_new_badge')
```

## Testing

### Manual Testing Checklist

- [ ] User can see their streak in the header
- [ ] Streak increments when activity is recorded
- [ ] Daily goals update in real-time
- [ ] Badges are awarded at correct milestones
- [ ] Streak breaks after missing a day
- [ ] "Comeback kid" badge awarded after streak break
- [ ] Progress page shows all components correctly
- [ ] Works for anonymous users (no errors)
- [ ] Data persists after page refresh

### Test Scenarios

1. **New User**
   - Complete first activity
   - Should see "First Steps" badge
   - Should have 1-day streak

2. **Existing User - Continue Streak**
   - Last activity was yesterday
   - Complete activity today
   - Streak should increment by 1

3. **Existing User - Break Streak**
   - Last activity was 2+ days ago
   - Complete activity today
   - Streak should reset to 1
   - If previous streak was 3+, should get "Comeback Kid" badge

4. **Complete Daily Goals**
   - Review 10 words
   - Study for 15 minutes
   - Answer 5 questions
   - Progress rings should show 100%
   - Should see completion celebration

## Future Enhancements

### Potential Features
- Streak freeze power-ups (protect streak for 1 day)
- Weekly challenges
- Leaderboards (opt-in)
- Streak reminders via push notifications
- Social sharing of milestones
- Custom badge designs
- Streak recovery (paid feature)
- Parent/teacher dashboards
- Group challenges

### Gamification Ideas
- Combo multipliers for completing multiple activities in one session
- Bonus points for exceeding daily goals
- Seasonal badges (summer streak, holiday learner)
- Achievement trees (unlock advanced badges)
- Profile customization unlocked by badges

## Troubleshooting

### Streak not updating
- Check that user is logged in (streaks require authentication)
- Verify `recordStudyActivity()` is being called
- Check browser console for errors
- Confirm Supabase RLS policies are correct

### Badges not appearing
- Check that badge ID exists in `BADGE_DEFINITIONS`
- Verify user has met the requirements
- Look for errors in browser console
- Check Supabase `user_badges` table directly

### Daily goals not incrementing
- Ensure `updateDailyGoalProgress()` is called with correct parameters
- Check that numbers are positive
- Verify today's goal exists (created automatically on first activity)

## Support

For issues or questions about the streak system:
1. Check browser console for errors
2. Review this documentation
3. Check Supabase logs for database errors
4. Review the source code in `lib/streaks.ts`
