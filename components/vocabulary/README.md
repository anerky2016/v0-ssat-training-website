# Vocabulary Components

Reusable components for rendering SSAT vocabulary words throughout the application.

## Components

### VocabularyWordCard

A comprehensive card component that displays a vocabulary word with all its details including pronunciation, definitions, examples, synonyms, antonyms, and etymology.

### VocabularyFlashcard

An interactive flip-card component for vocabulary practice with front/back animation, audio pronunciation, and progress tracking.

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

---

## VocabularyFlashcard Component

### Usage

```tsx
import { VocabularyFlashcard } from "@/components/vocabulary/VocabularyFlashcard"
import vocabularyData from "@/data/vocabulary-words.json"

export default function FlashcardPractice() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isMastered, setIsMastered] = useState(false)

  const word = vocabularyData.words[0]

  const pronounceWord = (wordText: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(true)
      const utterance = new SpeechSynthesisUtterance(wordText)
      utterance.rate = 0.8
      utterance.onend = () => setIsPlaying(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <VocabularyFlashcard
      word={word}
      isFlipped={isFlipped}
      isMastered={isMastered}
      isPlaying={isPlaying}
      showDetails={showDetails}
      onFlip={() => setIsFlipped(!isFlipped)}
      onPronounce={pronounceWord}
      onToggleDetails={() => setShowDetails(!showDetails)}
    />
  )
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `word` | `VocabularyWord` | Yes | The vocabulary word object to display |
| `isFlipped` | `boolean` | Yes | Controls whether card is flipped to back |
| `isMastered` | `boolean` | Yes | Shows mastered badge on front of card |
| `isPlaying` | `boolean` | Yes | Controls audio button animation state |
| `showDetails` | `boolean` | Yes | Controls whether etymology section is expanded |
| `onFlip` | `() => void` | Yes | Callback when card is clicked to flip |
| `onPronounce` | `(word: string) => void` | Yes | Callback to handle audio pronunciation |
| `onToggleDetails` | `() => void` | Yes | Callback to toggle etymology section |

### Features

#### 1. 3D Flip Animation
- Click anywhere on card to flip between front and back
- Smooth CSS 3D transform animation (500ms duration)
- Front and back maintain proper visibility with `backfaceVisibility: hidden`
- Perspective depth for realistic 3D effect

#### 2. Front of Card
- Large, bold word display (5xl size)
- Interactive audio pronunciation button
  - Circular button with speaker icon
  - Pulse animation when audio is playing
  - Scale animation on hover
- Phonetic pronunciation guide
- Part of speech label
- "Mastered" badge when word is marked as mastered
- Click hint text at bottom

#### 3. Back of Card
- **Definitions**: Numbered list of all meanings
- **Examples**: Shows first 2 examples in italic text
- **Synonyms**: Comma-separated list (first 4 only)
- **Antonyms**: Comma-separated list (all antonyms)
- **Etymology & Notes**: Collapsible section with additional information
  - Button to show/hide details
  - Styled background for expanded section
  - Bullet points for each note
- Click hint text to flip back

#### 4. Responsive Design
- Minimum height of 450px for consistent card size
- Scrollable back content if it exceeds card height
- Mobile-friendly touch interactions
- Responsive padding and text sizes

### Card States

The component handles multiple visual states:

1. **Default State**: Front of card showing word
2. **Flipped State**: Back of card showing definitions
3. **Playing State**: Audio button pulsing during pronunciation
4. **Mastered State**: Green checkmark badge displayed
5. **Details Expanded**: Etymology section visible

### Example: Full Implementation

```tsx
"use client"

import { useState } from "react"
import { VocabularyFlashcard } from "@/components/vocabulary/VocabularyFlashcard"
import vocabularyData from "@/data/vocabulary-words.json"

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredWords, setMasteredWords] = useState<Set<number>>(new Set())
  const [showDetails, setShowDetails] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const words = vocabularyData.words

  const pronounceWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(true)
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.rate = 0.8
      utterance.onend = () => setIsPlaying(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowDetails(false)
      setIsPlaying(false)
      window.speechSynthesis?.cancel()
    }
  }

  const handleMarkMastered = () => {
    setMasteredWords(new Set(masteredWords).add(currentIndex))
    if (currentIndex < words.length - 1) {
      handleNext()
    }
  }

  const currentWord = words[currentIndex]

  return (
    <div>
      <VocabularyFlashcard
        word={currentWord}
        isFlipped={isFlipped}
        isMastered={masteredWords.has(currentIndex)}
        isPlaying={isPlaying}
        showDetails={showDetails}
        onFlip={() => setIsFlipped(!isFlipped)}
        onPronounce={pronounceWord}
        onToggleDetails={() => setShowDetails(!showDetails)}
      />

      {/* Navigation buttons, progress tracking, etc. */}
    </div>
  )
}
```

### Styling

The component uses these color tokens:
- `chart-7`: Primary accent color for borders, buttons, badges
- `chart-1`: Audio button color
- `card`: Card background
- `foreground`: Primary text
- `muted-foreground`: Secondary text
- `green-600`: Mastered badge color

### Content Limitations

For optimal flashcard UX, the back of the card shows:
- **All definitions** (no limit)
- **First 2 examples only** (to prevent overflow)
- **First 4 synonyms only** (condensed for quick review)
- **All antonyms** (typically fewer items)
- **Etymology** (collapsible to save space)

### Accessibility

- **Click Anywhere**: Both front and back are fully clickable for flipping
- **Stop Propagation**: Audio and details buttons don't trigger flip
- **Audio Fallback**: Alert shown if browser doesn't support speech synthesis
- **Semantic HTML**: Proper heading hierarchy and list structures
- **Focus Management**: Cancel audio when navigating away

### Browser Compatibility

- **3D Transforms**: Supported in all modern browsers
- **Web Speech API**:
  - Chrome/Edge: Full support
  - Safari: Full support
  - Firefox: Partial support
- **CSS Backface Visibility**: Universal support

### Performance

- **Lightweight**: ~3kb component (excluding dependencies)
- **Single Card Rendering**: Only renders current word, not all words
- **Controlled State**: Parent manages state for better control
- **Speech Cancellation**: Cleans up audio on unmount/navigation

### File Location

```
components/
└── vocabulary/
    ├── VocabularyFlashcard.tsx
    ├── VocabularyWordCard.tsx
    └── README.md
```

### Used In

- `/app/vocabulary/flashcards/page.tsx` - Main flashcards practice page

## Related Components

- **VocabularyWordCard**: Expandable card for word list display
- **VocabularyFlashcard**: Interactive flip card for practice (documented above)
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

- **v1.1.0** (2025-01-12): Added VocabularyFlashcard component
  - Extracted flip-card from flashcards page into reusable component
  - Controlled component pattern with callbacks for state management
  - Full 3D flip animation with front/back card rendering
  - Audio pronunciation, mastered status, collapsible etymology
  - Reduced flashcards page from 355 to ~195 lines

- **v1.0.0** (2025-01-12): Initial release
  - Extracted VocabularyWordCard from inline template in word-lists page
  - Full feature parity with original implementation
  - Added props for showing/hiding tooltip and audio

## License

Part of the SSAT Training Website project.
