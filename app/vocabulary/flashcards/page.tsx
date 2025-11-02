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
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-10)) // Keep last 10 logs
  }

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
    // Detect iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    // On iOS, use SpeechSynthesis directly as it's more reliable
    // HTML5 Audio has strict user gesture requirements that break after async operations
    if (isIOS && 'speechSynthesis' in window) {
      try {
        addDebugLog(`🍎 iOS detected, using SpeechSynthesis API`)
        setIsPlaying(true)
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        utterance.onend = () => {
          addDebugLog(`✅ SpeechSynthesis completed`)
          setIsPlaying(false)
        }
        
        utterance.onerror = (e) => {
          addDebugLog(`❌ SpeechSynthesis error: ${e}`)
          console.error('SpeechSynthesis error:', e)
          setIsPlaying(false)
        }
        
        window.speechSynthesis.speak(utterance)
        addDebugLog(`🗣️ SpeechSynthesis started`)
        return
      } catch (error) {
        addDebugLog(`❌ Error with SpeechSynthesis: ${error}`)
        console.error('Error with SpeechSynthesis:', error)
        setIsPlaying(false)
        // Fall through to try HTML5 Audio as fallback
      }
    }

    try {
      addDebugLog(`🔊 Pronunciation requested for: "${word}"`)
      setIsPlaying(true)

      let arrayBuffer: ArrayBuffer

      // Check if audio is cached
      const cachedAudio = audioCache.get(word)

      if (cachedAudio) {
        addDebugLog(`✅ Audio found in cache`)
        arrayBuffer = cachedAudio
      } else {
        addDebugLog(`📡 Fetching audio from TTS API...`)
        // Call the Google Cloud TTS API
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: word }),
        })

        if (!response.ok) {
          addDebugLog(`❌ TTS API failed: ${response.status}`)
          throw new Error('Failed to generate speech')
        }

        addDebugLog(`✅ Audio received from TTS API`)
        const audioBlob = await response.blob()
        arrayBuffer = await audioBlob.arrayBuffer()
        addDebugLog(`📦 Audio size: ${arrayBuffer.byteLength} bytes`)

        // Cache the audio for future use
        audioCache.set(word, arrayBuffer)
        addDebugLog(`💾 Audio cached`)
      }

      // Use HTML5 Audio for better mobile compatibility
      addDebugLog(`🎵 Creating audio element...`)
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)

      // iOS-specific fixes
      audio.volume = 1.0
      audio.preload = 'auto'
      // Set playsInline for iOS - required for inline playback without fullscreen
      audio.setAttribute('playsinline', 'true')
      audio.setAttribute('webkit-playsinline', 'true')
      addDebugLog(`🔊 Volume set to: ${audio.volume}`)

      // Cleanup handlers
      const cleanup = () => {
        addDebugLog(`✅ Audio cleanup`)
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onended = () => {
        addDebugLog(`✅ Audio playback completed`)
        cleanup()
      }

      audio.onerror = (e) => {
        addDebugLog(`❌ Audio error: ${e}`)
        console.error('Audio error:', e)
        cleanup()
        throw new Error('Audio playback failed')
      }

      // Load audio first
      audio.load()
      addDebugLog(`⏳ Loading audio...`)

      // Try to play immediately (iOS requires user gesture to be within the call stack)
      const playAudio = async () => {
        try {
          await audio.play()
          addDebugLog(`▶️ Playback started successfully`)
        } catch (playError: any) {
          // If play fails, try SpeechSynthesis as fallback
          if ('speechSynthesis' in window) {
            addDebugLog(`Audio.play() failed, falling back to SpeechSynthesis`)
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(word)
            utterance.rate = 0.9
            utterance.onend = () => setIsPlaying(false)
            utterance.onerror = () => setIsPlaying(false)
            window.speechSynthesis.speak(utterance)
            URL.revokeObjectURL(audioUrl)
            return
          }
          
          // If play fails (e.g., audio not loaded yet), wait for loadeddata
          if (playError.name !== 'AbortError') {
            addDebugLog(`⏳ Audio not ready, waiting for loadeddata...`)
            await new Promise<void>((resolve) => {
              let timeoutId: NodeJS.Timeout
              const handleLoadedData = async () => {
                clearTimeout(timeoutId)
                try {
                  await audio.play()
                  addDebugLog(`▶️ Playback started after load`)
                  resolve()
                } catch (retryError: any) {
                  // Final fallback to SpeechSynthesis
                  if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel()
                    const utterance = new SpeechSynthesisUtterance(word)
                    utterance.rate = 0.9
                    utterance.onend = () => setIsPlaying(false)
                    utterance.onerror = () => setIsPlaying(false)
                    window.speechSynthesis.speak(utterance)
                    URL.revokeObjectURL(audioUrl)
                  }
                  resolve()
                } finally {
                  audio.removeEventListener('loadeddata', handleLoadedData)
                }
              }
              audio.addEventListener('loadeddata', handleLoadedData)
              // Fallback timeout
              timeoutId = setTimeout(() => {
                audio.removeEventListener('loadeddata', handleLoadedData)
                // Try SpeechSynthesis before giving up
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel()
                  const utterance = new SpeechSynthesisUtterance(word)
                  utterance.rate = 0.9
                  utterance.onend = () => setIsPlaying(false)
                  utterance.onerror = () => setIsPlaying(false)
                  window.speechSynthesis.speak(utterance)
                  URL.revokeObjectURL(audioUrl)
                }
                resolve()
              }, 5000)
            })
          } else {
            throw playError
          }
        }
      }

      // Start playback attempt immediately while still in user gesture context
      await playAudio()
    } catch (error) {
      addDebugLog(`❌ Error: ${error}`)
      console.error('Error playing pronunciation:', error)
      setIsPlaying(false)

      // Fallback to browser TTS
      addDebugLog(`🔄 Falling back to browser TTS...`)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.rate = 0.9
        utterance.onend = () => {
          addDebugLog(`✅ Browser TTS completed`)
          setIsPlaying(false)
        }
        utterance.onerror = () => {
          addDebugLog(`❌ Browser TTS error`)
          setIsPlaying(false)
        }
        window.speechSynthesis.speak(utterance)
        addDebugLog(`🗣️ Browser TTS started`)
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

              {/* Debug Console */}
              {debugLogs.length > 0 && (
                <Card className="mt-8 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-orange-700 dark:text-orange-400">Audio Debug Console</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDebugLogs([])}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/80 text-green-400 p-4 rounded font-mono text-xs sm:text-sm max-h-64 overflow-y-auto">
                      {debugLogs.map((log, idx) => (
                        <div key={idx} className="mb-1">
                          {log}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
