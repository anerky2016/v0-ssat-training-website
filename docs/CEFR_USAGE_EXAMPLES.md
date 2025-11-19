# CEFR Usage Examples

This document provides practical examples of how to use CEFR levels in the SSAT Training Website.

## Basic Usage

### Display CEFR Badge on Word Card

```tsx
import CEFRBadge from '@/components/vocabulary/CEFRBadge'
import { VocabularyWord } from '@/lib/vocabulary-levels'

function WordCard({ word }: { word: VocabularyWord }) {
  return (
    <div className="word-card">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{word.word}</h3>
        {word.cefr_level && (
          <CEFRBadge level={word.cefr_level} />
        )}
      </div>
      <p>{word.meanings[0]}</p>
    </div>
  )
}
```

### Filter Words by CEFR Level

```tsx
'use client'

import { useState } from 'react'
import CEFRFilter from '@/components/vocabulary/CEFRFilter'
import { CEFRLevel, VocabularyWord, filterWordsByCEFR } from '@/lib/vocabulary-levels'

function VocabularyPractice({ words }: { words: VocabularyWord[] }) {
  const [selectedLevels, setSelectedLevels] = useState<CEFRLevel[]>(['B1', 'B2'])

  const filteredWords = selectedLevels.length > 0
    ? filterWordsByCEFR(words, selectedLevels)
    : words

  return (
    <div>
      <CEFRFilter
        selectedLevels={selectedLevels}
        onLevelsChange={setSelectedLevels}
        showCounts={true}
        levelCounts={getCEFRDistribution(words)}
      />

      <div className="mt-6">
        <p>{filteredWords.length} words</p>
        {/* Render filtered words */}
      </div>
    </div>
  )
}
```

### Show CEFR Distribution

```tsx
import CEFRDistribution from '@/components/vocabulary/CEFRDistribution'
import { getCEFRDistribution, loadVocabularyWords } from '@/lib/vocabulary-levels'

function VocabularyStats() {
  const words = loadVocabularyWords(['SSAT'])
  const distribution = getCEFRDistribution(words)

  return (
    <CEFRDistribution
      distribution={distribution}
      title="SSAT Vocabulary Distribution"
      showPercentages={true}
    />
  )
}
```

## Advanced Usage

### Progressive Learning Path

```tsx
import { useState, useEffect } from 'react'
import { CEFRLevel, VocabularyWord, getCEFRNumericValue } from '@/lib/vocabulary-levels'

function ProgressiveLearning({ words }: { words: VocabularyWord[] }) {
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>('B1')

  // Get words at or below current level
  const availableWords = words.filter(word =>
    word.cefr_level &&
    getCEFRNumericValue(word.cefr_level) <= getCEFRNumericValue(currentLevel)
  )

  const advanceLevel = () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const currentIndex = levels.indexOf(currentLevel)
    if (currentIndex < levels.length - 1) {
      setCurrentLevel(levels[currentIndex + 1])
    }
  }

  return (
    <div>
      <h2>Current Level: {currentLevel}</h2>
      <p>{availableWords.length} words available</p>
      <button onClick={advanceLevel}>Advance to Next Level</button>
      {/* Render practice exercises */}
    </div>
  )
}
```

### Difficulty-Based Quiz

```tsx
import { CEFRLevel, VocabularyWord, filterWordsByCEFR } from '@/lib/vocabulary-levels'

interface QuizConfig {
  beginner: number    // Number of A1-A2 words
  intermediate: number // Number of B1-B2 words
  advanced: number    // Number of C1-C2 words
}

function createBalancedQuiz(words: VocabularyWord[], config: QuizConfig): VocabularyWord[] {
  const beginnerWords = filterWordsByCEFR(words, ['A1', 'A2'])
  const intermediateWords = filterWordsByCEFR(words, ['B1', 'B2'])
  const advancedWords = filterWordsByCEFR(words, ['C1', 'C2'])

  const quiz = [
    ...shuffleArray(beginnerWords).slice(0, config.beginner),
    ...shuffleArray(intermediateWords).slice(0, config.intermediate),
    ...shuffleArray(advancedWords).slice(0, config.advanced)
  ]

  return shuffleArray(quiz)
}

function QuizGenerator({ words }: { words: VocabularyWord[] }) {
  const quiz = createBalancedQuiz(words, {
    beginner: 5,
    intermediate: 10,
    advanced: 5
  })

  return <QuizComponent words={quiz} />
}
```

### Student Progress Tracking

```tsx
import { CEFRLevel, getCEFRNumericValue } from '@/lib/vocabulary-levels'

interface StudentProgress {
  learnedWords: Set<string>
  words: VocabularyWord[]
}

function calculateStudentLevel({ learnedWords, words }: StudentProgress): CEFRLevel {
  // Find the highest CEFR level where student knows 80% of words
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

  for (let i = levels.length - 1; i >= 0; i--) {
    const levelWords = words.filter(w => w.cefr_level === levels[i])
    const learned = levelWords.filter(w => learnedWords.has(w.word)).length
    const mastery = learned / levelWords.length

    if (mastery >= 0.8) {
      return levels[i]
    }
  }

  return 'A1' // Default to beginner
}

function StudentDashboard({ student }: { student: StudentProgress }) {
  const currentLevel = calculateStudentLevel(student)

  return (
    <div>
      <h2>Current Level: <CEFRBadge level={currentLevel} /></h2>
      <p>Words Mastered: {student.learnedWords.size}</p>
    </div>
  )
}
```

### Vocabulary Recommendations

```tsx
import { CEFRLevel, VocabularyWord, getCEFRNumericValue } from '@/lib/vocabulary-levels'

function recommendNextWords(
  allWords: VocabularyWord[],
  learnedWords: Set<string>,
  currentLevel: CEFRLevel,
  count: number = 10
): VocabularyWord[] {
  // Recommend words at current level and one level above
  const currentValue = getCEFRNumericValue(currentLevel)
  const targetLevels = allWords
    .filter(word => {
      if (!word.cefr_level) return false
      const wordValue = getCEFRNumericValue(word.cefr_level)
      return wordValue >= currentValue && wordValue <= currentValue + 1
    })
    .filter(word => !learnedWords.has(word.word))

  return shuffleArray(targetLevels).slice(0, count)
}

function VocabularyRecommendations({
  words,
  learned,
  level
}: {
  words: VocabularyWord[]
  learned: Set<string>
  level: CEFRLevel
}) {
  const recommendations = recommendNextWords(words, learned, level)

  return (
    <div>
      <h3>Recommended Words to Learn</h3>
      {recommendations.map(word => (
        <WordCard key={word.word} word={word} />
      ))}
    </div>
  )
}
```

### Custom Study Sets

```tsx
'use client'

import { useState } from 'react'
import { CEFRLevel, VocabularyWord, filterWordsByCEFR } from '@/lib/vocabulary-levels'

interface StudySet {
  name: string
  levels: CEFRLevel[]
  wordCount: number
}

const presetStudySets: StudySet[] = [
  { name: "Beginner Friendly", levels: ['A1', 'A2', 'B1'], wordCount: 50 },
  { name: "SSAT Prep - Core", levels: ['B2', 'C1'], wordCount: 100 },
  { name: "Advanced Challenge", levels: ['C1', 'C2'], wordCount: 50 },
  { name: "Complete Review", levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], wordCount: 200 }
]

function StudySetSelector({ words }: { words: VocabularyWord[] }) {
  const [selectedSet, setSelectedSet] = useState<StudySet | null>(null)

  const createStudySet = (set: StudySet) => {
    const filtered = filterWordsByCEFR(words, set.levels)
    const shuffled = shuffleArray(filtered)
    return shuffled.slice(0, set.wordCount)
  }

  return (
    <div>
      <h2>Choose a Study Set</h2>
      {presetStudySets.map(set => (
        <button
          key={set.name}
          onClick={() => setSelectedSet(set)}
          className="study-set-button"
        >
          <div>{set.name}</div>
          <div className="text-sm">
            {set.levels.join(', ')} · {set.wordCount} words
          </div>
        </button>
      ))}

      {selectedSet && (
        <PracticeSession words={createStudySet(selectedSet)} />
      )}
    </div>
  )
}
```

## Utility Functions Examples

### Sort Words by Difficulty

```typescript
import { sortWordsByCEFR, VocabularyWord } from '@/lib/vocabulary-levels'

const words: VocabularyWord[] = [/* ... */]
const sortedWords = sortWordsByCEFR(words)
// Words now ordered from A1 (easiest) to C2 (hardest)
```

### Get Words at Specific Level

```typescript
import { getWordsByCEFRLevel } from '@/lib/vocabulary-levels'

const c1Words = getWordsByCEFRLevel('C1', ['SSAT'])
// Returns all C1-level words from SSAT vocabulary
```

### Calculate Distribution

```typescript
import { getCEFRDistribution, loadVocabularyWords } from '@/lib/vocabulary-levels'

const words = loadVocabularyWords(['SSAT', 3, 4])
const distribution = getCEFRDistribution(words)
// Returns: { A1: 0, A2: 4, B1: 362, B2: 745, C1: 651, C2: 101 }
```

## Helper Function

```typescript
// Add to your utils
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
```

## Best Practices

1. **Always check if CEFR level exists**: Use `word.cefr_level &&` before accessing
2. **Provide fallbacks**: Have default behavior for words without CEFR levels
3. **Use type safety**: Import and use the `CEFRLevel` type
4. **Cache distributions**: Calculate CEFR distributions once and cache
5. **Progressive enhancement**: Add CEFR features as optional enhancements

## See Also

- [CEFR Levels Documentation](./CEFR_LEVELS.md)
- [Vocabulary Levels API](../lib/vocabulary-levels.ts)
- [Components Documentation](../components/vocabulary/README.md)
