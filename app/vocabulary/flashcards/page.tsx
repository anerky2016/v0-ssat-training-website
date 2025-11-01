"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, X } from "lucide-react"
import Link from "next/link"
import vocabularyData from "@/data/vocabulary-words.json"
import { VocabularyFlashcard } from "@/components/vocabulary/VocabularyFlashcard"
import { audioCache } from "@/lib/audio-cache"

export default function FlashcardsPage() {
  const searchParams = useSearchParams()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredWords, setMasteredWords] = useState<Set<number>>(new Set())
  const [showDetails, setShowDetails] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Get source page parameter
  const fromPage = searchParams.get('from') || 'vocabulary'
  const selectedLetter = searchParams.get('letter')

  // Determine back link based on source
  const backLink = fromPage === 'word-lists'
    ? `/vocabulary/word-lists${selectedLetter ? `?letter=${selectedLetter}` : ''}`
    : '/vocabulary'

  // Determine word list name
  const wordListName = selectedLetter
    ? `Words Starting with "${selectedLetter}"`
    : 'All Vocabulary Words'

  // Filter words based on query parameter
  const words = useMemo(() => {
    const wordsParam = searchParams.get('words')
    if (!wordsParam) {
      return vocabularyData.words
    }

    const selectedWords = wordsParam.split(',').map(w => w.trim().toLowerCase())
    return vocabularyData.words.filter(word =>
      selectedWords.includes(word.word.toLowerCase())
    )
  }, [searchParams])

  const pronounceWord = async (word: string) => {
    try {
      setIsPlaying(true)

      let arrayBuffer: ArrayBuffer

      // Check if audio is cached
      const cachedAudio = audioCache.get(word)

      if (cachedAudio) {
        arrayBuffer = cachedAudio
      } else {
        // Call the Google Cloud TTS API
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: word }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate speech')
        }

        const audioBlob = await response.blob()
        arrayBuffer = await audioBlob.arrayBuffer()

        // Cache the audio for future use
        audioCache.set(word, arrayBuffer)
      }

      // Use HTML5 Audio for better mobile compatibility
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)

      // Set volume to maximum for iOS
      audio.volume = 1.0

      // Load the audio first (important for iOS)
      audio.load()

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = (e) => {
        console.error('Audio error:', e)
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
        throw new Error('Audio playback failed')
      }

      audio.onloadeddata = async () => {
        try {
          // Play audio after it's loaded - this works better on iOS
          await audio.play()
        } catch (playError) {
          console.error('Play error:', playError)
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
          throw playError
        }
      }
    } catch (error) {
      console.error('Error playing pronunciation:', error)
      setIsPlaying(false)

      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.rate = 0.9
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)
        window.speechSynthesis.speak(utterance)
      }
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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setShowDetails(false)
      setIsPlaying(false)
      window.speechSynthesis?.cancel()
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleMarkMastered = () => {
    setMasteredWords(new Set(masteredWords).add(currentIndex))
    if (currentIndex < words.length - 1) {
      handleNext()
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowDetails(false)
    setMasteredWords(new Set())
  }

  const progress = words.length > 0 ? Math.round((masteredWords.size / words.length) * 100) : 0
  const currentWord = words[currentIndex]

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              {/* Word List Header with Close Button */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-7/10 text-chart-7">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {wordListName}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        {words.length} {words.length === 1 ? 'word' : 'words'}
                      </p>
                    </div>
                  </div>
                  <Link href={backLink}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-muted"
                      title="Close and return to word list"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-7 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mb-6">
                <VocabularyFlashcard
                  word={currentWord}
                  isFlipped={isFlipped}
                  isMastered={masteredWords.has(currentIndex)}
                  isPlaying={isPlaying}
                  showDetails={showDetails}
                  onFlip={handleFlip}
                  onPronounce={pronounceWord}
                  onToggleDetails={() => setShowDetails(!showDetails)}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              </div>

              {/* Pagination Dots */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {words.slice(0, Math.min(words.length, 10)).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsFlipped(false)
                      setCurrentIndex(index)
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-chart-7'
                        : 'w-2 bg-muted hover:bg-muted-foreground/30'
                    }`}
                    aria-label={`Go to word ${index + 1}`}
                  />
                ))}
                {words.length > 10 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{words.length - 10}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {isFlipped && !masteredWords.has(currentIndex) && (
                  <Button
                    onClick={handleMarkMastered}
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-medium"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Mark as Mastered
                  </Button>
                )}

                <div className="flex items-center gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    size="lg"
                    className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    <span className="hidden xs:inline">Previous</span>
                    <span className="xs:hidden">Prev</span>
                  </Button>

                  <div className="text-sm font-semibold text-foreground whitespace-nowrap px-3 py-2 rounded-md bg-muted">
                    {currentIndex + 1} / {words.length}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentIndex === words.length - 1}
                    size="lg"
                    className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="hidden xs:inline">Next</span>
                    <span className="xs:hidden">Next</span>
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href={backLink}>
                  <Button variant="default" size="lg" className="bg-chart-5 hover:bg-chart-5/90">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    {fromPage === 'word-lists' ? 'Back to Word List' : 'View Full Word List'}
                  </Button>
                </Link>
              </div>

              <Card className="mt-8 border-chart-7 bg-chart-7/5">
                <CardHeader>
                  <CardTitle>Flashcard Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>• Try to recall the definition and pronunciation before flipping</p>
                  <p>• Pay attention to the etymology to understand word roots</p>
                  <p>• Mark words as mastered only when you can define them confidently</p>
                  <p>• Review the examples to understand how words are used in context</p>
                  <p>• Notice patterns in synonyms to build your vocabulary network</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
