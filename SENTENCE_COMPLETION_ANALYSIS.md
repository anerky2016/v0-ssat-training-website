# Sentence Completion Quiz System Analysis

## Overview
This document analyzes the existing sentence completion quiz system to understand its architecture, data flow, and implementation patterns.

## System Architecture

### Core Files & Components

#### 1. Main Quiz Page
**File**: `app/vocabulary/sentence-completion/page.tsx`

**Purpose**: Primary quiz interface with setup, quiz mode, and results view

**Key Features**:
- Quiz setup with question count selection (10, 20, 30, 50, 100)
- Progress tracking (completed questions)
- Quiz submission and scoring
- Mistake tracking for logged-in users
- AI explanation management

**State Management**:
```typescript
- quizStarted: boolean           // Whether quiz has started
- score: number                  // Current score
- userAnswers: { [key: string]: string }  // User's answers
- quizSubmitted: boolean         // Whether quiz is submitted
- numberOfQuestions: number      // Selected question count
- shuffleSeed: number           // Trigger for reshuffling
- completedQuestions: Set<string> // Completed question IDs
- aiExplanations: { [key: string]: string } // AI-generated explanations
- authLoading: boolean          // Auth initialization state
```

**Data Flow**:
1. Load completed questions from database/localStorage
2. Filter out completed questions from available pool
3. Shuffle and select N questions
4. User answers questions (tracked in `userAnswers`)
5. Submit quiz → calculate score → save mistakes
6. Mark questions as completed on exit

#### 2. Question Component
**File**: `components/vocabulary/questions/SentenceCompletionQuestion.tsx`

**Purpose**: Reusable component for displaying and answering sentence completion questions

**Props**:
```typescript
interface SentenceCompletionQuestionProps {
  question: SentenceCompletionQuestionData
  onAnswer?: (isCorrect: boolean) => void
  showFeedback?: boolean
  selectedAnswer?: string | null      // External control
  onSelectAnswer?: (answer: string) => void  // External control
  submitted?: boolean                 // Deferred feedback mode
  onAiExplanation?: (questionId: string, explanation: string) => void
  initialAiExplanation?: string | null
}
```

**Modes**:
1. **Immediate Feedback Mode**: Shows feedback right after answer selection
2. **Deferred Feedback Mode**: Collects answers, shows feedback after submission

**Features**:
- Visual feedback (green for correct, red for incorrect)
- Word information lookup
- AI explanation generation with regeneration
- Feedback system (thumbs up/down)
- Markdown-formatted explanations

#### 3. Progress Tracking
**File**: `lib/sentence-completion-progress.ts`

**Purpose**: Track which questions users have completed

**Database Table**: `sentence_completion_progress`
```sql
CREATE TABLE sentence_completion_progress (
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  completed_at TIMESTAMP NOT NULL,
  PRIMARY KEY (user_id, question_id)
)
```

**Key Functions**:
- `getCompletedQuestions()`: Load completed question IDs
- `markQuestionsCompleted(questionIds)`: Mark questions as done
- `resetProgress()`: Clear all progress
- `getProgressStats()`: Get statistics (total, today, this week)
- `getCompletedQuestionsWithTimestamps()`: Paginated history
- `getDailyCompletionCounts()`: Calendar view data

**Storage Strategy**:
- **Logged-in users**: Supabase database + localStorage (synced)
- **Anonymous users**: localStorage only
- Merge localStorage → database on login

#### 4. Mistake Tracking
**File**: `lib/sentence-completion-mistakes.ts`

**Purpose**: Track incorrect answers for review

**Database Table**: `sentence_completion_mistakes`
```sql
CREATE TABLE sentence_completion_mistakes (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP NOT NULL
)
```

**Key Functions**:
- `saveMistakes(mistakes[])`: Batch save incorrect answers
- `updateMistakeExplanation()`: Update AI explanation for mistake
- `getAllMistakes()`: Retrieve all mistakes (with date filtering)
- `getMistakesByQuestion()`: Get mistakes for specific question
- `getRecentMistakes(days)`: Get mistakes from last N days
- `getMistakeStats()`: Statistics and most common mistakes
- `deleteMistake(id)`: Remove specific mistake
- `clearAllMistakes()`: Remove all mistakes

**Mistake Record**:
```typescript
interface SentenceCompletionMistake {
  id?: string
  user_id: string
  question_id: string
  question: string
  correct_answer: string
  user_answer: string
  explanation?: string  // Can be static or AI-generated
  created_at: string
}
```

### Data Structure

#### Question Format (Current)
```json
{
  "id": "chapter2-q1",
  "question": "The new technological______ promises faster...",
  "options": ["branch", "barrier", "basement", "block"],
  "answer": "barrier",
  "explanation": "barrier: noun, /ˈbæriər/, means..."
}
```

#### Question Format (Combined Data)
```json
{
  "questionNumber": 1,
  "question": "The investment__________ provided...",
  "options": [
    { "letter": "A", "text": "agent" },
    { "letter": "B", "text": "banker" },
    { "letter": "C", "text": "analyst" },
    { "letter": "D", "text": "chief" }
  ],
  "correctAnswer": "B",
  "solution": "banker: noun, /ˈbæŋkər/, means...",
  "chapter": 3,
  "source": "Wordly Wise 3000"
}
```

## Quiz Flow

### Setup Phase
1. **Authentication Check**: Wait for Firebase auth to initialize
2. **Load Progress**:
   - Fetch completed questions from database (logged-in)
   - Load from localStorage (anonymous)
   - Merge and sync if needed
3. **Display Stats**: Show completed/remaining questions
4. **Question Selection**: User selects number of questions (10-100)
5. **Start Quiz**: Generate quiz questions (filter completed, shuffle, slice)

### Quiz Phase
1. **Display Questions**: Show all questions at once
2. **Answer Selection**: User clicks option for each question
3. **Track Progress**: Show "X of N answered" at bottom
4. **Enable Submit**: When all questions answered

### Submission Phase
1. **Calculate Score**: Count correct answers
2. **Collect Mistakes**:
   ```typescript
   const mistakes = quizQuestions
     .filter(q => userAnswers[q.id] !== q.answer)
     .map(q => ({
       questionId: q.id,
       question: q.question,
       correctAnswer: q.answer,
       userAnswer: userAnswers[q.id] || '',
       explanation: aiExplanations[q.id] || q.explanation
     }))
   ```
3. **Save Mistakes**: If logged in, batch save to database
4. **Show Results**: Display score, percentage, feedback message
5. **Show Answers**: Each question shows:
   - Correct/incorrect indicator
   - User's answer vs correct answer
   - Word information (from vocabulary lookup)
   - AI explanation (on-demand or pre-loaded)

### Exit Phase
1. **Mark Completed**: Add all quiz question IDs to completed set
2. **Persist Progress**:
   - Save to localStorage
   - Sync to database (if logged in)
3. **Reset State**: Clear answers, AI explanations
4. **Reshuffle**: Increment shuffle seed for next quiz

## AI Explanation System

### Generation Flow
1. **Trigger**: User clicks "Get AI thoughts" button
2. **Request Data**:
   ```typescript
   {
     question: string,
     correctAnswer: string,
     allOptions: string[],
     userAnswer?: string,  // Only if wrong
     wordInfo: object,     // From vocabulary lookup
     isRegeneration?: boolean,
     previousExplanation?: string
   }
   ```
3. **API Call**: POST to `/api/vocabulary/explain-answer`
4. **Response**: AI-generated markdown explanation
5. **Display**: Rendered with syntax highlighting
6. **Feedback**: Thumbs up/down
   - Thumbs down → Auto-regenerate with different approach
7. **Persistence**:
   - Save to component state
   - If mistake, update in database via `updateMistakeExplanation()`

### Explanation Features
- Markdown formatting support
- Regeneration on thumbs down
- Track regeneration attempts
- Feedback collection for analytics
- Pre-populate from database for review

## Review & History Features

### Review Mistakes Page
**File**: `app/vocabulary/sentence-completion/review/page.tsx`

**Features**:
- Display all saved mistakes
- Filter by date range
- Show with AI explanations
- Allow retaking incorrectly answered questions

### History Page
**File**: `app/vocabulary/sentence-completion/history/page.tsx`

**Features**:
- Paginated list of completed questions
- Date filtering
- Statistics (today, this week, total)
- Calendar view of daily activity

## Database Schema

### Tables Required
1. **sentence_completion_progress**
   - Tracks completed questions per user
   - Enables progress persistence
   - Supports statistics and history

2. **sentence_completion_mistakes**
   - Records incorrect answers
   - Stores AI explanations
   - Enables mistake review feature

3. **explanation_feedback** (optional)
   - Tracks thumbs up/down on explanations
   - For analytics and model improvement

## Key Design Patterns

### 1. Controlled vs Uncontrolled Mode
The question component supports both:
- **Uncontrolled**: Immediate feedback, manages own state
- **Controlled**: Deferred feedback, parent manages state via props

### 2. Progressive Enhancement
- Core functionality works without login (localStorage)
- Enhanced features for logged-in users (database sync, review)
- Graceful degradation when Supabase unavailable

### 3. Optimistic UI Updates
- Mark questions completed on exit (not on submit)
- This prevents questions disappearing during result review

### 4. Data Synchronization
- Merge localStorage + database for logged-in users
- Auto-sync local progress to database
- Fallback to localStorage if database fails

### 5. Batch Operations
- Save multiple mistakes in single database call
- Mark multiple questions completed at once
- Reduces database round trips

## Question Selection Algorithm

```typescript
// 1. Filter out completed questions
const available = allQuestions.filter(q =>
  !completedQuestions.has(q.id)
)

// 2. Shuffle (triggered by shuffleSeed change)
const shuffled = [...available].sort(() => Math.random() - 0.5)

// 3. Take requested number (or all if fewer available)
const selected = shuffled.slice(0, Math.min(numberOfQuestions, shuffled.length))
```

## Adaptation Requirements for Combined Data

To use the new combined data (`combined-sentence-completion.json`), the following adaptations are needed:

### 1. Data Format Conversion
Convert from:
```json
{
  "questionNumber": 1,
  "options": [{"letter": "A", "text": "agent"}, ...],
  "correctAnswer": "B",
  "solution": "..."
}
```

To:
```json
{
  "id": "chapter3-q1",
  "question": "...",
  "options": ["agent", "banker", "analyst", "chief"],
  "answer": "banker",
  "explanation": "..."
}
```

### 2. ID Generation
Create unique IDs from chapter and question number:
```typescript
id: `chapter${chapter}-q${questionNumber}`
```

### 3. Option Extraction
Extract just the text from option objects:
```typescript
options: question.options.map(opt => opt.text)
```

### 4. Answer Resolution
Map letter answer to actual word:
```typescript
const answerOption = question.options.find(
  opt => opt.letter === question.correctAnswer
)
answer: answerOption.text
```

### 5. Explanation Field
Rename `solution` to `explanation`:
```typescript
explanation: question.solution
```

### 6. Additional Metadata
Optionally preserve chapter and source info:
```typescript
chapter?: number
source?: string
```

## API Endpoints Used

1. **POST /api/vocabulary/explain-answer**
   - Generate AI explanation for answer
   - Input: question, answer, word info, user answer
   - Output: markdown explanation

2. **POST /api/vocabulary/save-explanation-feedback**
   - Record thumbs up/down feedback
   - For analytics and improvement

## Performance Considerations

1. **Lazy Loading**: AI explanations generated on-demand
2. **Caching**: Completed questions cached in state
3. **Batch Operations**: Mistakes and completions saved in batches
4. **Optimistic Updates**: UI updates before database confirms
5. **Pagination**: History uses pagination for large datasets
6. **Date Filtering**: All queries support date ranges for efficiency

## Security Considerations

1. **User ID Verification**: All database operations verify Firebase user ID
2. **Row-Level Security**: Database enforces user can only see own data
3. **Client-Side Filtering**: Completed questions filtered before display
4. **No Sensitive Data**: Questions are public, only progress is private

## Future Enhancement Opportunities

1. **Spaced Repetition**: Intelligently resurface completed questions
2. **Difficulty Levels**: Categorize questions by difficulty
3. **Learning Paths**: Guided progression through chapters
4. **Multiplayer Mode**: Compete with friends
5. **Time Tracking**: How long users spend per question
6. **Streak Tracking**: Consecutive days of practice
7. **Achievements**: Badges for milestones
8. **Custom Quizzes**: User-selected chapters or difficulty
9. **Print Mode**: Generate printable worksheets
10. **Export**: Download progress reports

## Summary

The sentence completion quiz system is a well-architected application with:
- Clean separation of concerns (UI, data, state)
- Dual storage strategy (database + localStorage)
- Progressive enhancement for auth
- Flexible question component with multiple modes
- AI-enhanced explanations with regeneration
- Comprehensive tracking (progress, mistakes, statistics)
- Batch operations for performance
- Date filtering throughout for analytics

The main adaptation needed for the combined data is a transformation layer to convert the Wordly Wise format to the expected format.
