# CEFR Word Levels Documentation

## Overview

All vocabulary words in the system now include CEFR (Common European Framework of Reference for Languages) levels. These levels help categorize words by difficulty and guide learners in their vocabulary acquisition journey.

## CEFR Levels Explained

### A1 - Beginner (0.0% of words)
**Description:** Can understand and use familiar everyday expressions and basic phrases

**Examples:** Very basic, high-frequency words used in daily conversation

---

### A2 - Elementary (0.2% of words)
**Description:** Can understand sentences and frequently used expressions related to areas of immediate relevance

**Sample words:** consider, create, develop, course

---

### B1 - Intermediate (19.4% of words)
**Description:** Can understand the main points of clear standard input on familiar matters

**Sample words:** abide, amass, apex, avid, awe, berth, boon, cede, cleft, coil

**Total:** 362 words

---

### B2 - Upper Intermediate (40.0% of words)
**Description:** Can understand the main ideas of complex text on both concrete and abstract topics

**Sample words:** abstain, abysmal, admire, adroit, affable, affirm, ailment, anomaly, assess, astound

**Total:** 745 words (largest category)

---

### C1 - Advanced (34.9% of words)
**Description:** Can understand a wide range of demanding, longer texts and recognize implicit meaning

**Sample words:** abdicate, aberration, abhorrent, abrasive, abundance, accredited, activism, admonish, affluent, aggregate

**Total:** 651 words

---

### C2 - Proficiency (5.4% of words)
**Description:** Can understand with ease virtually everything heard or read

**Sample words:** appreciable, apprehensive, clandestine, confectionery, conscientious, consolidate, contemporary, contemptible, contentious, corroborate

**Total:** 101 words (most challenging)

---

## Distribution Across Vocabulary Sets

Total words with CEFR levels: **1,863**

- SSAT Vocabulary: 513 words
- Wordly Wise Level 3: 150 words
- Wordly Wise Level 4: 300 words
- Wordly Wise Level 5: 300 words
- Wordly Wise Level 6: 300 words
- Wordly Wise Level 7: 300 words

## How to Use CEFR Levels in Code

### TypeScript Interface

```typescript
import { CEFRLevel, VocabularyWord } from '@/lib/vocabulary-levels'

// CEFR Level type
type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

// VocabularyWord now includes cefr_level
interface VocabularyWord {
  word: string
  pronunciation: string
  part_of_speech: string
  meanings: string[]
  examples: string[]
  synonyms: string[]
  antonyms: string[]
  further_information: string[]
  cefr_level?: CEFRLevel  // Optional CEFR level
}
```

### Utility Functions

```typescript
import {
  getCEFRDescription,
  getCEFRDetailedDescription,
  getCEFRColor,
  sortWordsByCEFR,
  filterWordsByCEFR,
  getCEFRDistribution,
  getAllCEFRLevels,
  getWordsByCEFRLevel
} from '@/lib/vocabulary-levels'

// Get human-readable description
const description = getCEFRDescription("B2") // "Upper Intermediate"

// Get detailed description
const detailed = getCEFRDetailedDescription("B2")
// "Can understand the main ideas of complex text on both concrete and abstract topics"

// Get color classes for UI
const color = getCEFRColor("C1")
// "text-red-600 dark:text-red-400 bg-red-500/10"

// Sort words by CEFR level
const sortedWords = sortWordsByCEFR(words)

// Filter words by specific CEFR levels
const intermediateWords = filterWordsByCEFR(words, ["B1", "B2"])

// Get distribution of CEFR levels in a word set
const distribution = getCEFRDistribution(words)
// { A1: 0, A2: 4, B1: 362, B2: 745, C1: 651, C2: 101 }

// Get all CEFR levels
const levels = getAllCEFRLevels()
// ["A1", "A2", "B1", "B2", "C1", "C2"]

// Get words by specific CEFR level
const c1Words = getWordsByCEFRLevel("C1", ["SSAT"])
```

### Example Component Usage

```tsx
import { VocabularyWord, getCEFRDescription, getCEFRColor } from '@/lib/vocabulary-levels'

function WordCard({ word }: { word: VocabularyWord }) {
  return (
    <div className="word-card">
      <h3>{word.word}</h3>
      {word.cefr_level && (
        <span className={`cefr-badge ${getCEFRColor(word.cefr_level)}`}>
          {word.cefr_level} - {getCEFRDescription(word.cefr_level)}
        </span>
      )}
      {/* Rest of word card content */}
    </div>
  )
}
```

## Educational Benefits

### For Students
1. **Progressive Learning:** Start with B1/B2 words and progress to C1/C2
2. **Goal Setting:** Track progress across CEFR levels
3. **Appropriate Challenge:** Study words at appropriate difficulty level
4. **Standardized Assessment:** CEFR is an internationally recognized standard

### For Teachers
1. **Curriculum Planning:** Organize lessons by CEFR level
2. **Assessment:** Measure student progress using standardized levels
3. **Differentiation:** Provide appropriate materials for different proficiency levels
4. **Alignment:** Align with international language proficiency standards

### For Parents
1. **Progress Tracking:** Understand child's vocabulary development
2. **Clear Benchmarks:** Know what level their child is working toward
3. **International Standard:** Compare progress to global standards

## Filtering and Searching

You can now filter vocabulary practice by CEFR level:

- Practice only B1-B2 words for intermediate learners
- Focus on C1-C2 words for advanced preparation
- Create custom study sets by combining specific CEFR levels

## Notes on CEFR Assignment

The current CEFR levels are assigned using heuristics based on:
- Word length
- Morphological complexity
- Common usage patterns
- Educational level appropriateness

### Future Improvements

For more accurate CEFR assignments, consider:
1. Using official CEFR word lists (e.g., English Vocabulary Profile)
2. Integrating with CEFR APIs
3. Manual review by language experts
4. Corpus analysis for frequency data

## Data Location

CEFR levels are stored in the vocabulary JSON files:
- `/data/vocabulary-words.json`
- `/data/wordly-wise-level-3.json`
- `/data/wordly-wise-level-4.json`
- `/data/wordly-wise-level-5.json`
- `/data/wordly-wise-level-6.json`
- `/data/wordly-wise-level-7.json`

## Updating CEFR Levels

To update or regenerate CEFR levels:

```bash
node scripts/fetch-cefr-levels.js
```

This script will:
1. Process all vocabulary files
2. Assign CEFR levels to words without levels
3. Generate a distribution report
4. Update files with new CEFR data

## Color Scheme

The CEFR levels use the following color scheme in the UI:

| Level | Color | Description |
|-------|-------|-------------|
| A1 | Green | Beginner |
| A2 | Blue | Elementary |
| B1 | Yellow | Intermediate |
| B2 | Orange | Upper Intermediate |
| C1 | Red | Advanced |
| C2 | Purple | Proficiency |

## API Reference

See `/lib/vocabulary-levels.ts` for the complete API reference and all available utility functions.

## Resources

- [CEFR Official Framework](https://www.coe.int/en/web/common-european-framework-reference-languages)
- [English Vocabulary Profile](http://www.englishprofile.org/wordlists)
- [Cambridge English CEFR](https://www.cambridgeenglish.org/exams-and-tests/cefr/)

---

**Last Updated:** November 18, 2025
**Script Version:** 1.0.0
**Total Words:** 1,863
