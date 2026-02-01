"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LevelSelector } from "@/components/vocabulary/LevelSelector"
import { BookOpen, Sparkles, Copy, RefreshCw, Loader2, Check, Info, Volume2 } from "lucide-react"
import { VocabularyLevel, loadVocabularyWords, type VocabularyWord as FullVocabularyWord } from "@/lib/vocabulary-levels"
import { cn } from "@/lib/utils"
import { storyTypes, type StoryType, type StorySubtype } from "@/lib/story-types"
import { getAllDifficulties, isUserLoggedIn } from "@/lib/vocabulary-difficulty"
import { getUserStoryHistory, deleteStoryFromHistory, type StoryHistoryRecord } from "@/lib/story-history"
import { auth } from "@/lib/firebase"
import { trackStoryReading, trackWordReview } from "@/lib/activity-tracker"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface GeneratedStory {
  story: string
  words: { word: string; level: VocabularyLevel; meaning: string }[]
  metadata: {
    levels: VocabularyLevel[]
    wordsUsed: number
    generatedAt: string
  }
}

// Separate component for vocabulary word with tooltip
function VocabularyWordTooltip({
  word,
  wordData,
}: {
  word: string
  wordData: FullVocabularyWord & { level: VocabularyLevel }
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement
      // If click is outside the tooltip, close it
      if (!target.closest('[data-radix-tooltip-content]') && !target.closest('[data-radix-tooltip-trigger]')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger
          asChild
          onClick={(e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
        >
          <strong
            className="text-primary font-semibold cursor-pointer underline decoration-dotted hover:decoration-solid transition-all touch-manipulation select-none"
            style={{
              WebkitTapHighlightColor: 'transparent',
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {word}
          </strong>
        </TooltipTrigger>
        <TooltipContent className="max-w-md p-4" side="top" align="start">
          <div className="space-y-3">
            {/* Word and Pronunciation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-base">{wordData.word}</h4>
                <Badge variant="secondary" className="text-xs">
                  {wordData.level === "SSAT" ? "SSAT" : `WW${wordData.level}`}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground italic">{wordData.pronunciation}</p>
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    try {
                      const response = await fetch('/api/tts/volcengine', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: wordData.word }),
                      })
                      if (response.ok) {
                        const audioBlob = await response.blob()
                        const audioUrl = URL.createObjectURL(audioBlob)
                        const audio = new Audio(audioUrl)
                        audio.play()
                        audio.onended = () => URL.revokeObjectURL(audioUrl)
                      }
                    } catch (error) {
                      console.error('TTS error:', error)
                    }
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title="Hear pronunciation"
                >
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <Badge variant="outline" className="text-xs">
                {wordData.part_of_speech}
              </Badge>
            </div>

            {/* Meanings */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">Meanings:</p>
              <ul className="space-y-1 list-disc list-inside">
                {wordData.meanings.slice(0, 2).map((meaning, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground leading-relaxed">
                    {meaning}
                  </li>
                ))}
              </ul>
            </div>

            {/* Synonyms */}
            {wordData.synonyms && wordData.synonyms.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Synonyms:</p>
                <p className="text-xs text-muted-foreground">
                  {wordData.synonyms.slice(0, 5).join(', ')}
                </p>
              </div>
            )}

            {/* Antonyms */}
            {wordData.antonyms && wordData.antonyms.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Antonyms:</p>
                <p className="text-xs text-muted-foreground">
                  {wordData.antonyms.slice(0, 5).join(', ')}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function StoryGenerator() {
  const [selectedLevels, setSelectedLevels] = useState<VocabularyLevel[]>(["SSAT"])
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]) // 0=Easy, 1=Medium, 2=Hard, 3=Very Hard
  const [selectedWords, setSelectedWords] = useState<string[]>([]) // Manually selected words for story
  const [wordsPerLevel, setWordsPerLevel] = useState(3)
  const [storyLength, setStoryLength] = useState<"short" | "medium" | "long">("medium")
  const [selectedStoryType, setSelectedStoryType] = useState<string | null>(null)
  const [selectedStorySubtype, setSelectedStorySubtype] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [userLoggedIn, setUserLoggedIn] = useState(false)
  const [availableWordCount, setAvailableWordCount] = useState<number | null>(null)
  const [storyHistory, setStoryHistory] = useState<StoryHistoryRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null)
  const [wordDifficulties, setWordDifficulties] = useState<Record<string, number>>({}) // word -> difficulty level
  const storyDisplayRef = useRef<HTMLDivElement>(null)

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  // Maximum words allowed per story length
  const MAX_WORDS_BY_LENGTH = {
    short: 10,
    medium: 20,
    long: 40,
  }

  // Calculate available words based on filters
  const availableWords = useMemo(() => {
    if (selectedLetters.length === 0) return []

    let words = loadVocabularyWords(selectedLevels)

    // Filter by selected letters
    words = words.filter(word =>
      selectedLetters.includes(word.word.charAt(0).toUpperCase())
    )

    // Filter by selected difficulties (if any)
    if (selectedDifficulties.length > 0 && userLoggedIn) {
      words = words.filter(word => {
        const difficulty = wordDifficulties[word.word.toLowerCase()]
        // Include words with undefined difficulty or matching selected difficulties
        return difficulty === undefined || selectedDifficulties.includes(difficulty)
      })
    }

    // Sort alphabetically
    words.sort((a, b) => a.word.localeCompare(b.word))

    return words
  }, [selectedLevels, selectedLetters, selectedDifficulties, wordDifficulties, userLoggedIn])

  // Calculate total words and max allowed
  const totalWords = selectedWords.length > 0 ? selectedWords.length : selectedLevels.length * wordsPerLevel
  const maxWords = MAX_WORDS_BY_LENGTH[storyLength]
  const exceedsLimit = totalWords > maxWords

  // Check if user is logged in and load history
  useEffect(() => {
    // Subscribe to auth state changes
    if (!auth) {
      console.log('📖 [StoryGenerator] Firebase auth not configured')
      return
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      const loggedIn = !!user
      console.log('📖 [StoryGenerator] Auth state changed:', {
        loggedIn,
        user: user ? {
          uid: user.uid.substring(0, 8) + '...',
          email: user.email
        } : null
      })
      setUserLoggedIn(loggedIn)

      if (loggedIn) {
        loadStoryHistory()
        loadWordDifficulties()
      } else {
        setStoryHistory([])
        setWordDifficulties({})
      }
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  const loadWordDifficulties = async () => {
    try {
      const difficulties = await getAllDifficulties()
      const difficultyMap: Record<string, number> = {}
      Object.entries(difficulties).forEach(([word, data]) => {
        difficultyMap[word.toLowerCase()] = data.difficulty
      })
      setWordDifficulties(difficultyMap)
    } catch (error) {
      console.error('Error loading word difficulties:', error)
    }
  }

  const loadStoryHistory = async () => {
    console.log('📖 [StoryGenerator] Loading story history...')
    const history = await getUserStoryHistory(20)
    console.log('📖 [StoryGenerator] Story history loaded:', {
      count: history.length,
      data: history
    })
    setStoryHistory(history)
  }

  // Debug: Log when storyHistory or userLoggedIn changes
  useEffect(() => {
    console.log('📖 [StoryGenerator] State changed:', {
      userLoggedIn,
      storyHistoryCount: storyHistory.length,
      shouldShowHistory: userLoggedIn && storyHistory.length > 0
    })
  }, [userLoggedIn, storyHistory])

  // Adjust words per level when levels or story length change to stay within limits
  useEffect(() => {
    const maxWordsPerLevel = Math.floor(maxWords / selectedLevels.length)
    if (wordsPerLevel > maxWordsPerLevel && selectedLevels.length > 0) {
      setWordsPerLevel(Math.max(1, maxWordsPerLevel))
    }
  }, [selectedLevels, storyLength, maxWords, wordsPerLevel])

  // Calculate available words when filters change
  useEffect(() => {
    const calculateAvailableWords = async () => {
      if (selectedDifficulties.length === 0) {
        setAvailableWordCount(null)
        return
      }

      if (!userLoggedIn) {
        setAvailableWordCount(null)
        return
      }

      try {
        const difficulties = await getAllDifficulties()
        let allWords = loadVocabularyWords(selectedLevels)

        // Filter by letter
        if (selectedLetters.length > 0) {
          allWords = allWords.filter(word =>
            selectedLetters.includes(word.word.charAt(0).toUpperCase())
          )
        }

        // Filter by difficulty
        const matchingWords = allWords.filter(word => {
          const wordDifficulty = difficulties[word.word.toLowerCase()]
          if (!wordDifficulty) return false
          return selectedDifficulties.includes(wordDifficulty.difficulty)
        })

        setAvailableWordCount(matchingWords.length)
      } catch (error) {
        console.error('Error calculating available words:', error)
        setAvailableWordCount(null)
      }
    }

    calculateAvailableWords()
  }, [selectedLevels, selectedLetters, selectedDifficulties, userLoggedIn])

  const handleGenerate = async () => {
    if (selectedLevels.length === 0) {
      setError("Please select at least one difficulty level")
      return
    }

    if (exceedsLimit) {
      setError(`For ${storyLength} stories, you can use up to ${maxWords} words. Please reduce the number of words per level or select fewer levels.`)
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const userId = auth?.currentUser?.uid || null

      // If specific words are selected, use those instead of filters
      const requestBody = selectedWords.length > 0
        ? {
            // Use selected words directly
            specificWords: selectedWords,
            storyLength,
            storyType: selectedStoryType,
            storySubtype: selectedStorySubtype,
            userId,
          }
        : {
            // Use filters to randomly select words
            levels: selectedLevels,
            letters: selectedLetters,
            difficulties: selectedDifficulties,
            wordsPerLevel,
            storyLength,
            storyType: selectedStoryType,
            storySubtype: selectedStorySubtype,
            userId,
          }

      const response = await fetch("/api/vocabulary/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error("Failed to generate story")
      }

      const data = await response.json()
      setGeneratedStory(data)

      // Track story generation activity
      // Estimate 5 minutes reading time for short, 10 for medium, 15 for long
      const estimatedMinutes = storyLength === 'short' ? 5 : storyLength === 'medium' ? 10 : 15
      const wordCount = data.words?.length || 0

      // Track both words reviewed (from vocabulary) and reading time
      if (wordCount > 0) {
        await trackWordReview(wordCount)
      }
      await trackStoryReading(estimatedMinutes)

      // Reload history if user is logged in
      if (userLoggedIn) {
        loadStoryHistory()
      }
    } catch (err) {
      setError("Failed to generate story. Please try again.")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (generatedStory?.story) {
      // Remove markdown bold markers for plain text copy
      const plainText = generatedStory.story.replace(/\*\*/g, "")
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  const handleRegenerateWithSameWords = async () => {
    if (!generatedStory) return

    setIsGenerating(true)
    setError(null)

    try {
      const userId = auth?.currentUser?.uid || null

      const response = await fetch("/api/vocabulary/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          words: generatedStory.words, // Use the same words from current story
          storyLength,
          storyType: selectedStoryType,
          storySubtype: selectedStorySubtype,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate story")
      }

      const data = await response.json()
      setGeneratedStory(data)

      // Track story regeneration activity
      const estimatedMinutes = storyLength === 'short' ? 5 : storyLength === 'medium' ? 10 : 15
      const wordCount = data.words?.length || 0

      // Track both words reviewed (from vocabulary) and reading time
      if (wordCount > 0) {
        await trackWordReview(wordCount)
      }
      await trackStoryReading(estimatedMinutes)

      // Reload history if user is logged in
      if (userLoggedIn) {
        loadStoryHistory()
      }
    } catch (err) {
      setError("Failed to regenerate story. Please try again.")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  // Create a word lookup map with full vocabulary data
  const wordLookup = useMemo(() => {
    if (!generatedStory) return new Map()

    const map = new Map<string, FullVocabularyWord & { level: VocabularyLevel }>()

    // Load all vocabulary words from selected levels
    const allVocabWords = loadVocabularyWords(
      Array.from(new Set(generatedStory.words.map(w => w.level)))
    )

    // Create lookup for full word data
    generatedStory.words.forEach(wordData => {
      const fullWord = allVocabWords.find(
        w => w.word.toLowerCase() === wordData.word.toLowerCase()
      )

      if (fullWord) {
        map.set(wordData.word.toLowerCase(), {
          ...fullWord,
          level: wordData.level
        })
      }
    })

    return map
  }, [generatedStory])

  // Create word lookup from a list of words
  const createWordLookup = (words: { word: string; level: VocabularyLevel; meaning: string }[]) => {
    const map = new Map<string, FullVocabularyWord & { level: VocabularyLevel }>()

    // Load all vocabulary words from selected levels
    const allVocabWords = loadVocabularyWords(
      Array.from(new Set(words.map(w => w.level)))
    )

    // Create lookup for full word data
    words.forEach(wordData => {
      const fullWord = allVocabWords.find(
        w => w.word.toLowerCase() === wordData.word.toLowerCase()
      )

      if (fullWord) {
        map.set(wordData.word.toLowerCase(), {
          ...fullWord,
          level: wordData.level
        })
      }
    })

    return map
  }

  // Render story with clickable vocabulary words
  const renderStoryWithTooltips = (story: string, words: { word: string; level: VocabularyLevel; meaning: string }[]) => {
    const lookup = createWordLookup(words)

    // Split by the **word** pattern to find vocabulary words
    const parts = story.split(/(\*\*.*?\*\*)/)

    return parts.map((part, index) => {
      // Check if this part is a vocabulary word (wrapped in **)
      const match = part.match(/\*\*(.*?)\*\*/)

      if (match) {
        const word = match[1]
        const wordData = lookup.get(word.toLowerCase())

        if (wordData) {
          return <VocabularyWordTooltip key={index} word={word} wordData={wordData} />
        } else {
          // If word not found in lookup, just render it bolded
          return <strong key={index} className="text-primary font-semibold">{word}</strong>
        }
      } else {
        // Regular text - split by newlines and render with <br />
        return part.split('\n').map((line, lineIndex, array) => (
          <span key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < array.length - 1 && <br />}
          </span>
        ))
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Story Generator Settings</CardTitle>
          </div>
          <CardDescription>
            Select difficulty levels and customize your vocabulary story
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level Selector */}
          <LevelSelector
            selectedLevels={selectedLevels}
            onLevelsChange={setSelectedLevels}
          />

          {/* Story Type Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Story Type (optional)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {storyTypes.map((type) => (
                <Button
                  key={type.id}
                  onClick={() => {
                    if (selectedStoryType === type.id) {
                      setSelectedStoryType(null)
                      setSelectedStorySubtype(null)
                    } else {
                      setSelectedStoryType(type.id)
                      setSelectedStorySubtype(null) // Reset subtype when changing type
                    }
                  }}
                  variant={selectedStoryType === type.id ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-auto py-2 px-3 text-left flex flex-col items-start gap-1",
                    selectedStoryType === type.id && "bg-chart-2 hover:bg-chart-2/90"
                  )}
                >
                  <span className="text-base">{type.icon}</span>
                  <span className="text-xs font-medium leading-tight">{type.label}</span>
                </Button>
              ))}
            </div>
            {selectedStoryType && (
              <p className="text-xs text-muted-foreground">
                {storyTypes.find(t => t.id === selectedStoryType)?.description}
              </p>
            )}
          </div>

          {/* Story Subtype Selector - Only show if type is selected */}
          {selectedStoryType && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">
                  Story Subtype
                </Label>
                {selectedStorySubtype && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStorySubtype(null)}
                    className="text-xs h-7"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <RadioGroup
                value={selectedStorySubtype || ""}
                onValueChange={setSelectedStorySubtype}
                className="grid grid-cols-1 gap-2"
              >
                {storyTypes
                  .find(t => t.id === selectedStoryType)
                  ?.subtypes.map((subtype) => (
                    <div
                      key={subtype.id}
                      className="flex items-start space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={subtype.id} id={subtype.id} className="mt-0.5" />
                      <Label htmlFor={subtype.id} className="font-normal cursor-pointer flex-1">
                        <span className="font-semibold text-sm block mb-0.5">{subtype.label}</span>
                        <span className="text-xs text-muted-foreground">{subtype.description}</span>
                      </Label>
                    </div>
                  ))}
              </RadioGroup>
            </div>
          )}

          {/* Alphabet Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">
                Filter by first letter (optional)
              </Label>
              {selectedLetters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLetters([])}
                  className="text-xs h-7"
                >
                  Clear ({selectedLetters.length})
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {alphabet.map((letter) => {
                const isSelected = selectedLetters.includes(letter)
                return (
                  <Button
                    key={letter}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedLetters(selectedLetters.filter(l => l !== letter))
                      } else {
                        setSelectedLetters([...selectedLetters, letter])
                      }
                    }}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 text-xs font-medium",
                      isSelected && "bg-chart-1 hover:bg-chart-1/90"
                    )}
                  >
                    {letter}
                  </Button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedLetters.length === 0
                ? "Select letters to only use words starting with those letters"
                : `Using words starting with: ${selectedLetters.sort().join(", ")}`}
            </p>
          </div>

          {/* Word Selection List - Shows when letters are selected */}
          {availableWords.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">
                  Select specific words ({selectedWords.length} / {maxWords} max)
                </Label>
                {selectedWords.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedWords([])
                      // Reset slider to default when clearing selected words
                      setWordsPerLevel(3)
                    }}
                    className="text-xs h-7"
                  >
                    Clear ({selectedWords.length})
                  </Button>
                )}
              </div>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-muted/30">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableWords.map((word) => {
                    const isSelected = selectedWords.includes(word.word)
                    const difficulty = wordDifficulties[word.word.toLowerCase()]

                    // Get difficulty color: 0=Easy(green), 1=Medium(orange), 2=Hard(red), 3=Very Hard(purple), unset=blue(wait for decision)
                    const getDifficultyColor = () => {
                      if (difficulty === undefined || difficulty === null) {
                        return {
                          border: 'border-blue-400',
                          bg: 'bg-blue-50 dark:bg-blue-950/20',
                          hoverBorder: 'hover:border-blue-500',
                          selectedBorder: 'border-blue-600',
                          selectedBg: 'bg-blue-600',
                          selectedText: 'text-white'
                        }
                      }
                      switch (difficulty) {
                        case 0: // Easy - Green
                          return {
                            border: 'border-green-400',
                            bg: 'bg-green-50 dark:bg-green-950/20',
                            hoverBorder: 'hover:border-green-500',
                            selectedBorder: 'border-green-600',
                            selectedBg: 'bg-green-600',
                            selectedText: 'text-white'
                          }
                        case 1: // Medium - Orange
                          return {
                            border: 'border-orange-400',
                            bg: 'bg-orange-50 dark:bg-orange-950/20',
                            hoverBorder: 'hover:border-orange-500',
                            selectedBorder: 'border-orange-600',
                            selectedBg: 'bg-orange-600',
                            selectedText: 'text-white'
                          }
                        case 2: // Hard - Red
                          return {
                            border: 'border-red-400',
                            bg: 'bg-red-50 dark:bg-red-950/20',
                            hoverBorder: 'hover:border-red-500',
                            selectedBorder: 'border-red-600',
                            selectedBg: 'bg-red-600',
                            selectedText: 'text-white'
                          }
                        case 3: // Very Hard - Purple
                          return {
                            border: 'border-purple-400',
                            bg: 'bg-purple-50 dark:bg-purple-950/20',
                            hoverBorder: 'hover:border-purple-500',
                            selectedBorder: 'border-purple-600',
                            selectedBg: 'bg-purple-600',
                            selectedText: 'text-white'
                          }
                        default:
                          return {
                            border: 'border-blue-400',
                            bg: 'bg-blue-50 dark:bg-blue-950/20',
                            hoverBorder: 'hover:border-blue-500',
                            selectedBorder: 'border-blue-600',
                            selectedBg: 'bg-blue-600',
                            selectedText: 'text-white'
                          }
                      }
                    }

                    const colors = getDifficultyColor()

                    return (
                      <button
                        key={word.word}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedWords(selectedWords.filter(w => w !== word.word))
                          } else {
                            if (selectedWords.length < maxWords) {
                              setSelectedWords([...selectedWords, word.word])
                            }
                          }
                        }}
                        disabled={!isSelected && selectedWords.length >= maxWords}
                        className={cn(
                          "text-left px-3 py-2 rounded-md border-2 transition-all text-sm",
                          isSelected
                            ? `${colors.selectedBorder} ${colors.selectedBg} ${colors.selectedText} font-medium`
                            : `${colors.border} ${colors.bg} ${colors.hoverBorder} text-foreground`,
                          !isSelected && selectedWords.length >= maxWords && "opacity-40 cursor-not-allowed"
                        )}
                        title={word.meanings[0]}
                      >
                        {word.word}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {selectedWords.length === 0
                    ? `Click words to select them for your story (max ${maxWords})`
                    : `${selectedWords.length} ${selectedWords.length === 1 ? 'word' : 'words'} selected. ${maxWords - selectedWords.length} more available.`}
                </p>
                {userLoggedIn && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="text-muted-foreground font-medium">Difficulty colors:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded border-2 border-purple-400 bg-purple-50 dark:bg-purple-950/20"></div>
                      <span className="text-muted-foreground">Very Hard</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded border-2 border-red-400 bg-red-50 dark:bg-red-950/20"></div>
                      <span className="text-muted-foreground">Hard</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded border-2 border-orange-400 bg-orange-50 dark:bg-orange-950/20"></div>
                      <span className="text-muted-foreground">Medium</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded border-2 border-green-400 bg-green-50 dark:bg-green-950/20"></div>
                      <span className="text-muted-foreground">Easy</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded border-2 border-blue-400 bg-blue-50 dark:bg-blue-950/20"></div>
                      <span className="text-muted-foreground">Not rated</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Word Difficulty Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">
                Filter by word difficulty (optional)
              </Label>
              {selectedDifficulties.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDifficulties([])}
                  className="text-xs h-7"
                >
                  Clear ({selectedDifficulties.length})
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 0, label: 'Easy', color: 'bg-green-500 hover:bg-green-600', textColor: 'text-white' },
                { value: 1, label: 'Medium', color: 'bg-yellow-500 hover:bg-yellow-600', textColor: 'text-white' },
                { value: 2, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600', textColor: 'text-white' },
                { value: 3, label: 'Very Hard', color: 'bg-red-500 hover:bg-red-600', textColor: 'text-white' }
              ].map((difficulty) => {
                const isSelected = selectedDifficulties.includes(difficulty.value)
                return (
                  <Button
                    key={difficulty.value}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDifficulties(selectedDifficulties.filter(d => d !== difficulty.value))
                      } else {
                        setSelectedDifficulties([...selectedDifficulties, difficulty.value])
                      }
                    }}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-9 font-medium text-xs",
                      isSelected && difficulty.color,
                      isSelected && difficulty.textColor
                    )}
                  >
                    {difficulty.label}
                  </Button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedDifficulties.length === 0
                ? "Select difficulty levels to only use words you've marked with those difficulties"
                : `Using only: ${selectedDifficulties.map(d =>
                    d === 0 ? 'Easy' : d === 1 ? 'Medium' : d === 2 ? 'Hard' : 'Very Hard'
                  ).join(', ')} words`}
            </p>
            {selectedDifficulties.length > 0 && !userLoggedIn && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Difficulty filtering requires you to be logged in. Please log in to use this feature.
                </p>
              </div>
            )}
            {selectedDifficulties.length > 0 && userLoggedIn && availableWordCount !== null && (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-800 dark:text-green-200">
                  {availableWordCount} {availableWordCount === 1 ? 'word matches' : 'words match'} your difficulty filter.
                  {availableWordCount < selectedLevels.length * wordsPerLevel && (
                    <span className="font-semibold"> Note: This might not be enough for your selected words per level ({selectedLevels.length * wordsPerLevel} total needed).</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Words Per Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">
                Total vocabulary words: {totalWords} / {maxWords} max
              </Label>
              {selectedWords.length > 0 ? (
                <span className="text-xs text-primary font-medium">
                  {selectedWords.length} manually selected
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {wordsPerLevel} per level × {selectedLevels.length} {selectedLevels.length === 1 ? 'level' : 'levels'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max={Math.max(1, Math.floor(maxWords / selectedLevels.length))}
                value={selectedWords.length > 0 ? selectedWords.length : wordsPerLevel}
                onChange={(e) => setWordsPerLevel(Number(e.target.value))}
                disabled={selectedWords.length > 0}
                className={cn(
                  "w-full h-2 bg-muted rounded-lg appearance-none accent-primary",
                  selectedWords.length > 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
              />
              <span className="text-sm font-medium min-w-[2rem] text-center">
                {selectedWords.length > 0 ? selectedWords.length : wordsPerLevel}
              </span>
            </div>
            <div className="space-y-1">
              <p className={cn(
                "text-xs",
                exceedsLimit ? "text-destructive font-semibold" : "text-muted-foreground"
              )}>
                {exceedsLimit ? (
                  <>⚠️ Exceeds limit for {storyLength} stories. Maximum {maxWords} words allowed.</>
                ) : (
                  <>Maximum {Math.floor(maxWords / selectedLevels.length)} words per level ({maxWords} total)</>
                )}
              </p>
            </div>
          </div>

          {/* Story Length */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Story length
            </Label>
            <RadioGroup
              value={storyLength}
              onValueChange={(value) => {
                setStoryLength(value as "short" | "medium" | "long")
                // Adjust words per level if needed when changing story length
                const newMaxWords = MAX_WORDS_BY_LENGTH[value as "short" | "medium" | "long"]
                const maxWordsPerLevel = Math.floor(newMaxWords / selectedLevels.length)
                if (wordsPerLevel > maxWordsPerLevel) {
                  setWordsPerLevel(Math.max(1, maxWordsPerLevel))
                }
              }}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short" id="short" />
                <Label htmlFor="short" className="font-normal cursor-pointer">
                  Short (~500 words, up to 10 vocabulary words)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="font-normal cursor-pointer">
                  Medium (~1000 words, up to 20 vocabulary words)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="long" id="long" />
                <Label htmlFor="long" className="font-normal cursor-pointer">
                  Long (~2000 words, up to 40 vocabulary words) - Epic story with rich detail
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedLevels.length === 0 || exceedsLimit}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Story...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Story
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Story Display */}
      {generatedStory && (
        <Card ref={storyDisplayRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Your Story</CardTitle>
              </div>
              <TooltipProvider>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        size="sm"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy story to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleRegenerateWithSameWords}
                        variant="outline"
                        size="sm"
                        disabled={isGenerating}
                      >
                        <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                        Same Words
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Regenerate story with the same vocabulary words</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleRegenerate}
                        variant="outline"
                        size="sm"
                        disabled={isGenerating}
                      >
                        <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                        New Words
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate new story with different vocabulary words</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
            <CardDescription>
              Generated on {new Date(generatedStory.metadata.generatedAt).toLocaleDateString()} at{" "}
              {new Date(generatedStory.metadata.generatedAt).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Story Text */}
            <div className="prose prose-sm max-w-none leading-relaxed text-foreground">
              {renderStoryWithTooltips(generatedStory.story, generatedStory.words)}
            </div>

            {/* Vocabulary Words Used */}
            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Vocabulary Words Used ({generatedStory.words.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {generatedStory.words.map((word, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm px-3 py-1"
                    title={word.meaning}
                  >
                    {word.word}
                    <span className="ml-1.5 text-xs opacity-70">
                      {word.level === "SSAT" ? "SSAT" : `L${word.level}`}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story History */}
      {userLoggedIn && storyHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Story History</CardTitle>
              </div>
              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant="ghost"
                size="sm"
              >
                {showHistory ? "Hide" : `Show (${storyHistory.length})`}
              </Button>
            </div>
            <CardDescription>
              Your previously generated stories
            </CardDescription>
          </CardHeader>
          {showHistory && (
            <CardContent className="space-y-3">
              {storyHistory.map((record) => {
                const isExpanded = expandedStoryId === record.id
                return (
                  <div
                    key={record.id}
                    className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {record.story_length}
                          </Badge>
                          {record.story_type && (
                            <Badge variant="secondary" className="text-xs">
                              {storyTypes.find(t => t.id === record.story_type)?.label || record.story_type}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {record.words_used.length} words
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(record.generated_at!).toLocaleDateString()}
                          </span>
                        </div>
                        {!isExpanded && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {record.story_text.replace(/\*\*/g, '').substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setExpandedStoryId(isExpanded ? null : record.id!)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          {isExpanded ? 'Collapse' : 'View'}
                        </Button>
                        <Button
                          onClick={async () => {
                            if (record.id && confirm('Delete this story from history?')) {
                              const success = await deleteStoryFromHistory(record.id)
                              if (success) {
                                loadStoryHistory()
                              }
                            }
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Story Content */}
                    {isExpanded && (
                      <div className="border-t pt-3 space-y-3">
                        <div className="prose prose-sm max-w-none leading-relaxed text-foreground">
                          {renderStoryWithTooltips(record.story_text, record.words_used)}
                        </div>

                        {/* Vocabulary Words Used */}
                        <div className="border-t pt-3 space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            Vocabulary Words ({record.words_used.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {record.words_used.map((word, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-sm px-3 py-1"
                                title={word.meaning}
                              >
                                {word.word}
                                <span className="ml-1.5 text-xs opacity-70">
                                  {word.level === "SSAT" ? "SSAT" : `L${word.level}`}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
