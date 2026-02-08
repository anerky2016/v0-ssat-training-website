# SSAT Training Website - Usage Tracking System Analysis

**Date:** January 26, 2026  
**Project:** midssat.com - SSAT Middle School Training Platform  
**Thoroughness Level:** Medium  
**Status:** Live in Production (https://www.midssat.com)

---

## EXECUTIVE SUMMARY

The SSAT training website is a **Next.js application** built with **Supabase (PostgreSQL)** for data persistence and **Firebase** for user authentication. The platform is feature-rich with existing gamification, activity tracking, and comprehensive vocabulary tools.

**Key Finding:** A **partial usage tracking infrastructure already exists** through the activity tracker and streak system. You can build upon this foundation rather than starting from scratch.

---

## 1. EXISTING FEATURES

### Core Learning Features

#### Vocabulary System (Primary Focus)
- **Flashcards** (`/app/vocabulary/flashcards`) - Interactive card review with audio pronunciation
- **Word Lists** (`/app/vocabulary/word-lists`) - Organized vocabulary by difficulty and letters
- **Quiz** (`/app/vocabulary/quiz`) - Interactive quizzes on vocabulary words
- **Sentence Completion** (`/app/vocabulary/sentence-completion`) - Grammar and word usage exercises
  - Includes `history` and `review` sub-pages
- **Stories** (`/app/vocabulary/stories`) - AI-generated vocabulary stories using OpenAI GPT
- **Review Session** (`/app/vocabulary/review-session`) - Spaced repetition review mode

#### Supporting Features
- **Math Exercises** (`/app/math`) - Multiple math topics (fractions, geometry, integers, equations, etc.)
- **Reading & Verbal** (`/app/verbal`, `/app/math/tests`)
- **Notes & Bookmarks** - User-generated study notes
- **Progress Dashboard** (`/app/progress`) - Comprehensive progress tracking

### Engagement & Gamification Features (Recently Implemented)

#### Daily Streak & Rewards System
- **Streaks Tracking** - Consecutive day tracking with flame icon
- **Daily Goals** - Three types:
  - Words Reviewed (default: 10)
  - Minutes Studied (default: 15)
  - Questions Answered (default: 5)
- **15 Achievement Badges** across 5 categories:
  - Streak badges (3-365 days)
  - Word collection badges (100-1,000 words)
  - Time badges (10-100 hours)
  - Milestone badges (first day, comeback, perfect week)
- **Visible in:** Header (compact display) and Progress page (full card)

#### AI-Powered Features
- **TTS (Text-to-Speech)** - Professional pronunciation audio via Volcengine BigTTS
- **Memory Tips** - AI-generated memory aids (OpenAI GPT-4-mini)
- **Story Generation** - Context-rich vocabulary stories
- **Quiz Explanations** - Answer explanations

---

## 2. USER AUTHENTICATION & DATA MODEL

### Authentication System
**Provider:** Firebase Auth + NextAuth.js (hybrid)

**Methods Supported:**
1. **Google OAuth** - Primary authentication method
2. **Email/Password** - Firebase authentication
3. **NextAuth Integration** - For credentials-based auth

**Key Files:**
- `lib/firebase.ts` - Firebase app initialization
- `lib/firebase-auth.ts` - Auth helper functions
- `lib/firebase-admin.ts` - Server-side auth
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration

**User Session:**
- Authenticated via Firebase token
- User ID stored as TEXT in database (email or UID)
- Session management via context (`contexts/firebase-auth-context`)
- Login events tracked in Supabase `user_login_logs` table

---

## 3. DATABASE & STORAGE ARCHITECTURE

### Current Database Solution: **Supabase (PostgreSQL)**

#### Primary Tables (With Usage Tracking Capability)

**Login Tracking:**
```
user_login_logs
├── user_id (TEXT)
├── email (TEXT)
├── name (TEXT)
├── login_at (TIMESTAMP)
├── provider (TEXT) - 'google' or 'credentials'
└── ip_address, user_agent
```

**Study Sessions (Existing but Optional):**
```
study_sessions
├── user_id
├── topic_path / topic_title
├── duration (minutes)
├── problems_viewed
└── timestamp
```

**Lesson Completions:**
```
lesson_completions
├── user_id
├── topic_path
├── completion_timestamp
├── review_count
└── next_review_date
```

**Gamification Tables (Newly Added):**
```
study_streaks
├── user_id
├── current_streak
├── longest_streak
├── last_activity_date
└── total_study_days

daily_goals
├── user_id
├── goal_date
├── words_reviewed_goal / actual
├── minutes_studied_goal / actual
├── questions_answered_goal / actual
└── goal_completed

user_badges
├── user_id
├── badge_id (e.g., "streak_7")
├── badge_name / description / icon
└── earned_at

streak_activities
├── user_id
├── activity_date
├── activity_type (vocabulary, quiz, reading, flashcards, story, sentence_completion)
├── activity_count
└── contributed_to_goal
```

**Vocabulary Tracking (Spaced Repetition):**
```
vocabulary_review_schedule
├── user_id
├── word
├── difficulty (0-3)
├── review_count
├── next_review_at
└── last_reviewed_at

vocabulary_review_history
├── user_id
├── word
├── difficulty_at_review
├── reviewed_at
├── time_spent_seconds
└── was_recalled_correctly

vocabulary_difficulty
├── user_id
├── word
└── difficulty (0-3)
```

**Story & Content History:**
```
story_generation_history
├── user_id
├── story_text
├── words_used (JSONB array)
├── story_type / subtype
└── generated_at
```

**Notes & Bookmarks:**
```
notes
├── user_id
├── title / content
├── path (page location)
└── timestamp

bookmarks
├── user_id
├── path / title
└── timestamp
```

**Device Management:**
```
devices
├── user_id
├── device_id (unique per device)
├── device_name
├── last_active
└── is_online
```

### Row Level Security (RLS)
All tables have RLS policies enforced at database level:
- Users can only view/modify their own data
- Policies use `auth.uid()::text = user_id` checks
- Non-blocking, efficient database enforcement

### Storage
- **Audio Files:** Supabase Storage (`note-audio` bucket) for recorded notes
- **Vocabulary Data:** JSON files in `/data/vocabulary-words.json`
- **Firebase Storage:** For image and media assets

---

## 4. OVERALL ARCHITECTURE

### Tech Stack
```
Frontend:
├── Next.js 14.2.33 (App Router)
├── React 18
├── TypeScript
├── Tailwind CSS 4
└── Radix UI components

Backend/API:
├── Next.js API Routes (`/app/api`)
├── Firebase Admin SDK
├── Supabase JS Client
└── OpenAI API (GPT-4-mini)

Services:
├── Authentication: Firebase Auth + NextAuth.js
├── Database: Supabase (PostgreSQL)
├── Storage: Supabase Storage + Firebase Storage
├── TTS: Volcengine BigTTS API
├── AI: OpenAI GPT-4-mini
└── Email: Nodemailer

Infrastructure:
├── Hosting: Linux (Ubuntu 24.04.1) on 205.198.69.199
├── Process Manager: PM2
├── Build: Local builds + rsync deployment
└── Node.js: v18.19.1 (requirement: >=20.0.0)
```

### File Structure
```
/Users/diz-air/git/v0-ssat-training-website/
├── app/
│   ├── layout.tsx (Firebase provider, GA, auth setup)
│   ├── page.tsx (homepage)
│   ├── api/ (Next.js API routes)
│   │   ├── auth/[...nextauth]/ (authentication)
│   │   ├── tts/ (text-to-speech)
│   │   ├── vocabulary/ (word tips, story generation)
│   │   ├── notifications/ (push/email)
│   │   └── cron/ (scheduled tasks)
│   ├── vocabulary/ (learning features)
│   ├── math/ (math exercises)
│   ├── progress/ (dashboard)
│   └── [other pages]
├── lib/
│   ├── supabase.ts (database functions)
│   ├── firebase.ts (auth setup)
│   ├── streaks.ts (gamification logic)
│   ├── activity-tracker.ts (tracking helpers)
│   ├── vocabulary-review-schedule.ts (SRS algorithm)
│   └── [other utilities]
├── components/
│   ├── header.tsx (includes streak display)
│   ├── vocabulary/ (word cards, flashcards)
│   ├── streak-display.tsx
│   ├── daily-goals.tsx
│   ├── badges-display.tsx
│   └── [UI components]
├── contexts/ (React context providers)
├── hooks/ (custom React hooks)
├── supabase/ (migrations & schema)
├── data/ (vocabulary word lists)
└── public/
```

---

## 5. EXISTING ANALYTICS & TRACKING

### Currently Implemented Tracking

#### 1. Activity Tracking System (`lib/activity-tracker.ts`)
Helper functions that automatically record user activities:

```typescript
trackWordReview(wordCount)      // Vocabulary flashcards
trackQuizCompletion(count)      // Quiz answers
trackSentenceCompletion(count)  // Sentence exercises
trackFlashcardSession(count)    // Flashcard reviews
trackStoryReading(minutes)      // Story reading
trackReadingCompletion(minutes) // Reading passages
trackVocabularyActivity(words, minutes) // Combined tracking
```

**What Gets Recorded:**
- `streak_activities` table: activity type, count, date
- `daily_goals` table: progress toward daily targets
- Automatic badge checking and awarding

#### 2. Login Tracking
```typescript
logUserLogin(loginData)         // Records each login
getUserLoginHistory(userId)     // Retrieve user login history
getRecentLogins(limit)          // Recent logins across all users
```

**Tracked Fields:**
- user_id, email, name, image
- login_at (timestamp)
- provider (Google/credentials)
- user_agent, ip_address

#### 3. Study Sessions (Optional)
```typescript
saveStudySession(userId, session)    // Save study session
getUserStudySessions(userId, limit)  // Retrieve sessions
```

#### 4. Vocabulary Review Tracking
- Every review recorded in `vocabulary_review_history`
- Time spent per word captured
- Correct/incorrect recall tracked
- Used for spaced repetition algorithm

#### 5. Lesson Completions
```typescript
saveLessonCompletion(userId, completion)
getUserLessonCompletions(userId)
```

#### 6. Story Generation History
- Every generated story logged with metadata
- Words used, story type, generated_at timestamp

#### 7. Device Tracking
```typescript
saveDevice(userId, deviceId, deviceName)
updateDeviceActivity(userId, deviceId)
getUserDevices(userId, daysBack)
setDeviceOffline(userId, deviceId)
```

### Analytics Features in Use

**Google Analytics:**
- Integrated via `<GoogleAnalytics>` component in layout
- Tracks pageviews, user sessions, events
- File: `components/google-analytics.tsx`

**Notification System:**
- Daily review reminders (cron job)
- Vocabulary review notifications
- Files: `lib/notifications.ts`, `app/api/notifications/`

**Performance Monitoring:**
- TTS cache statistics API
- File: `app/api/tts/cache/stats/route.ts`

---

## 6. KEY USER INTERACTIONS & TRACKING OPPORTUNITIES

### High-Value Tracking Points

#### Vocabulary Features (Primary)
| Feature | User Interaction | Current Tracking | Recommended Enhancement |
|---------|------------------|------------------|------------------------|
| **Flashcards** | Word review | ✓ Via `trackFlashcardSession()` | Track card flip counts, time per card |
| **Quiz** | Answer submission | ✓ Via `trackQuizCompletion()` | Capture incorrect answers for weakness analysis |
| **Sentence Completion** | Answer selection | ✓ Via `trackSentenceCompletion()` | Track answer patterns, hint usage |
| **Stories** | Story reading | ✓ Via `trackStoryReading()` | Track completion rate, time spent, revisits |
| **Word Lists** | Browsing/filtering | ✗ Not tracked | Add tracking for which filters used |
| **Review Session** | SRS reviews | ✓ In vocabulary_review_history | Already comprehensive |

#### Engagement Features
| Feature | Tracking Status |
|---------|-----------------|
| Streak continuity | ✓ Complete (daily check) |
| Daily goal progress | ✓ Complete (real-time updates) |
| Badge earn rate | ✓ Complete (auto-tracked) |
| Login patterns | ✓ Complete (login_logs table) |
| Device usage | ✓ Complete (devices table) |
| Session duration | Partial (can be enhanced) |
| Feature adoption | ✗ Missing |

#### Math & Other Sections
| Feature | Status |
|---------|--------|
| Math problem attempts | ✗ No tracking |
| Test performance | ✗ No tracking |
| Lesson page visits | ✓ Optional via lesson_completions |
| Bookmarks & notes | ✓ Logged with timestamps |

### Critical Touchpoints for New Tracking

**1. Feature Entry Points**
- When user clicks on vocabulary feature
- Which difficulty level selected
- Which story type/theme selected
- Which quiz category selected

**2. Engagement Metrics**
- Time on page (calculate from first interaction to last)
- Scroll depth (how far through a lesson)
- Click patterns (which buttons clicked most)
- Audio playback (speaker button clicks)

**3. Completion Metrics**
- Flashcard session completion rate
- Quiz score distribution
- Sentence completion accuracy
- Story reading finish rate

**4. Friction Points**
- Feature abandonment (started but didn't complete)
- Error rates (failed TTS, API errors)
- Retry counts (how many times user retried)
- Help requests (hint button clicks)

**5. Learning Outcomes**
- Words mastered over time
- SRS review performance (correct/incorrect)
- Quiz score trends
- Time to mastery for each word

---

## 7. RECOMMENDED TRACKING IMPLEMENTATION

### Phase 1: Enhance Existing (Immediate)
**Build on current infrastructure without new database tables**

```typescript
// Enhanced activity tracking with detailed metadata
trackFlashcardInteraction({
  wordId: string
  action: 'flip' | 'audio' | 'mastered' | 'skip'
  timeSpent: number
  isCorrect?: boolean
})

trackQuizInteraction({
  questionId: string
  selectedAnswer: string
  isCorrect: boolean
  timeSpent: number
  hintsUsed: number
})

trackPageView({
  feature: string  // 'flashcards', 'quiz', 'stories', etc.
  url: string
  entryTime: timestamp
  exitTime: timestamp
  deviceType: string
})
```

### Phase 2: Add Event Tracking Table (Optional)
**Create lightweight event log for real-time analytics**

```sql
CREATE TABLE user_events (
  id UUID PRIMARY KEY,
  user_id TEXT,
  event_type TEXT,
  event_data JSONB,
  timestamp TIMESTAMP,
  session_id TEXT
)
```

### Phase 3: Build Dashboard (Advanced)
**Create progress/analytics page with:**
- Learning velocity (words per day)
- Mastery timeline (days to master each word)
- Quiz performance trends
- Streak sustainability
- Feature usage heatmap

---

## TECHNOLOGY STACK DETAILS

### Key Libraries for Tracking Integration

**Already in use:**
- `next` 14.2.33 - Server components, API routes, middleware
- `@supabase/supabase-js` 2.75.1 - Database client
- `firebase` 12.4.0 - Authentication
- `openai` 6.4.0 - AI features
- `react-hook-form` 7.60.0 - Form handling
- `zod` 3.25.67 - Type validation

**For enhanced tracking:**
- Use existing Supabase client for data persistence
- Leverage Firebase Analytics (built-in)
- Integrate with server components for server-side tracking
- Use API routes for async tracking operations

---

## SECURITY & PRIVACY CONSIDERATIONS

### Current Security Measures
- Firebase Auth for secure user identification
- Supabase RLS policies enforce data isolation
- Email/password hashing via Firebase
- User agent and IP capture for security
- NextAuth.js CSRF protection

### For Usage Tracking
- All tracking should respect user privacy
- Implement privacy controls (opt-out option)
- Never track passwords or sensitive data
- Aggregate analytics at user level, not device level
- Comply with GDPR (right to data deletion)
- Implement data retention policies

### Recommended Privacy Features
```typescript
interface UserPrivacySettings {
  tracking_enabled: boolean
  analytics_opt_out: boolean
  data_retention_days: number // Auto-delete old tracking
}
```

---

## DEPLOYMENT & INFRASTRUCTURE

**Production Server:**
- URL: https://www.midssat.com
- Server: Ubuntu 24.04.1 (205.198.69.199)
- Process Manager: PM2 (process name: "midssat")
- Status: Online, healthy
- Uptime: 6+ hours documented

**Build Strategy:**
- Local builds (due to server memory constraints)
- `.next` folder deployed via rsync
- PM2 restart on deployment
- Build time: ~2-3 minutes locally

**Environment Setup:**
- Node.js v18.19.1 (server) - needs upgrade to >=20.0.0
- Firebase project: midssat-6448b
- Supabase project: mmzilrfnwdjxekwyzmsr.supabase.co

---

## RECOMMENDED IMPLEMENTATION ROADMAP

### Week 1: Assess & Plan
- [ ] Review existing tracking functionality
- [ ] Design tracking schema extensions
- [ ] Plan database migrations
- [ ] Get stakeholder input on key metrics

### Week 2-3: Implement Core Tracking
- [ ] Enhance activity-tracker.ts with detailed event logging
- [ ] Add event deduplication/batching
- [ ] Create tracking middleware for API routes
- [ ] Test tracking across all features

### Week 4: Analytics Dashboard
- [ ] Build /progress analytics enhancements
- [ ] Create real-time engagement dashboard
- [ ] Add cohort analysis views
- [ ] Set up alerts for important metrics

### Ongoing: Monitoring & Optimization
- [ ] Monitor tracking performance (doesn't impact UX)
- [ ] Gather user feedback on tracked features
- [ ] Iterate on dashboard based on needs
- [ ] Maintain data retention policies

---

## KEY METRICS TO TRACK

### User Engagement
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Session duration per feature
- Feature adoption rate

### Learning Metrics
- Words studied per day
- Mastery rate (% of words reaching final SRS level)
- Quiz average score
- Time to mastery per word

### Gamification Metrics
- Average streak length
- Daily goal completion rate
- Badge earn rate
- Return rate after streak break

### Feature Usage
- Feature usage breakdown (flashcards vs quiz vs stories)
- Peak usage times
- Feature drop-off points
- Audio feature adoption

### Quality Metrics
- Error rates (API failures)
- Page load times
- TTS success rate
- Quiz difficulty balance

---

## FILES TO MODIFY FOR TRACKING SYSTEM

### Core Integration Files
```
1. lib/activity-tracker.ts
   └─ Enhance with detailed event metadata

2. app/api/[route]/
   └─ Add tracking calls to API responses

3. app/vocabulary/*/page.tsx
   └─ Call tracking functions on user actions

4. components/vocabulary/*
   └─ Track component interactions

5. app/progress/page.tsx
   └─ Display tracking analytics dashboard

6. supabase/migrations/009_usage_tracking.sql
   └─ New migration for enhanced tracking
```

### New Files to Create
```
lib/event-tracker.ts
├─ Enhanced event logging
└─ Event batching/deduplication

lib/analytics.ts
├─ Analytics aggregation functions
└─ Cohort analysis

app/api/tracking/events/route.ts
├─ Bulk event ingestion API
└─ Event validation

app/analytics/page.tsx
└─ Analytics dashboard (internal/admin)
```

---

## NEXT STEPS

1. **Run Database Migration** (Required)
   - Execute `supabase/migrations/008_streaks_and_badges.sql` in Supabase
   - Enables gamification system currently deployed

2. **Integrate Activity Tracking** (3-4 hours)
   - Add `trackFlashcardSession()` to flashcards page
   - Add `trackQuizCompletion()` to quiz page
   - Add `trackSentenceCompletion()` to sentence completion
   - Add `trackStoryReading()` to stories page

3. **Test Tracking End-to-End** (2 hours)
   - Complete activities and verify database records
   - Check Supabase tables for correct data
   - Test with multiple user accounts

4. **Plan Enhanced Tracking** (4 hours)
   - Design event schema for additional metrics
   - Plan dashboard design
   - Define tracking KPIs

5. **Build Usage Dashboard** (6-8 hours)
   - Create analytics page
   - Implement metric calculations
   - Add visualizations (charts, trends)

---

## ADDITIONAL RESOURCES

**Key Documentation Files in Repo:**
- `IMPLEMENTATION_SUMMARY.md` - Streak system details
- `TESTING_GUIDE.md` - How to test features
- `PROJECT_STATUS.md` - Overall project status
- `docs/STREAK_SYSTEM.md` - Developer guide for gamification

**API Reference:**
- Activity Tracker: `lib/activity-tracker.ts` (lines 1-152)
- Streaks System: `lib/streaks.ts` (770 lines, comprehensive)
- Database Functions: `lib/supabase.ts` (1,238 lines)

**Deployment:**
- Local build + rsync strategy works around server memory limits
- PM2 manages process persistence
- Database migrations in `supabase/migrations/`

---

**Report Generated:** January 26, 2026  
**Analyzed By:** Claude Code Search  
**Repository:** /Users/diz-air/git/v0-ssat-training-website

