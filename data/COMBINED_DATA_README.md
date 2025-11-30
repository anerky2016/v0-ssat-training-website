# Combined Sentence Completion Data

## Overview
This file documents the combined sentence completion data generated from Wordly Wise 3000 chapters 3-40 and existing SSAT sentence completion questions.

## File Location
`data/combined-sentence-completion.json`

## Data Structure

```json
{
  "metadata": {
    "totalQuestions": 3778,
    "chapterQuestions": 3750,
    "existingSentenceCompletions": 28,
    "chapters": "3-40",
    "generatedAt": "2025-11-27T15:XX:XX.XXXZ"
  },
  "chapterQuestions": [...],
  "sentenceCompletionQuestions": [...]
}
```

## Data Sources

### Chapter Questions (3,750 questions)
- **Source**: `/Users/diz/git/auto-web/data/`
- **Chapters**: 3-40 from Wordly Wise 3000
- **Format**: Each question includes:
  - `questionNumber`: Sequential number
  - `question`: Sentence with blank
  - `options`: Array of 4 options (A-D) with letter and text
  - `correctAnswer`: Letter of correct answer
  - `solution`: Definition with pronunciation and notes
  - `chapter`: Chapter number (3-40)
  - `source`: "Wordly Wise 3000"

### Existing Sentence Completion Questions (28 questions)
- **Source**: `data/vocab_questions.json`
- **Format**: Each question includes:
  - `word`: Target vocabulary word
  - `source`: Original source (e.g., "web resource")
  - `id`: Question identifier
  - `question`: Sentence with blank
  - `options`: Array of 4 word options
  - `answer`: Correct word

## Chapter Distribution

| Chapter | Questions | Status |
|---------|-----------|--------|
| 3-31    | 100 each  | ✓      |
| 32      | 50        | ✓      |
| 33-40   | 100 each  | ✓      |

**Total**: 3,750 questions from 38 chapters (all chapters from 3-40 included)

## Generation Script
The data was combined using `scripts/combine-chapter-data.js`, which:
1. Reads all chapter files (3-40) from `/Users/diz/git/auto-web/data/`
2. Extracts sentence completion questions from `vocab_questions.json`
3. Combines both datasets with metadata
4. Outputs to `data/combined-sentence-completion.json`

## Usage
This combined dataset can be used for:
- Vocabulary practice exercises
- Sentence completion quizzes
- Study material for SSAT preparation
- Integration with the vocabulary training application

## File Size
- **Size**: ~2.8 MB
- **Total Questions**: 3,778 (3,750 chapter questions + 28 sentence completion questions)

## Date Generated
2025-11-27
