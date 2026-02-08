# Usage Tracking Implementation Map

## Feature-to-Database Mapping

### Vocabulary Flashcards
```
User Action                    What to Track              Database Table
───────────────────────────────────────────────────────────────────────
Card review                  → cardCount                 streak_activities
                             → timeSpent                 vocabulary_review_history
                             → accuracy                  vocabulary_review_history
Time on card                 → secondsPerCard            vocabulary_review_history
Audio playback               → audioPlayCount            (new: feature_usage)
Skip/Mastered button         → action                    (new: feature_usage)

Current Tracking:
✓ Via trackFlashcardSession(count)
✓ Recorded in: streak_activities, daily_goals

Enhancement Needed:
- Individual card timing
- Audio interaction tracking
- Skip/mastered patterns
```

### Quiz Feature
```
User Action                    What to Track              Database Table
───────────────────────────────────────────────────────────────────────
Answer submission            → questionCount             streak_activities
                             → correctCount              daily_goals
                             → accuracy %               (new: quiz_performance)
                             → timePerQuestion          (new: quiz_performance)
Hint usage                   → hintsUsed                (new: quiz_performance)
Category selected            → category                 (new: quiz_performance)

Current Tracking:
✓ Via trackQuizCompletion(count)
✓ Recorded in: streak_activities, daily_goals

Enhancement Needed:
- Answer correctness percentage
- Individual question timing
- Hint interaction patterns
- Question difficulty vs accuracy
```

### Sentence Completion
```
User Action                    What to Track              Database Table
───────────────────────────────────────────────────────────────────────
Attempt submission           → attemptCount             streak_activities
                             → correctAttempts          daily_goals
Time per question            → secondsPerQuestion       (new: sentence_completion_log)
Hint requests                → hintsUsed                (new: sentence_completion_log)
Answer patterns              → selectedWords            (new: sentence_completion_log)

Current Tracking:
✓ Via trackSentenceCompletion(count)
✓ Recorded in: streak_activities, daily_goals

Enhancement Needed:
- Per-question timing
- Hint usage patterns
- Correct vs incorrect answer tracking
- Difficulty analysis
```

### Story Generation & Reading
```
User Action                    What to Track              Database Table
───────────────────────────────────────────────────────────────────────
Story generated              → wordsUsed                story_generation_history
                             → storyType                story_generation_history
                             → storyLength              story_generation_history
Story reading started        → startTime               (new: story_reading_session)
Story reading completed      → completionRate          (new: story_reading_session)
Time reading                 → minutesSpent             daily_goals
Story revisit                → revisitCount            (new: story_reading_session)
Audio playback               → audioUsed               (new: story_reading_session)

Current Tracking:
✓ Via trackStoryReading(minutes)
✓ Story metadata in: story_generation_history
✓ Recorded in: daily_goals

Enhancement Needed:
- Session start/end tracking
- Completion percentage
- Re-read tracking
- Audio interaction
- Story preference analysis
```

### Word Lists & Browsing
```
User Action                    What to Track              Database Table
───────────────────────────────────────────────────────────────────────
List accessed                → listType                (new: feature_usage)
Filter applied               → filterType              (new: feature_usage)
Sort order selected          → sortOrder               (new: feature_usage)
Word clicked                 → wordId                  (new: word_interaction)
Word details viewed          → detailsViewed           (new: word_interaction)
Audio pronunciation          → audioPlayed             (new: word_interaction)

Current Tracking:
✗ No tracking currently

Enhancement Needed:
- Feature entry point tracking
- Filter/sort preference analysis
- Word browsing patterns
- Detail view tracking
- Audio feature adoption
```

### Review Session (Spaced Repetition)
```
User Action                    What to Track              Database Table
───────────────────────────────────────────────────────────────────────
Session started              → sessionStartTime         (calculated)
Word reviewed                → reviewCount              vocabulary_review_history
Recall correct               → wasRecalled              vocabulary_review_history
Time spent on word           → secondsSpent             vocabulary_review_history
Difficulty changed           → newDifficulty            vocabulary_difficulty

Current Tracking:
✓ Comprehensive tracking in vocabulary_review_history
✓ Difficulty tracked in vocabulary_difficulty

Enhancement Needed:
- Session duration calculation
- Review completion rate
- Learning velocity metrics
- Weakness identification
```

---

## Database Enhancement Proposal

### New Tables to Consider

#### feature_usage
```sql
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature TEXT NOT NULL,  -- 'flashcards', 'quiz', 'stories', etc.
  action TEXT NOT NULL,   -- 'opened', 'completed', 'abandoned'
  metadata JSONB,         -- Additional data
  timestamp TIMESTAMP,
  session_id TEXT
);
```

#### quiz_performance
```sql
CREATE TABLE quiz_performance (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id TEXT,
  question_count INTEGER,
  correct_count INTEGER,
  accuracy_percentage DECIMAL,
  time_spent_seconds INTEGER,
  hints_used INTEGER,
  category TEXT,
  completed_at TIMESTAMP
);
```

#### sentence_completion_log
```sql
CREATE TABLE sentence_completion_log (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT,
  attempts INTEGER,
  correct_attempts INTEGER,
  hints_used INTEGER,
  time_spent_seconds INTEGER,
  completed_at TIMESTAMP
);
```

#### story_reading_session
```sql
CREATE TABLE story_reading_session (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  story_id TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  completion_percentage DECIMAL,
  audio_used BOOLEAN,
  is_reread BOOLEAN,
  session_duration_seconds INTEGER
);
```

#### word_interaction
```sql
CREATE TABLE word_interaction (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  interaction_type TEXT,  -- 'view', 'audio', 'pronunciation'
  timestamp TIMESTAMP,
  session_id TEXT
);
```

---

## Implementation Timeline

### Week 1: Integration Phase
```
Monday:    Add tracking to flashcards page
Tuesday:   Add tracking to quiz page
Wednesday: Add tracking to sentence completion
Thursday:  Add tracking to stories
Friday:    Test end-to-end, verify database writes
```

### Week 2: Enhancement Phase
```
Monday:    Design event tracking schema
Tuesday:   Create user_events table
Wednesday: Implement event batching/deduplication
Thursday:  Add session tracking
Friday:    Performance testing
```

### Week 3: Dashboard Phase
```
Monday:    Design dashboard layout
Tuesday:   Implement metric calculations
Wednesday: Build visualizations
Thursday:  Add filter/sort capabilities
Friday:    Deploy and test
```

### Week 4: Optimization Phase
```
Ongoing:   Monitor performance
           Gather user feedback
           Iterate on tracked metrics
           Generate automated reports
```

---

## Code Integration Points

### Flashcards Page
**File:** `/app/vocabulary/flashcards/page.tsx`

```typescript
// After card review
const handleCardComplete = async () => {
  await trackFlashcardSession(cardsReviewed)
  // Future: Add detailed tracking
  // await trackFlashcardInteraction({
  //   cardCount: 1,
  //   timeSpent: endTime - startTime,
  //   audioPlayed: true/false
  // })
}
```

### Quiz Page
**File:** `/app/vocabulary/quiz/page.tsx`

```typescript
// After quiz completion
const handleQuizSubmit = async () => {
  await trackQuizCompletion(questionsAnswered)
  // Future: Add detailed tracking
  // await trackQuizPerformance({
  //   correctCount,
  //   accuracy: (correctCount / total) * 100,
  //   timePerQuestion,
  //   hintsUsed
  // })
}
```

### Sentence Completion
**File:** `/app/vocabulary/sentence-completion/page.tsx`

```typescript
// After answer submission
const handleAnswer = async () => {
  await trackSentenceCompletion(1)
  // Future: Add detailed tracking
  // await trackSentenceAttempt({
  //   questionId,
  //   attempt: 1,
  //   correct: isCorrect,
  //   hintsUsed
  // })
}
```

### Stories
**File:** `/app/vocabulary/stories/page.tsx`

```typescript
// After story view
const handleStoryView = async () => {
  await trackStoryReading(minutesSpent)
  // Future: Add detailed tracking
  // await trackStorySession({
  //   storyId,
  //   completionRate: 100,
  //   audioUsed: true
  // })
}
```

---

## Metrics Dashboard Wireframe

```
┌─ Usage Tracking Dashboard ─────────────────────────────────┐
│                                                              │
│  Date Range: [Last 7 Days ▼]      Export | Share            │
│                                                              │
│  ┌─ Engagement Metrics ─────────────────────────────────┐  │
│  │  Active Users: 156    Session Avg: 42min              │  │
│  │  Feature Usage:                                        │  │
│  │  ├─ Flashcards:  62%  ├─ Quiz: 38%  ├─ Stories: 28%  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Learning Progress ──────────────────────────────────┐  │
│  │  Words Studied: 234    Avg Mastery: 67%               │  │
│  │  [Line chart: Words per day trend]                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Gamification ───────────────────────────────────────┐  │
│  │  Avg Streak: 5.2 days    Goal Completion: 63%         │  │
│  │  Top Badge: Week Warrior (34 users)                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Performance by Feature ─────────────────────────────┐  │
│  │  Feature        | Sessions | Avg Time | Completion %  │  │
│  │  Flashcards     | 1,243    | 12 min   | 89%           │  │
│  │  Quiz           | 843      | 8 min    | 76%           │  │
│  │  Sentence Comp  | 567      | 6 min    | 82%           │  │
│  │  Stories        | 423      | 15 min   | 91%           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

### Unit Testing
- [ ] Tracking function returns successfully
- [ ] Database write is idempotent
- [ ] Error handling works
- [ ] No tracking on errors

### Integration Testing
- [ ] Flashcard tracking works end-to-end
- [ ] Quiz tracking captures all metrics
- [ ] Sentence completion tracking accurate
- [ ] Story tracking records metadata
- [ ] Data appears in Supabase tables
- [ ] RLS policies enforced correctly

### Performance Testing
- [ ] Tracking doesn't impact page load time
- [ ] Async operations don't block UI
- [ ] Database queries remain fast
- [ ] No memory leaks
- [ ] Bulk operations complete in <5s

### Analytics Testing
- [ ] Dashboard loads correctly
- [ ] Metrics calculate accurately
- [ ] Filters work as expected
- [ ] Exports generate valid data
- [ ] Visualizations render properly

---

## Key Files Summary

### Tracking Files
- `lib/activity-tracker.ts` (151 lines) - Ready-to-use functions
- `lib/streaks.ts` (770 lines) - Gamification system
- `lib/supabase.ts` (1,238 lines) - Database operations

### Integration Files
- `app/vocabulary/flashcards/page.tsx` - Add tracking here
- `app/vocabulary/quiz/page.tsx` - Add tracking here
- `app/vocabulary/sentence-completion/page.tsx` - Add tracking here
- `app/vocabulary/stories/page.tsx` - Add tracking here

### Dashboard Files
- `app/progress/page.tsx` - Extend with tracking analytics
- (New) `app/analytics/page.tsx` - Build analytics dashboard

### Database
- `supabase/migrations/008_streaks_and_badges.sql` - Current schema
- (New) `supabase/migrations/009_usage_tracking_enhancements.sql` - New tables

---

## Success Metrics

### Coverage
- [ ] 80%+ of user interactions tracked
- [ ] All feature entry points captured
- [ ] Completion/abandonment visible
- [ ] Learning outcomes measurable

### Quality
- [ ] Zero tracking-related errors
- [ ] No performance impact
- [ ] Data consistency validated
- [ ] Privacy policies implemented

### Value
- [ ] Actionable insights visible
- [ ] User behavior understood
- [ ] Learning patterns identified
- [ ] Improvements guided by data

---

**Document Version:** 1.0  
**Last Updated:** January 26, 2026  
**Status:** Ready for Implementation  
**Next Action:** Begin Week 1 integration phase
