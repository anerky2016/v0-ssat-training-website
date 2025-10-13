# Vocabulary Question Components

Reusable interactive question components for SSAT vocabulary practice. These components work with the data structure in `/data/vocab_questions.json`.

## Components

### 1. SynonymQuestion
Multiple-choice question asking students to identify synonyms of vocabulary words.

**Visual Identity**: Blue border and badge

### 2. AntonymQuestion
Multiple-choice question asking students to identify antonyms of vocabulary words.

**Visual Identity**: Orange border and badge

### 3. SentenceCompletionQuestion
Fill-in-the-blank question where students complete sentences using the correct vocabulary word.

**Visual Identity**: Purple border and badge, visual blank indicator

### 4. DefinitionMatchQuestion
Multiple-choice question asking students to match vocabulary words with their correct definitions.

**Visual Identity**: Teal border and badge

## Common Features

All question components share these features:

- **Interactive Multiple Choice**: Click to select an answer
- **Instant Feedback**: Shows correct/incorrect immediately after selection
- **Visual Indicators**:
  - ✅ Green highlight for correct answer
  - ❌ Red highlight for incorrect selection
  - Gray opacity for unselected options after answering
- **Hover Effects**: Scale animation on option hover
- **Disabled State**: Cannot change answer once submitted
- **Dark Mode Support**: Full support for light and dark themes

## Usage

### Basic Example

```tsx
import { SynonymQuestion } from "@/components/vocabulary/questions"

const question = {
  id: "syn1",
  question: "Which word is closest in meaning to 'abdicate'?",
  options: ["relinquish", "announce", "maintain", "celebrate"],
  answer: "relinquish"
}

export default function Quiz() {
  return <SynonymQuestion question={question} />
}
```

### With Answer Tracking

```tsx
"use client"

import { useState } from "react"
import { SynonymQuestion, AntonymQuestion } from "@/components/vocabulary/questions"

export default function VocabularyQuiz() {
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const handleAnswer = (isCorrect: boolean) => {
    setTotalQuestions(prev => prev + 1)
    if (isCorrect) {
      setScore(prev => prev + 1)
    }
  }

  return (
    <div>
      <div className="mb-4">
        Score: {score} / {totalQuestions}
      </div>

      <SynonymQuestion
        question={synonymQuestion}
        onAnswer={handleAnswer}
      />

      <AntonymQuestion
        question={antonymQuestion}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
```

### Without Feedback

```tsx
<SynonymQuestion
  question={question}
  showFeedback={false}
  onAnswer={(isCorrect) => console.log(isCorrect)}
/>
```

### With JSON Data

```tsx
import vocabQuestions from "@/data/vocab_questions.json"
import {
  SynonymQuestion,
  AntonymQuestion,
  SentenceCompletionQuestion,
  DefinitionMatchQuestion
} from "@/components/vocabulary/questions"

export default function QuizPage() {
  const wordData = vocabQuestions.questions[0] // "abdicate"

  return (
    <div className="space-y-6">
      {/* Synonym Questions */}
      {wordData.questionSet.synonymQuestions.map((q) => (
        <SynonymQuestion key={q.id} question={q} />
      ))}

      {/* Antonym Questions */}
      {wordData.questionSet.antonymQuestions.map((q) => (
        <AntonymQuestion key={q.id} question={q} />
      ))}

      {/* Sentence Completion Questions */}
      {wordData.questionSet.sentenceCompletionQuestions.map((q) => (
        <SentenceCompletionQuestion key={q.id} question={q} />
      ))}

      {/* Definition Match Questions */}
      {wordData.questionSet.definitionMatchQuestions.map((q) => (
        <DefinitionMatchQuestion key={q.id} question={q} />
      ))}
    </div>
  )
}
```

## Component APIs

### SynonymQuestion

```tsx
interface SynonymQuestionProps {
  question: {
    id: string
    question: string
    options: string[]
    answer: string
  }
  onAnswer?: (isCorrect: boolean) => void
  showFeedback?: boolean
}
```

### AntonymQuestion

```tsx
interface AntonymQuestionProps {
  question: {
    id: string
    question: string
    options: string[]
    answer: string
  }
  onAnswer?: (isCorrect: boolean) => void
  showFeedback?: boolean
}
```

### SentenceCompletionQuestion

```tsx
interface SentenceCompletionQuestionProps {
  question: {
    id: string
    question: string  // Should contain "______" for the blank
    options: string[]
    answer: string
  }
  onAnswer?: (isCorrect: boolean) => void
  showFeedback?: boolean
}
```

**Special Feature**: Automatically renders `______` in the question text as a visual blank indicator with purple underline.

### DefinitionMatchQuestion

```tsx
interface DefinitionMatchQuestionProps {
  question: {
    id: string
    question: string
    options: string[]  // Longer text definitions
    answer: string
  }
  onAnswer?: (isCorrect: boolean) => void
  showFeedback?: boolean
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `question` | `QuestionData` | Required | Question object with id, question, options, and answer |
| `onAnswer` | `(isCorrect: boolean) => void` | `undefined` | Callback fired when answer is selected |
| `showFeedback` | `boolean` | `true` | Whether to show correct/incorrect feedback |

## Data Structure

The components expect data structured like `/data/vocab_questions.json`:

```json
{
  "questions": [
    {
      "word": "abdicate",
      "questionSet": {
        "synonymQuestions": [
          {
            "id": "syn1",
            "question": "Which word is closest in meaning to 'abdicate'?",
            "options": ["relinquish", "announce", "maintain", "celebrate"],
            "answer": "relinquish"
          }
        ],
        "antonymQuestions": [...],
        "sentenceCompletionQuestions": [...],
        "definitionMatchQuestions": [...]
      }
    }
  ]
}
```

## Styling

Each component uses:
- **Tailwind CSS**: For all styling
- **shadcn/ui**: Card, Button components
- **Lucide Icons**: CheckCircle2, XCircle for feedback

### Color Schemes

| Component | Border | Badge Background | Badge Text |
|-----------|--------|------------------|------------|
| SynonymQuestion | `border-l-blue-500` | `bg-blue-100` | `text-blue-700` |
| AntonymQuestion | `border-l-orange-500` | `bg-orange-100` | `text-orange-700` |
| SentenceCompletionQuestion | `border-l-purple-500` | `bg-purple-100` | `text-purple-700` |
| DefinitionMatchQuestion | `border-l-teal-500` | `bg-teal-100` | `text-teal-700` |

### Feedback Colors

- **Correct**: Green (`bg-green-100`, `border-green-500`)
- **Incorrect**: Red (`bg-red-100`, `border-red-500`)
- **Unanswered**: Muted (`bg-muted/30`)

## Advanced Usage

### Quiz Mode with Progress Tracking

```tsx
"use client"

import { useState } from "react"
import vocabQuestions from "@/data/vocab_questions.json"
import { SynonymQuestion } from "@/components/vocabulary/questions"

export default function QuizMode() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])

  const questions = vocabQuestions.questions[0].questionSet.synonymQuestions

  const handleAnswer = (isCorrect: boolean) => {
    setAnswers([...answers, isCorrect])
    if (isCorrect) setScore(score + 1)

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      }
    }, 1500)
  }

  return (
    <div>
      <div className="mb-4">
        Question {currentQuestion + 1} of {questions.length}
        <br />
        Score: {score} / {answers.length}
      </div>

      <SynonymQuestion
        question={questions[currentQuestion]}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
```

### Random Question Generator

```tsx
import vocabQuestions from "@/data/vocab_questions.json"

function getRandomQuestions(count: number) {
  const allWords = vocabQuestions.questions
  const randomWord = allWords[Math.floor(Math.random() * allWords.length)]

  // Get mix of all question types
  const allQuestions = [
    ...randomWord.questionSet.synonymQuestions,
    ...randomWord.questionSet.antonymQuestions,
    ...randomWord.questionSet.sentenceCompletionQuestions,
    ...randomWord.questionSet.definitionMatchQuestions,
  ]

  // Shuffle and take first 'count' questions
  return allQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}
```

### Timed Quiz

```tsx
"use client"

import { useState, useEffect } from "react"
import { SynonymQuestion } from "@/components/vocabulary/questions"

export default function TimedQuiz() {
  const [timeLeft, setTimeLeft] = useState(60) // 60 seconds
  const [quizEnded, setQuizEnded] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      setQuizEnded(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  return (
    <div>
      <div className="text-xl font-bold mb-4">
        Time Left: {timeLeft}s
      </div>

      {!quizEnded ? (
        <SynonymQuestion question={question} />
      ) : (
        <div>Quiz Ended!</div>
      )}
    </div>
  )
}
```

## File Structure

```
components/
└── vocabulary/
    └── questions/
        ├── SynonymQuestion.tsx
        ├── AntonymQuestion.tsx
        ├── SentenceCompletionQuestion.tsx
        ├── DefinitionMatchQuestion.tsx
        ├── index.ts
        └── README.md
```

## Accessibility

- **Keyboard Navigation**: All buttons are keyboard accessible
- **Focus States**: Clear focus indicators on options
- **Screen Readers**: Semantic HTML with proper button labels
- **Color Contrast**: WCAG AA compliant color combinations
- **State Announcements**: Visual feedback for all interactions

## Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-friendly touch interactions
- Responsive design for all screen sizes

## Performance

- **Lightweight**: Each component ~2-3kb gzipped
- **No External Dependencies**: Only React and shadcn/ui
- **Optimized Rendering**: Only re-renders on state change
- **Self-Contained State**: Each question manages its own state independently

## Testing

Example test cases:

```tsx
// Test that question is displayed
expect(screen.getByText("Which word is closest in meaning to 'abdicate'?")).toBeInTheDocument()

// Test that all options are displayed
expect(screen.getByText("relinquish")).toBeInTheDocument()
expect(screen.getByText("announce")).toBeInTheDocument()

// Test option selection
const option = screen.getByText("relinquish")
fireEvent.click(option)
expect(screen.getByText("Correct!")).toBeInTheDocument()

// Test onAnswer callback
const onAnswer = jest.fn()
render(<SynonymQuestion question={question} onAnswer={onAnswer} />)
fireEvent.click(screen.getByText("relinquish"))
expect(onAnswer).toHaveBeenCalledWith(true)
```

## Future Enhancements

Potential improvements:

1. **Drag and Drop**: For matching questions
2. **Audio Pronunciation**: Speak the word when question loads
3. **Explanations**: Show why answer is correct/incorrect
4. **Hints System**: Progressive hints for struggling students
5. **Spaced Repetition**: Track which questions need review
6. **Analytics**: Track question difficulty and time to answer
7. **Shuffle Options**: Randomize option order
8. **Timer Per Question**: Add countdown for each question

## Contributing

When modifying these components:

1. Maintain consistent API across all question types
2. Test with actual vocab_questions.json data
3. Verify dark mode appearance
4. Check mobile responsiveness
5. Update TypeScript types if structure changes
6. Update this README with new features

## Version History

- **v1.0.0** (2025-01-12): Initial release
  - Four question type components
  - Interactive multiple choice with instant feedback
  - Color-coded by question type
  - Full dark mode support
  - TypeScript interfaces for all data structures

## License

Part of the SSAT Training Website project.
