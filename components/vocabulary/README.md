# Vocabulary Components

Reusable components for rendering SSAT vocabulary words throughout the application.

## Components

### VocabularyWordCard

A comprehensive card component that displays a vocabulary word with all its details including pronunciation, definitions, examples, synonyms, antonyms, and etymology.

## VocabularyWordCard Component

### Usage

```tsx
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard"
import vocabularyData from "@/data/vocabulary-words.json"

export default function MyPage() {
  const word = vocabularyData.words[0]

  return <VocabularyWordCard word={word} />
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `word` | `VocabularyWord` | Required | The vocabulary word object to display |
| `showTooltip` | `boolean` | `true` | Enable/disable hover tooltip with quick definition |
| `showAudio` | `boolean` | `true` | Enable/disable audio pronunciation button |

### VocabularyWord Type

```typescript
interface VocabularyWord {
  word: string                    // The vocabulary word
  pronunciation: string           // IPA pronunciation (e.g., "[ab-di-keyt]")
  part_of_speech: string         // Noun, Verb, Adjective, etc.
  meanings: string[]             // Array of definitions
  examples: string[]             // Array of usage examples
  synonyms: string[]             // Array of similar words
  antonyms: string[]             // Array of opposite words
  further_information: string[]  // Etymology, usage notes, etc.
}
```

### Features

#### 1. Interactive Word Title
- Click the word to show/hide a tooltip with quick definition
- Hover effect changes color and adds underline
- Tooltip displays first meaning and part of speech

#### 2. Audio Pronunciation
- Click speaker button to hear the word pronounced
- Uses Web Speech API (browser-based)
- Button animates when audio is playing
- Automatically stops previous pronunciation

#### 3. Comprehensive Information Display

**Definitions**
- Numbered list for multiple meanings
- Clean, readable formatting

**Examples**
- Example sentences with context
- Target word is **bold** and *italic* in examples
- Border accent for visual separation

**Synonyms & Antonyms**
- Badge-style display
- Synonyms: green badges
- Antonyms: red badges
- Responsive grid layout

**Additional Notes**
- Etymology and word origins
- Usage tips and related words
- Bullet-point format with accent dots

### Examples

#### Basic Usage

```tsx
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard"

const word = {
  word: "eloquent",
  pronunciation: "[EL-uh-kwuh nt]",
  part_of_speech: "Adjective",
  meanings: [
    "Fluent or persuasive in speaking or writing.",
    "Clearly expressing or indicating something."
  ],
  examples: [
    "The speaker gave an eloquent speech that moved the audience.",
    "Her eloquent writing style captivated readers."
  ],
  synonyms: ["articulate", "expressive", "fluent"],
  antonyms: ["inarticulate", "hesitant"],
  further_information: [
    "From Latin 'eloqui' meaning 'to speak out'.",
    "Related to 'elocution' - the skill of clear and expressive speech."
  ]
}

export default function Example() {
  return <VocabularyWordCard word={word} />
}
```

#### Without Tooltip

```tsx
<VocabularyWordCard
  word={word}
  showTooltip={false}
/>
```

#### Without Audio

```tsx
<VocabularyWordCard
  word={word}
  showAudio={false}
/>
```

#### Minimal Display

```tsx
<VocabularyWordCard
  word={word}
  showTooltip={false}
  showAudio={false}
/>
```

#### List of Words

```tsx
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard"
import vocabularyData from "@/data/vocabulary-words.json"

export default function WordList() {
  return (
    <div className="space-y-6">
      {vocabularyData.words.map((word, index) => (
        <VocabularyWordCard key={index} word={word} />
      ))}
    </div>
  )
}
```

#### With Search Filter

```tsx
"use client"

import { useState } from "react"
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard"
import vocabularyData from "@/data/vocabulary-words.json"

export default function SearchableWordList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredWords = vocabularyData.words.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <input
        type="text"
        placeholder="Search words..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border"
      />

      <div className="mt-6 space-y-6">
        {filteredWords.map((word, index) => (
          <VocabularyWordCard key={index} word={word} />
        ))}
      </div>

      {filteredWords.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No words found matching "{searchTerm}"
        </p>
      )}
    </div>
  )
}
```

## Styling

The component uses Tailwind CSS with custom theme colors:
- `chart-5`: Primary accent color (used for borders, badges, icons)
- `card`: Card background color
- `muted-foreground`: Secondary text color
- `foreground`: Primary text color

### Customization

The component inherits theme colors from your application. To customize colors, update your `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'chart-5': 'your-color-here',
      }
    }
  }
}
```

## Accessibility

- **Keyboard Navigation**: Card elements are keyboard accessible
- **Screen Readers**: Semantic HTML with proper ARIA labels
- **Focus States**: Clear focus indicators for interactive elements
- **Audio Alternative**: Visual pronunciation guide always displayed

## Browser Compatibility

- **Audio Pronunciation**: Requires Web Speech API support
  - Chrome/Edge: Full support
  - Safari: Full support
  - Firefox: Partial support
  - Falls back to alert if unsupported

## Performance

- **Lightweight**: ~2.5kb gzipped
- **No External Dependencies**: Uses only React and built-in APIs
- **Optimized Rendering**: Only re-renders when props change
- **Self-Contained State**: Each card manages its own tooltip/audio state

## File Location

```
components/
└── vocabulary/
    ├── VocabularyWordCard.tsx
    └── README.md
```

## Used In

- `/app/vocabulary/word-lists/page.tsx` - Main word list page
- Can be used in any page that needs to display vocabulary words

## Related Components

- **VocabularyFlashcard**: Flip-card version for practice (not yet extracted)
- Future: VocabularyQuiz, VocabularySearch, etc.

## Future Enhancements

Potential improvements for the component:

1. **Copy to Clipboard**: Add button to copy word definition
2. **Favorite/Bookmark**: Allow users to mark words for review
3. **Share**: Share word card as image or link
4. **Print-Friendly**: Optimized print styles
5. **Difficulty Badge**: Show word difficulty level
6. **Progress Indicator**: Show if word has been mastered
7. **Animation**: Entrance animations for better UX
8. **Dark Mode**: Optimized colors for dark theme

## Testing

Example test cases:

```tsx
// Test that word is displayed
expect(screen.getByText("eloquent")).toBeInTheDocument()

// Test pronunciation display
expect(screen.getByText("[EL-uh-kwuh nt]")).toBeInTheDocument()

// Test audio button
const audioButton = screen.getByTitle("Click to hear pronunciation")
expect(audioButton).toBeInTheDocument()

// Test tooltip
const wordTitle = screen.getByText("eloquent")
fireEvent.click(wordTitle)
expect(screen.getByText(/Fluent or persuasive/)).toBeInTheDocument()
```

## Contributing

When modifying this component:

1. Maintain backward compatibility
2. Update TypeScript types if schema changes
3. Test with different word data scenarios
4. Verify responsive design on mobile
5. Check accessibility with screen readers
6. Update this README with new features

## Version History

- **v1.0.0** (2025-01-12): Initial release
  - Extracted from inline template in word-lists page
  - Full feature parity with original implementation
  - Added props for showing/hiding tooltip and audio

## License

Part of the SSAT Training Website project.
