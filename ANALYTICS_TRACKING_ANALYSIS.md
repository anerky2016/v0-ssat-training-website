# User Analytics & Tracking - Comprehensive Analysis

**Date:** January 27, 2026
**Status:** ✅ **COMPREHENSIVE DATABASE TRACKING + BASIC WEB ANALYTICS**

---

## 📊 Executive Summary

The website has **excellent database-level tracking** with 21 Supabase tables capturing detailed learning analytics, plus dual web analytics (Google Analytics 4 + Umami). However, custom event tracking needs integration to bridge database insights with behavioral analytics.

**Current Capability Level: 6/10**
- Database Tracking: 9/10 (Comprehensive)
- Web Analytics: 4/10 (Basic page views only)
- Event Tracking: 2/10 (Minimal integration)
- Error Monitoring: 0/10 (None)

---

## ✅ What IS Being Tracked

### 1. Web Analytics Services

#### **Google Analytics 4** ✅
**File:** `components/google-analytics.tsx`
**Configuration:**
```typescript
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-4BYNVD1W19
```
**Status:** Integrated and active (production only)
**Tracking:** Automatic page views via gtag.js
**Limitations:** No custom events configured

#### **Umami Analytics** ✅
**File:** `app/layout.tsx:109`
**Configuration:**
```html
<script defer
  src="https://cloud.umami.is/script.js"
  data-website-id="61d8f68c-ffd1-4dd2-a1ac-68f4d4c3893f">
</script>
```
**Status:** Integrated and active (production only)
**Tracking:** Automatic page views
**Limitations:** No custom events

---

### 2. Database Tracking Tables (21 Tables)

#### **A. Study Activity Tracking**

**1. `study_sessions`** - Session-level tracking
```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_path TEXT,
  topic_title TEXT,
  category TEXT,
  duration_seconds INTEGER,
  problems_viewed INTEGER,
  difficulty TEXT,
  created_at TIMESTAMP
);
```
**Tracks:** Session duration, topics studied, problems viewed, difficulty level

**2. `lesson_completions`** - Completed lessons
```sql
CREATE TABLE lesson_completions (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_path TEXT NOT NULL,
  completed_at TIMESTAMP,
  review_count INTEGER DEFAULT 0,
  next_review_date DATE
);
```
**Tracks:** Lesson completion, review count, spaced repetition schedule

**3. `streak_activities`** - Daily activity log
```sql
CREATE TABLE streak_activities (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL, -- vocabulary, quiz, reading, flashcards, story, sentence_completion
  activity_count INTEGER DEFAULT 1,
  created_at TIMESTAMP
);
```
**Tracks:** Daily activity by type, activity counts
**Activity Types:**
- `vocabulary` - Word list reviews
- `quiz` - Quiz completions
- `reading` - Reading passages
- `flashcards` - Flashcard sessions
- `story` - Story reading
- `sentence_completion` - Sentence exercises

**4. `study_streaks`** - User streak data
```sql
CREATE TABLE study_streaks (
  id UUID PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE NOT NULL,
  total_study_days INTEGER DEFAULT 0,
  streak_frozen_until DATE NULL
);
```
**Tracks:** Current/longest streaks, total study days, freeze status

**5. `daily_goals`** - Daily goal tracking
```sql
CREATE TABLE daily_goals (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  goal_date DATE NOT NULL,
  words_reviewed_goal INTEGER DEFAULT 20,
  words_reviewed_actual INTEGER DEFAULT 0,
  minutes_studied_goal INTEGER DEFAULT 30,
  minutes_studied_actual INTEGER DEFAULT 0,
  questions_answered_goal INTEGER DEFAULT 10,
  questions_answered_actual INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP
);
```
**Tracks:** Daily goals progress (words, time, questions), completion status

---

#### **B. Quiz & Question Tracking**

**6. `sentence_completion_progress`** - Exercise tracking
```sql
CREATE TABLE sentence_completion_progress (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);
```
**Tracks:** Which sentence completion questions are completed

**7. `sentence_completion_mistakes`** - Error tracking
```sql
CREATE TABLE sentence_completion_mistakes (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP,
  reviewed BOOLEAN DEFAULT FALSE
);
```
**Tracks:** Mistakes made, correct vs user answers, review status
**Use Case:** Allows students to review and learn from mistakes

**8. `ssat_progress`** - SSAT practice tracking
```sql
CREATE TABLE ssat_progress (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_type TEXT NOT NULL, -- SYNONYM, ANALOGY
  completed_at TIMESTAMP
);
```
**Tracks:** SSAT question completion by type

---

#### **C. Vocabulary Tracking**

**9. `vocabulary_difficulty`** - Word difficulty ratings
```sql
CREATE TABLE vocabulary_difficulty (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL, -- 0=Wait, 1=Easy, 2=Medium, 3=Hard
  last_review_date TIMESTAMP,
  next_review_date TIMESTAMP,
  UNIQUE(user_id, word)
);
```
**Tracks:** User-specific word difficulty, review schedule
**Difficulty Levels:**
- 0 = Wait (Haven't learned yet)
- 1 = Easy (Know well)
- 2 = Medium (Need practice)
- 3 = Hard (Struggling)

**10. `vocabulary_difficulty_history`** - Historical changes
```sql
CREATE TABLE vocabulary_difficulty_history (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  old_difficulty INTEGER,
  new_difficulty INTEGER,
  changed_at TIMESTAMP
);
```
**Tracks:** Changes in word difficulty over time
**Use Case:** Measure learning progress, identify improvement patterns

**11. `vocabulary_review_schedule`** - Spaced repetition
```sql
CREATE TABLE vocabulary_review_schedule (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  review_count INTEGER DEFAULT 0,
  next_review_date TIMESTAMP NOT NULL,
  UNIQUE(user_id, word)
);
```
**Tracks:** SRS review schedule, review count
**Algorithm:** Spaced repetition based on forgetting curve

**12. `vocabulary_review_history`** - Review activity log
```sql
CREATE TABLE vocabulary_review_history (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  reviewed_at TIMESTAMP DEFAULT NOW(),
  difficulty_at_review INTEGER
);
```
**Tracks:** Word review timestamps, difficulty at time of review

**13. `vocabulary_memory_tips`** - User-created mnemonics
```sql
CREATE TABLE vocabulary_memory_tips (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  memory_tip TEXT NOT NULL,
  created_at TIMESTAMP,
  UNIQUE(user_id, word)
);
```
**Tracks:** Custom memory aids and mnemonics
**Use Case:** Personalized learning strategies

---

#### **D. Content Generation Tracking**

**14. `story_generation_history`** - AI story tracking
```sql
CREATE TABLE story_generation_history (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  story_text TEXT NOT NULL,
  words_used JSONB NOT NULL, -- Array of {word, level, meaning}
  story_length TEXT NOT NULL, -- short, medium, long
  story_type TEXT,
  story_subtype TEXT,
  character_count INTEGER,
  word_count INTEGER,
  generation_params JSONB,
  created_at TIMESTAMP
);
```
**Tracks:** Generated stories, words used, story parameters
**Use Case:** Track AI usage, story preferences, vocabulary exposure

---

#### **E. Gamification Tracking**

**15. `user_badges`** - Achievement tracking
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  badge_category TEXT NOT NULL, -- streak, words, time, accuracy, milestone
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```
**Tracks:** Badges earned, categories, timestamps
**Badge Categories:**
- Streak badges (3, 7, 14, 30 days)
- Word badges (100, 500, 1000 words)
- Time badges (10, 50 hours)
- Accuracy badges (perfect scores)
- Milestone badges (special achievements)

---

#### **F. User Management & Preferences**

**16. `user_login_logs`** - Login tracking (DISABLED)
```sql
CREATE TABLE user_login_logs (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  image TEXT,
  user_agent TEXT,
  ip_address TEXT,
  provider TEXT,
  provider_account_id TEXT,
  logged_in_at TIMESTAMP
);
```
**Status:** Table exists but tracking is **disabled** in code
**File:** `hooks/use-login-tracker.ts:7` (commented out)
**Reason:** Privacy considerations or performance

**17. `user_notification_preferences`** - Notification settings
```sql
CREATE TABLE user_notification_preferences (
  user_id TEXT PRIMARY KEY,
  daily_summary BOOLEAN DEFAULT TRUE,
  critical_alerts BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE
);
```
**Tracks:** User notification preferences

**18. `user_settings`** - User preferences
```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  settings JSONB NOT NULL DEFAULT '{}'
);
```
**Tracks:** General app settings (stored as JSON)

**19. `devices`** - Device management
```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  fcm_token TEXT UNIQUE NOT NULL,
  device_name TEXT,
  registered_at TIMESTAMP
);
```
**Tracks:** Device registration for push notifications

---

#### **G. Other Tracking**

**20. `notes`** - User notes with audio
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  note TEXT NOT NULL,
  audio_url TEXT,
  path TEXT,
  created_at TIMESTAMP
);
```
**Tracks:** User notes, audio recordings, associated paths

**21. `bookmarks`** - Bookmarked content
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_path TEXT NOT NULL,
  bookmarked_at TIMESTAMP,
  UNIQUE(user_id, topic_path)
);
```
**Tracks:** Bookmarked topics for quick access

---

### 3. Activity Tracking Functions

**File:** `lib/activity-tracker.ts`

**Available Functions:**
```typescript
// Word review tracking
export async function trackWordReview(wordCount: number = 1): Promise<void>

// Quiz completion tracking
export async function trackQuizCompletion(questionCount: number): Promise<void>

// Sentence completion tracking
export async function trackSentenceCompletion(questionCount: number): Promise<void>

// Flashcard session tracking
export async function trackFlashcardSession(cardCount: number = 1): Promise<void>

// Story reading tracking
export async function trackStoryReading(minutesSpent: number = 5): Promise<void>

// Reading comprehension tracking (prepared for Option 8)
export async function trackReadingCompletion(minutesSpent: number = 10): Promise<void>

// General study time tracking
export async function trackStudyTime(minutesSpent: number): Promise<void>

// Vocabulary-specific tracking
export async function trackVocabularyActivity(
  wordCount: number = 1,
  minutesSpent: number = 0
): Promise<void>
```

**Status:** Functions exist but need to be called from UI components

---

### 4. Progress Dashboard

**File:** `app/progress/page.tsx`

**Displays:**
- Study statistics (overall and by category)
- Recent session history (last 10 sessions)
- Most studied topics (top 5)
- Daily study calendar (heatmap)
- Lesson review schedule (upcoming reviews)
- Streak display (current/longest)
- Daily goals card (words/time/questions)
- Badge showcase (earned badges)
- Vocabulary word reviews (due words)

**Data Sources:**
- `study_sessions` table
- `lesson_completions` table
- `study_streaks` table
- `daily_goals` table
- `user_badges` table
- `vocabulary_review_schedule` table

---

## ❌ What IS NOT Being Tracked

### 1. User Interaction Events

**Missing:**
- ❌ Button clicks (quiz start, flashcard flip, audio play)
- ❌ Menu expansions and collapses
- ❌ Tab switches
- ❌ Tool usage (audio player, note-taking, bookmarks)
- ❌ Modal opens/closes
- ❌ Form submissions
- ❌ Filter and sort interactions
- ❌ Scroll depth
- ❌ Hover events
- ❌ Copy/paste actions

**Impact:** Cannot understand user behavior patterns or feature usage

### 2. Learning Analytics

**Missing:**
- ❌ Time to answer questions
- ❌ Question skip patterns
- ❌ Hint usage (if hints exist)
- ❌ Re-reading behavior
- ❌ Study session abandonment
- ❌ Topic difficulty perception vs actual performance
- ❌ Review effectiveness (did spaced repetition help?)
- ❌ Learning velocity (words learned per hour)
- ❌ Optimal study time patterns
- ❌ Plateau detection

**Impact:** Cannot optimize learning algorithms or provide personalized recommendations

### 3. Technical Metrics

**Missing:**
- ❌ Error tracking and exceptions
- ❌ Performance metrics (page load times)
- ❌ Core Web Vitals (LCP, FID, CLS)
- ❌ API response times
- ❌ Database query performance
- ❌ Network quality
- ❌ Browser/device breakdowns
- ❌ JavaScript errors
- ❌ Failed requests
- ❌ Offline behavior

**Impact:** Cannot identify and fix performance issues proactively

### 4. A/B Testing & Experiments

**Missing:**
- ❌ Feature flag system
- ❌ Variant assignment tracking
- ❌ Experiment analytics
- ❌ Conversion tracking
- ❌ Statistical significance testing

**Impact:** Cannot test new features scientifically

### 5. Marketing & Attribution

**Missing:**
- ❌ Traffic source tracking
- ❌ Campaign attribution (UTM parameters)
- ❌ Referral tracking
- ❌ Conversion funnels
- ❌ User acquisition costs
- ❌ Retention cohorts
- ❌ Churn prediction
- ❌ Lifetime value calculations

**Impact:** Cannot measure marketing effectiveness

### 6. Search & Discovery

**Missing:**
- ❌ Search queries
- ❌ Zero-result searches
- ❌ Search result clicks
- ❌ Navigation path analysis
- ❌ Dead ends (where users get stuck)
- ❌ Content discovery patterns

**Impact:** Cannot improve content findability

---

## 🔧 Integration Gaps

### Current Status: Database vs Analytics

**Database Tracking:** ✅ Excellent
- 21 tables with comprehensive data
- Well-structured schemas
- Row-level security
- Real-time capabilities

**Web Analytics Integration:** ⚠️ Minimal
- GA4 loaded but no custom events
- Umami loaded but no custom events
- Activity tracker functions not connected to analytics
- No event tracking in UI components

**The Gap:**
Database has rich data, but analytics platforms (GA4/Umami) only see page views. Need to bridge this gap by sending custom events.

---

## 💡 Enhancement Recommendations

### **Priority 1: Quick Wins (2-4 hours)**

#### 1. Connect Activity Tracker to GA4/Umami (2 hours)

**Modify:** `lib/activity-tracker.ts`

```typescript
// Add analytics event tracking to each function
export async function trackQuizCompletion(questionCount: number): Promise<void> {
  try {
    // Database tracking (existing)
    await recordStudyActivity('quiz', questionCount)
    await updateDailyGoalProgress({ questions_answered_actual: questionCount })

    // ADD: Web analytics tracking
    if (typeof window !== 'undefined') {
      // Google Analytics 4
      if (window.gtag) {
        window.gtag('event', 'quiz_completed', {
          event_category: 'engagement',
          event_label: 'quiz',
          value: questionCount
        })
      }

      // Umami
      if (window.umami) {
        window.umami.track('quiz_completed', {
          questions: questionCount
        })
      }
    }
  } catch (error) {
    console.error('Error tracking quiz completion:', error)
  }
}
```

**Impact:** Connect database tracking to web analytics for unified view

#### 2. Re-enable Login Tracking (30 minutes)

**Modify:** `hooks/use-login-tracker.ts`

Currently disabled (line 7):
```typescript
// Uncomment to enable login tracking
// trackUserLogin(user)
```

Change to:
```typescript
trackUserLogin(user)
```

**Impact:** Track user login patterns, device usage, authentication providers

#### 3. Add Key Interaction Events (2 hours)

**Add to components:**

```typescript
// Flashcard flip
onClick={() => {
  setFlipped(!flipped)
  window.gtag?.('event', 'flashcard_flip', { word: currentWord })
}}

// Audio play
onClick={() => {
  playAudio(text)
  window.gtag?.('event', 'audio_play', {
    text_type: 'word', // or 'definition', 'example'
    word: currentWord
  })
}}

// Story generation
onClick={async () => {
  generateStory()
  window.gtag?.('event', 'story_generated', {
    word_count: selectedWords.length,
    length: storyLength
  })
}}
```

**Impact:** Understand which features are most used

---

### **Priority 2: Enhanced Analytics (8-12 hours)**

#### 4. Learning Analytics Dashboard (6 hours)

**Create:** `app/admin/analytics/page.tsx`

**Features:**
- User engagement metrics
- Feature usage breakdown
- Learning effectiveness charts
- Mistake patterns analysis
- Spaced repetition effectiveness
- Study time optimization insights

**Data Sources:**
- Query all 21 tracking tables
- Aggregate statistics
- Trend analysis
- Cohort analysis

#### 5. Error Tracking Integration (2 hours)

**Add Sentry:**

```bash
npm install @sentry/nextjs
```

**Configure:** `sentry.config.js`

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter out PII
    return event
  }
})
```

**Impact:** Catch and fix errors before users report them

#### 6. Performance Monitoring (2 hours)

**Add Web Vitals Tracking:**

```typescript
// app/layout.tsx
import { onCLS, onFID, onLCP } from 'web-vitals'

export function reportWebVitals(metric) {
  window.gtag?.('event', metric.name, {
    value: Math.round(metric.value),
    event_category: 'Web Vitals',
    non_interaction: true,
  })
}

onCLS(reportWebVitals)
onFID(reportWebVitals)
onLCP(reportWebVitals)
```

**Impact:** Monitor and improve page performance

#### 7. Session Recording (Optional, 2 hours)

**Options:**
- Hotjar
- FullStory
- LogRocket

**Benefits:**
- Watch user sessions
- Identify UX issues
- Understand confusion points

**Privacy:** Requires careful PII handling

---

### **Priority 3: Advanced Features (20+ hours)**

#### 8. A/B Testing Framework (10 hours)

**Tools:**
- Split.io
- LaunchDarkly
- Custom feature flags

**Features:**
- Feature toggles
- Variant assignment
- Statistical analysis
- Gradual rollouts

#### 9. Real-time Analytics Dashboard (10 hours)

**Features:**
- Live user count
- Active study sessions
- Real-time goal completion
- Live leaderboard updates

**Tech:**
- Supabase real-time subscriptions
- WebSocket connections
- React Query for live data

#### 10. Predictive Analytics (20+ hours)

**Features:**
- Churn prediction
- Learning velocity forecasting
- Optimal study time recommendations
- Weak area identification
- Personalized study plans

**Tech:**
- Python ML models
- TensorFlow or scikit-learn
- API integration with Next.js

---

## 📊 Current Tracking Capability Matrix

| Category | Current State | Tracking Level | Priority to Enhance |
|----------|---------------|----------------|---------------------|
| **Study Activity** | 21 DB tables | 9/10 | Low (Already excellent) |
| **Page Views** | GA4 + Umami | 4/10 | Medium |
| **Custom Events** | Functions exist | 2/10 | **High** |
| **User Interactions** | None | 0/10 | **High** |
| **Learning Analytics** | Database only | 7/10 | Medium |
| **Error Tracking** | None | 0/10 | **High** |
| **Performance** | None | 0/10 | **High** |
| **A/B Testing** | None | 0/10 | Low |
| **Marketing Attribution** | None | 0/10 | Low |
| **Session Recording** | None | 0/10 | Low |

**Overall: 6/10** - Strong foundation, needs frontend integration

---

## 🎯 Quick Action Plan

### **This Week (4-6 hours):**
1. ✅ Connect activity tracker to GA4/Umami custom events
2. ✅ Re-enable login tracking
3. ✅ Add audio play event tracking
4. ✅ Add flashcard flip event tracking
5. ✅ Add story generation event tracking

### **Next 2 Weeks (8-10 hours):**
6. ✅ Integrate Sentry for error tracking
7. ✅ Add Web Vitals performance monitoring
8. ✅ Create admin analytics dashboard
9. ✅ Document tracking events for team

### **Next Month (Optional):**
10. ⏳ Evaluate session recording tools
11. ⏳ Consider A/B testing framework
12. ⏳ Build predictive analytics

---

## 📈 Expected ROI

### **Priority 1 Enhancements (4-6 hours):**
- **Cost:** 4-6 hours development
- **Benefit:** Unified analytics view, understand feature usage
- **ROI:** High (connects existing systems)

### **Priority 2 Enhancements (8-12 hours):**
- **Cost:** 8-12 hours development
- **Benefit:** Proactive error fixing, performance optimization, deep insights
- **ROI:** Medium-High (improves reliability and UX)

### **Priority 3 Enhancements (20+ hours):**
- **Cost:** 20+ hours development
- **Benefit:** Data-driven decisions, personalization, optimization
- **ROI:** Medium (long-term value)

---

## 🎉 Conclusion

### **Current State:**

**Strengths:**
- ✅ Comprehensive database tracking (21 tables)
- ✅ Excellent learning analytics foundation
- ✅ Sophisticated spaced repetition system
- ✅ Gamification tracking (streaks, badges, goals)
- ✅ Dual web analytics (GA4 + Umami)

**Gaps:**
- ⚠️ No custom event tracking in analytics
- ⚠️ No user interaction tracking
- ⚠️ No error monitoring
- ⚠️ Login tracking disabled

### **Recommendation:**

The website has an **excellent tracking foundation** that just needs **frontend integration**. Priority 1 enhancements (4-6 hours) will provide 80% of the value by connecting existing systems.

**Next Step:** Implement Priority 1 enhancements to bridge database tracking with web analytics platforms.

---

**Analysis Date:** January 27, 2026
**Capability Level:** 6/10 (Strong foundation, needs integration)
**Quick Win Opportunity:** 4-6 hours to reach 8/10 capability
