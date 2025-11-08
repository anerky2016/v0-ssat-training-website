"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Info, Volume2, AudioWaveform, ChevronUp, ChevronDown, MousePointerClick, RotateCcw } from "lucide-react"
import {
  getWordDifficulty,
  increaseDifficulty,
  decreaseDifficulty,
  getDifficultyLabel,
  getDifficultyColor,
  hasWordBeenReviewed,
  isUserLoggedIn,
  setWordDifficulty,
  type DifficultyLevel
} from "@/lib/vocabulary-difficulty"
import { useAuth } from "@/contexts/firebase-auth-context"
import { SpinnerWheel } from "./SpinnerWheel"
import { useMobile } from "@/hooks/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export interface VocabularyWord {
  word: string
  pronunciation: string
  part_of_speech: string
  meanings: string[]
  examples: string[]
  synonyms: string[]
  antonyms: string[]
  further_information: string[]
}

interface VocabularyFlashcardProps {
  word: VocabularyWord
  isFlipped: boolean
  isMastered: boolean
  currentlyPlaying: string | null // Track which text is currently playing
  showDetails: boolean
  onFlip: () => void
  onPronounce: (word: string) => void
  onToggleDetails: () => void
  onNext?: () => void
  onPrevious?: () => void
}

export function VocabularyFlashcard({
  word,
  isFlipped,
  isMastered,
  currentlyPlaying,
  showDetails,
  onFlip,
  onPronounce,
  onToggleDetails,
  onNext,
  onPrevious,
}: VocabularyFlashcardProps) {
  const { user } = useAuth()
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1)
  const [isReviewed, setIsReviewed] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false)
  const isMobile = useMobile()

  // Check if user is logged in (for enabling difficulty controls)
  const isLoggedIn = !!user

  // Load difficulty from Supabase
  useEffect(() => {
    const loadDifficulty = async () => {
      // Check if user is logged in
      if (!isUserLoggedIn()) {
        setIsReviewed(false)
        setDifficulty(1) // Default to Medium for display
        return
      }

      try {
        const currentDifficulty = await getWordDifficulty(word.word)
        const reviewed = await hasWordBeenReviewed(word.word)

        setDifficulty(currentDifficulty ?? 1) // Default to Medium if null
        setIsReviewed(reviewed)
      } catch (error) {
        console.error('Failed to load word difficulty:', error)
        setIsReviewed(false)
        setDifficulty(1)
      }
    }
    loadDifficulty()
  }, [word.word])

  // Keyboard navigation support for desktop browsers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys if user is not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (onPrevious) {
            onPrevious()
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (onNext) {
            onNext()
          }
          break
        case 'Enter':
        case ' ': // Spacebar
          e.preventDefault()
          onFlip()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNext, onPrevious, onFlip])

  const handleIncreaseDifficulty = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newDifficulty = await increaseDifficulty(word.word)
    setDifficulty(newDifficulty)
    setIsReviewed(true)
  }

  const handleDecreaseDifficulty = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newDifficulty = await decreaseDifficulty(word.word)
    setDifficulty(newDifficulty)
    setIsReviewed(true)
  }

  const handleSpinnerWheelChange = async (value: number) => {
    await setWordDifficulty(word.word, value as DifficultyLevel)
    setDifficulty(value as DifficultyLevel)
    setIsReviewed(true)
    // Close the picker after selection
    setShowDifficultyPicker(false)
  }

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onNext) {
      onNext()
    } else if (isRightSwipe && onPrevious) {
      onPrevious()
    }
  }

  return (
    <div
      className="w-full mb-6"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front of card */}
        <Card
          className="w-full border-2 border-chart-7 bg-card flex items-center justify-center min-h-[500px] cursor-pointer"
          onClick={onFlip}
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardContent className="text-center p-8 w-full">
            {/* Difficulty Badge - Front */}
            <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
              <div className={`px-3 py-1 rounded text-xs font-medium ${getDifficultyColor(difficulty, isReviewed)}`}>
                {getDifficultyLabel(difficulty, isReviewed)}
              </div>
            </div>

            <div className="text-5xl font-bold text-foreground mb-3">
              {word.word}
            </div>
            <div className="flex flex-col items-center justify-center gap-3 mb-4">
              <Button
                onClick={async (e) => {
                  e.stopPropagation()
                  
                  // On iOS, try SpeechSynthesis synchronously before async operations
                  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
                  
                  // For iOS, we need to call SpeechSynthesis synchronously in the click handler
                  // But we can't set currentlyPlaying here (it's a prop), so let parent handle it
                  // Just call onPronounce - parent's pronounceWord should handle iOS properly
                  await onPronounce(word.word)
                }}
                className={`h-14 w-14 p-0 rounded-full transition-all duration-200 shadow-lg active:scale-95 ${
                  currentlyPlaying === word.word
                    ? 'bg-chart-1 hover:bg-chart-1/90 animate-pulse scale-110'
                    : 'bg-chart-1 hover:bg-chart-1/90 hover:scale-110'
                }`}
                title="Click to hear pronunciation"
              >
                {currentlyPlaying === word.word ? (
                  <AudioWaveform className="h-7 w-7 text-white animate-pulse" />
                ) : (
                  <Volume2 className="h-7 w-7 text-white" />
                )}
              </Button>
              <span className="text-xl text-muted-foreground">
                {word.pronunciation}
              </span>
            </div>
            <div className="text-lg text-muted-foreground italic">
              ({word.part_of_speech})
            </div>
            {isMastered && (
              <div className="mt-6 flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Mastered</span>
              </div>
            )}
            <div className="mt-12 flex items-center justify-center gap-3 text-base text-muted-foreground font-medium">
              <MousePointerClick className="h-6 w-6 text-chart-7" />
              <span>Click to reveal definition</span>
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className="absolute top-0 left-0 w-full h-auto border-2 border-chart-7 bg-card cursor-pointer"
          onClick={onFlip}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <CardContent className="p-6 sm:p-8">
            {/* Difficulty Controls - Back */}
            <div className="flex flex-col items-center gap-4 mb-4 pb-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Difficulty Level
              </h3>
              
              {/* Desktop: Circular Difficulty Buttons */}
              {!isMobile && (
                <div className="flex items-center justify-center gap-1.5">
                  {/* Wait for decision (Not Reviewed) */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      setDifficulty(1)
                      setIsReviewed(false)
                      // Clear from Supabase to mark as not reviewed
                      if (isLoggedIn) {
                        await setWordDifficulty(word.word, 1)
                      }
                    }}
                    disabled={!isLoggedIn}
                    className={`px-3 py-2 rounded-full border-2 flex items-center justify-center font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      !isReviewed
                        ? 'bg-chart-5 border-chart-5 text-white shadow-lg scale-105'
                        : 'bg-background border-chart-5/30 text-muted-foreground hover:border-chart-5 hover:scale-105 hover:shadow-md'
                    }`}
                    title={!isLoggedIn ? "Log in to track difficulty" : "Wait for decision"}
                  >
                    Wait for decision
                  </button>

                  {/* Easy */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      await setWordDifficulty(word.word, 0)
                      setDifficulty(0)
                      setIsReviewed(true)
                    }}
                    disabled={!isLoggedIn}
                    className={`px-3 py-2 rounded-full border-2 flex items-center justify-center font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isReviewed && difficulty === 0
                        ? 'bg-chart-5 border-chart-5 text-white shadow-lg scale-105'
                        : 'bg-background border-chart-5/30 text-muted-foreground hover:border-chart-5 hover:scale-105 hover:shadow-md'
                    }`}
                    title={!isLoggedIn ? "Log in to track difficulty" : "Easy"}
                  >
                    Easy
                  </button>

                  {/* Medium */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      await setWordDifficulty(word.word, 1)
                      setDifficulty(1)
                      setIsReviewed(true)
                    }}
                    disabled={!isLoggedIn}
                    className={`px-3 py-2 rounded-full border-2 flex items-center justify-center font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isReviewed && difficulty === 1
                        ? 'bg-chart-5 border-chart-5 text-white shadow-lg scale-105'
                        : 'bg-background border-chart-5/30 text-muted-foreground hover:border-chart-5 hover:scale-105 hover:shadow-md'
                    }`}
                    title={!isLoggedIn ? "Log in to track difficulty" : "Medium"}
                  >
                    Medium
                  </button>

                  {/* Hard */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      await setWordDifficulty(word.word, 2)
                      setDifficulty(2)
                      setIsReviewed(true)
                    }}
                    disabled={!isLoggedIn}
                    className={`px-3 py-2 rounded-full border-2 flex items-center justify-center font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isReviewed && difficulty === 2
                        ? 'bg-chart-5 border-chart-5 text-white shadow-lg scale-105'
                        : 'bg-background border-chart-5/30 text-muted-foreground hover:border-chart-5 hover:scale-105 hover:shadow-md'
                    }`}
                    title={!isLoggedIn ? "Log in to track difficulty" : "Hard"}
                  >
                    Hard
                  </button>

                  {/* Very Hard */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      await setWordDifficulty(word.word, 3)
                      setDifficulty(3)
                      setIsReviewed(true)
                    }}
                    disabled={!isLoggedIn}
                    className={`px-3 py-2 rounded-full border-2 flex items-center justify-center font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isReviewed && difficulty === 3
                        ? 'bg-chart-5 border-chart-5 text-white shadow-lg scale-105'
                        : 'bg-background border-chart-5/30 text-muted-foreground hover:border-chart-5 hover:scale-105 hover:shadow-md'
                    }`}
                    title={!isLoggedIn ? "Log in to track difficulty" : "Very Hard"}
                  >
                    Very Hard
                  </button>
                </div>
              )}

              {/* Mobile: Difficulty Picker Button */}
              {isMobile && (
                <div className="flex flex-col items-center gap-2 w-full">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDifficultyPicker(true)
                    }}
                    disabled={!isLoggedIn}
                    variant="outline"
                    className={`w-full ${getDifficultyColor(difficulty, isReviewed)}`}
                    title={!isLoggedIn ? "Log in to track difficulty" : "Adjust difficulty"}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-semibold">
                        {getDifficultyLabel(difficulty, isReviewed)}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </Button>
                  
                  {/* Spinner Wheel Bottom Sheet */}
                  <Sheet open={showDifficultyPicker} onOpenChange={setShowDifficultyPicker}>
                    <SheetContent side="bottom" className="h-auto max-h-[60vh] p-0">
                      <SheetHeader className="px-6 pt-6 pb-4">
                        <SheetTitle className="text-center">Select Difficulty</SheetTitle>
                      </SheetHeader>
                      <div className="flex justify-center px-6 pb-6">
                        <div className="w-full max-w-[280px]">
                          <SpinnerWheel
                            options={[
                              { value: 0, label: 'Easy', color: 'rgb(22, 163, 74)' },
                              { value: 1, label: 'Medium', color: 'rgb(202, 138, 4)' },
                              { value: 2, label: 'Hard', color: 'rgb(234, 88, 12)' },
                              { value: 3, label: 'Very Hard', color: 'rgb(220, 38, 38)' },
                            ]}
                            value={difficulty}
                            onChange={handleSpinnerWheelChange}
                            disabled={!isLoggedIn}
                          />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Meanings */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                  Definition{word.meanings.length > 1 ? 's' : ''}
                </h3>
                <ol className="list-decimal list-inside space-y-2">
                  {word.meanings.map((meaning, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground leading-relaxed group flex items-start gap-2">
                      <span className="flex-1">{meaning}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onPronounce(meaning)
                        }}
                        className="flex-shrink-0 p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                        title="Click to hear definition"
                      >
                        {currentlyPlaying === meaning ? (
                          <AudioWaveform className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-transform animate-pulse" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-transform" />
                        )}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Examples */}
              {word.examples && word.examples.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                    Example{word.examples.length > 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-2">
                    {word.examples.slice(0, 2).map((example, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground italic">
                        "{example}"
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Synonyms */}
              {word.synonyms && word.synonyms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                    Synonyms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {word.synonyms.slice(0, 4).map((syn, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation()
                          onPronounce(syn)
                        }}
                        className="group px-2 py-1 text-xs rounded-md bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 transition-all active:scale-95 flex items-center gap-1.5"
                        title={`Click to hear pronunciation of "${syn}"`}
                      >
                        <span>{syn}</span>
                        {currentlyPlaying === syn ? (
                          <AudioWaveform className="h-3 w-3 opacity-100 animate-pulse transition-opacity" />
                        ) : (
                          <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Antonyms */}
              {word.antonyms && word.antonyms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                    Antonyms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {word.antonyms.map((ant, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation()
                          onPronounce(ant)
                        }}
                        className="group px-2 py-1 text-xs rounded-md bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20 transition-all active:scale-95 flex items-center gap-1.5"
                        title={`Click to hear pronunciation of "${ant}"`}
                      >
                        <span>{ant}</span>
                        {currentlyPlaying === ant ? (
                          <AudioWaveform className="h-3 w-3 opacity-100 animate-pulse transition-opacity" />
                        ) : (
                          <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Show Details Button */}
              {word.further_information && word.further_information.length > 0 && (
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleDetails()
                    }}
                    className="text-chart-7 hover:text-chart-7"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    {showDetails ? "Hide" : "Show"} Etymology & Notes
                  </Button>

                  {showDetails && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <ul className="space-y-2">
                        {word.further_information.map((info, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <div className="mt-1 h-1 w-1 rounded-full bg-chart-7 flex-shrink-0" />
                            <span className="leading-relaxed">{info}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 text-base text-muted-foreground font-medium">
              <RotateCcw className="h-6 w-6 text-chart-7" />
              <span>Click to flip back</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
