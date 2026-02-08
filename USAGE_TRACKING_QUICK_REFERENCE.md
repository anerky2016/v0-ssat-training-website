# Usage Tracking System - Quick Reference

## Key Findings at a Glance

### Current State
- **Status:** Partial tracking infrastructure already exists
- **Foundation:** Activity tracker + streak system ready to extend
- **Database:** Supabase PostgreSQL with RLS security
- **Auth:** Firebase + NextAuth hybrid system

### Existing Tracking (Working Today)
```
✓ User Logins (login_at, provider, user_agent)
✓ Study Streaks (current/longest, daily activity)
✓ Daily Goals (words/time/questions tracked)
✓ Vocabulary Reviews (SRS system with timing)
✓ Story Generation History (metadata logged)
✓ Badges/Achievements (auto-awarded on milestones)
✓ Device Management (multi-device tracking)
✓ Bookmarks & Notes (with timestamps)
```

### Key Metrics Already Available
- Days studied per user
- Words reviewed per session
- Quiz score tracking
- Time spent per activity
- Streak maintenance data
- Badge earn timing
- Login frequency & patterns

---

## Technology Stack at a Glance

```
Frontend          Backend              Database         Auth
├─ Next.js 14     ├─ API Routes        ├─ Supabase      ├─ Firebase
├─ React 18       ├─ OpenAI (GPT)      ├─ PostgreSQL    └─ NextAuth.js
├─ TypeScript     ├─ Volcengine TTS    └─ Row Security
├─ Tailwind CSS   └─ Firebase Admin
└─ Radix UI
```

---

## Database Schema (Tracking-Related)

### Core Tables for Usage Tracking

1. **user_login_logs** - Login events
   - What: user_id, email, provider, timestamp
   - Query: Track login patterns, device usage
   
2. **streak_activities** - Daily activity log
   - What: activity_type (vocabulary, quiz, story, etc.), count, date
   - Query: User engagement timeline, feature adoption
   
3. **daily_goals** - Progress toward daily targets
   - What: words_reviewed, minutes_studied, questions_answered
   - Query: Consistency metrics, goal completion rates
   
4. **vocabulary_review_history** - Spaced repetition log
   - What: word, difficulty, time_spent_seconds, was_recalled_correctly
   - Query: Learning velocity, mastery progress, weak words
   
5. **story_generation_history** - Story generation metadata
   - What: words_used (JSONB), story_type, generated_at
   - Query: Content preferences, engagement patterns
   
6. **study_streaks** - User streak statistics
   - What: current_streak, longest_streak, total_study_days
   - Query: Gamification effectiveness, retention metrics

---

## Quick Integration Checklist

### To Add Tracking to Any Feature:
1. Import: `import { trackFeatureName } from '@/lib/activity-tracker'`
2. Call on completion: `await trackFeatureName(parameter)`
3. Done! Automatically writes to database

### Example
```typescript
// Flashcards page
import { trackFlashcardSession } from '@/lib/activity-tracker'

// After user completes cards
await trackFlashcardSession(cardsReviewed)
```

### Available Tracking Functions
- `trackWordReview(count)` - Vocabulary reviews
- `trackQuizCompletion(count)` - Quiz answers
- `trackSentenceCompletion(count)` - Sentence exercises
- `trackFlashcardSession(count)` - Flashcard sessions
- `trackStoryReading(minutes)` - Story reading
- `trackReadingCompletion(minutes)` - Reading passages
- `trackVocabularyActivity(words, minutes)` - Combined

---

## Key Files for Tracking System

### Core Files
```
lib/activity-tracker.ts     (151 lines) - Tracking helper functions
lib/streaks.ts              (770 lines) - Gamification & rewards logic
lib/supabase.ts             (1,238 lines) - Database operations
app/progress/page.tsx       - Dashboard showing tracking data
supabase/migrations/008_*   - Database schema for streaks/badges
```

### Integration Points
```
app/vocabulary/flashcards/page.tsx       - Add tracking here
app/vocabulary/quiz/page.tsx             - Add tracking here
app/vocabulary/sentence-completion/*.tsx - Add tracking here
app/vocabulary/stories/page.tsx          - Add tracking here
```

---

## Recommended Tracking for Each Feature

### Vocabulary Flashcards
- Cards reviewed per session
- Time per card
- Flip count (engagement measure)
- Audio playback count

### Quiz Feature
- Questions answered
- Correct answers (%)
- Time per question
- Which topics weak

### Sentence Completion
- Attempts per question
- Answer selections
- Hint usage
- Time spent

### Stories
- Story type preferences
- Completion rate
- Re-reads
- Words selected

---

## Quick Reference: What to Track

### User Engagement (Daily)
- Active users (DAU, WAU)
- Session duration
- Features used
- Return rates

### Learning Progress (Weekly)
- Words studied
- Quiz scores
- Mastery achievements
- Weak areas

### Gamification (Real-time)
- Streak length
- Daily goal completion
- Badge earn rate
- Comeback returns

---

## Database Queries (Ready to Use)

### Get User's Today Activity
```sql
SELECT * FROM streak_activities
WHERE user_id = 'USER_ID' AND activity_date = CURRENT_DATE
```

### Get Streak Statistics
```sql
SELECT current_streak, longest_streak, total_study_days
FROM study_streaks
WHERE user_id = 'USER_ID'
```

### Get Vocabulary Mastery
```sql
SELECT word, review_count, was_recalled_correctly
FROM vocabulary_review_history
WHERE user_id = 'USER_ID'
ORDER BY reviewed_at DESC
LIMIT 100
```

### Get Daily Goal Progress
```sql
SELECT * FROM daily_goals
WHERE user_id = 'USER_ID' AND goal_date = CURRENT_DATE
```

---

## Implementation Phases

### Phase 1 (Immediate - 1-2 hours)
- Integrate tracking calls into vocabulary features
- Test end-to-end tracking
- Verify database writes

### Phase 2 (Short-term - 3-4 hours)
- Enhance activity tracker with detailed metadata
- Add page view tracking
- Implement session tracking

### Phase 3 (Medium-term - 6-8 hours)
- Build analytics dashboard
- Create metric visualizations
- Set up automated reports

### Phase 4 (Long-term - Ongoing)
- Monitor data quality
- Iterate on tracked metrics
- Optimize performance

---

## Security Checklist

- [ ] User privacy controls implemented
- [ ] RLS policies verified
- [ ] No sensitive data tracked
- [ ] GDPR compliance reviewed
- [ ] Data retention policy set
- [ ] Opt-out mechanism available

---

## Production Deployment

**Server:** Ubuntu 24.04.1 (205.198.69.199)  
**Process:** PM2 (midssat)  
**Build:** Local builds + rsync deployment  
**Status:** Online and healthy  

**Deploy Changes:**
1. Test locally: `npm run dev`
2. Build locally: `npm run build`
3. Deploy: `rsync -av .next user@server:path/`
4. Restart: `pm2 restart midssat`

---

## Common Patterns

### Track on Button Click
```typescript
const handleClick = async () => {
  // Do action
  await trackFlashcardSession(1)
}
```

### Track Completion
```typescript
const handleQuizComplete = async (score: number) => {
  // Complete quiz
  await trackQuizCompletion(questionCount)
}
```

### Track with Timing
```typescript
const startTime = Date.now()
// User does activity
const duration = Date.now() - startTime
await trackStoryReading(Math.round(duration / 1000 / 60))
```

---

## Resources

**Documentation:**
- Full Analysis: `USAGE_TRACKING_ANALYSIS.md`
- Status Report: `PROJECT_STATUS.md`
- Implementation: `IMPLEMENTATION_SUMMARY.md`

**Code Reference:**
- Activity Tracker: `lib/activity-tracker.ts`
- Streaks System: `lib/streaks.ts`
- Database Client: `lib/supabase.ts`

**Database:**
- Supabase Project: mmzilrfnwdjxekwyzmsr.supabase.co
- Tables: All in public schema with RLS

---

**Last Updated:** January 26, 2026  
**Next Action:** Integrate tracking into vocabulary features
