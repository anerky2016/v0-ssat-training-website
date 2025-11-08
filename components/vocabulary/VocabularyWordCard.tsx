"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, Info, ChevronUp, ChevronDown, AudioWaveform, History, Lightbulb, Box, Zap, Sparkles as SparklesIcon, TrendingUp, FileText } from "lucide-react"
import { CompleteStudyButton } from "@/components/complete-study-button"
import Link from "next/link"
import { audioCache } from "@/lib/audio-cache"
import {
  getWordDifficulty,
  increaseDifficulty,
  decreaseDifficulty,
  getDifficultyLabel,
  getDifficultyColor,
  hasWordBeenReviewed,
  setWordDifficulty,
  isUserLoggedIn,
  type DifficultyLevel
} from "@/lib/vocabulary-difficulty"
import { DifficultyHistoryTimeline } from "./DifficultyHistoryTimeline"
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
  tip?: string
}

interface VocabularyWordCardProps {
  word: VocabularyWord
  showTooltip?: boolean
  showAudio?: boolean
  index?: number
}

// Helper function to get icon and color for part of speech
function getPartOfSpeechIcon(partOfSpeech: string) {
  const lowerCase = partOfSpeech.toLowerCase()

  if (lowerCase.includes('noun')) {
    return { Icon: Box, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/20' }
  } else if (lowerCase.includes('verb')) {
    return { Icon: Zap, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-950/20' }
  } else if (lowerCase.includes('adjective')) {
    return { Icon: SparklesIcon, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20' }
  } else if (lowerCase.includes('adverb')) {
    return { Icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-950/20' }
  } else {
    return { Icon: FileText, color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-950/20' }
  }
}

export function VocabularyWordCard({
  word,
  showTooltip = true,
  showAudio = true,
  index
}: VocabularyWordCardProps) {
  const { user, loading: authLoading } = useAuth()
  const [activeTooltip, setActiveTooltip] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null) // Track which text is currently playing
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1)
  const [isReviewed, setIsReviewed] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0)
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false)
  const isMobile = useMobile()

  // Check if user is logged in (for enabling difficulty controls)
  const isLoggedIn = !!user

  // Load difficulty from Supabase for current word
  // Wait for auth to be ready to ensure user session is restored
  useEffect(() => {
    const loadDifficulty = async () => {
      // Wait for auth to finish loading
      if (authLoading) return

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
  }, [word.word, authLoading])

  const handleIncreaseDifficulty = async () => {
    const newDifficulty = await increaseDifficulty(word.word)
    setDifficulty(newDifficulty)
    setIsReviewed(true) // Mark as reviewed once user interacts
    setHistoryRefreshTrigger(prev => prev + 1) // Trigger history refresh
  }

  const handleDecreaseDifficulty = async () => {
    const newDifficulty = await decreaseDifficulty(word.word)
    setDifficulty(newDifficulty)
    setIsReviewed(true) // Mark as reviewed once user interacts
    setHistoryRefreshTrigger(prev => prev + 1) // Trigger history refresh
  }

  const handleDifficultyChange = async (value: number[]) => {
    const newDifficulty = value[0] as DifficultyLevel
    await setWordDifficulty(word.word, newDifficulty)
    setDifficulty(newDifficulty)
    setIsReviewed(true)
    setHistoryRefreshTrigger(prev => prev + 1)
  }

  const handleSpinnerWheelChange = async (value: number) => {
    await setWordDifficulty(word.word, value as DifficultyLevel)
    setDifficulty(value as DifficultyLevel)
    setIsReviewed(true)
    setHistoryRefreshTrigger(prev => prev + 1)
    // Close the picker after selection
    setShowDifficultyPicker(false)
  }

  // Helper to call SpeechSynthesis synchronously (for iOS)
  // Must be called within user gesture handler to work on iOS
  const speakWithSpeechSynthesis = (text: string): boolean => {
    try {
      if ('speechSynthesis' in window) {
        console.log('🍎 iOS: Attempting SpeechSynthesis for:', text)
        console.log('🍎 iOS: speechSynthesis available:', !!window.speechSynthesis)
        console.log('🍎 iOS: speechSynthesis.pending:', window.speechSynthesis.pending)
        console.log('🍎 iOS: speechSynthesis.speaking:', window.speechSynthesis.speaking)
        
        setCurrentlyPlaying(text) // Set state first
        window.speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.volume = 1.0
        utterance.lang = 'en-US'
        
        utterance.onstart = () => {
          console.log('✅ SpeechSynthesis STARTED for:', text)
        }
        
        utterance.onend = () => {
          console.log('✅ SpeechSynthesis completed for:', text)
          setCurrentlyPlaying(null)
        }
        
        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
          console.error('❌ SpeechSynthesis error:', {
            error: e.error,
            type: e.type,
            charIndex: e.charIndex,
            charLength: e.charLength,
            utterance: e.utterance?.text
          })
          setCurrentlyPlaying(null)
        }
        
        window.speechSynthesis.speak(utterance)
        console.log('🗣️ SpeechSynthesis speak() called for:', text)
        console.log('🍎 iOS: After speak(), pending:', window.speechSynthesis.pending, 'speaking:', window.speechSynthesis.speaking)
        return true
      } else {
        console.warn('⚠️ SpeechSynthesis API not available')
      }
    } catch (error) {
      console.error('❌ SpeechSynthesis setup error:', error)
      setCurrentlyPlaying(null)
    }
    return false
  }

  const pronounceWord = async (wordText: string) => {
    // Detect iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    setCurrentlyPlaying(wordText)

    // Check if audio is cached FIRST - if so, we can play it immediately (iOS friendly)
    const cachedAudio = audioCache.get(wordText)
    
    if (cachedAudio) {
      // For cached audio, create and play synchronously (works on iOS)
      try {
        const blob = new Blob([cachedAudio], { type: 'audio/mpeg' })
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        
        // iOS-specific fixes
        audio.volume = 1.0
        audio.preload = 'auto'
        audio.setAttribute('playsinline', 'true')
        audio.setAttribute('webkit-playsinline', 'true')
        
        const cleanup = () => {
          setCurrentlyPlaying(null)
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.onended = cleanup
        audio.onerror = (e) => {
          console.error('Audio error:', e)
          cleanup()
        }
        
        // Try to play immediately - should work for cached audio on iOS
        audio.load()
        await audio.play().catch(async (playError) => {
          // If immediate play fails, wait for loadeddata
          await new Promise<void>((resolve) => {
            const handleLoadedData = () => {
              audio.removeEventListener('loadeddata', handleLoadedData)
              audio.play().then(resolve).catch(() => {
                // If still fails, try SpeechSynthesis as fallback
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel()
                  const utterance = new SpeechSynthesisUtterance(wordText)
                  utterance.rate = 0.9
                  utterance.onend = () => setCurrentlyPlaying(null)
                  utterance.onerror = () => setCurrentlyPlaying(null)
                  window.speechSynthesis.speak(utterance)
                }
                resolve()
              })
            }
            audio.addEventListener('loadeddata', handleLoadedData)
          })
        })
        
        return
      } catch (error) {
        console.error('Error playing cached audio:', error)
        // Fall through to try other methods
      }
    }

    // On iOS with uncached audio, use SpeechSynthesis as it's more reliable
    // HTML5 Audio has strict user gesture requirements that break after async fetch
    if (isIOS && 'speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech first
        window.speechSynthesis.cancel()
        
        // Create utterance synchronously (before any async operations)
        const utterance = new SpeechSynthesisUtterance(wordText)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 1.0
        utterance.lang = 'en-US'
        
        // Set up event handlers BEFORE speaking
        utterance.onstart = () => {
          console.log('✅ SpeechSynthesis started on iOS for:', wordText)
        }
        
        utterance.onend = () => {
          console.log('✅ SpeechSynthesis completed')
          setCurrentlyPlaying(null)
        }
        
        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
          console.error('❌ SpeechSynthesis error:', e.error, e)
          setCurrentlyPlaying(null)
          
          // If SpeechSynthesis fails, try fetching and playing audio
          // We're already in an async context, so we can do this
          fetchAndPlayAudio(wordText)
        }
        
        // Call speak() immediately - iOS requires it to be in the gesture handler
        // No setTimeout needed - iOS Safari will queue it if needed
        try {
          window.speechSynthesis.speak(utterance)
          console.log('🗣️ SpeechSynthesis speak() called for:', wordText)
        } catch (speakError) {
          console.error('❌ Error calling speak():', speakError)
          setCurrentlyPlaying(null)
          // Try fetching and playing audio as fallback
          fetchAndPlayAudio(wordText)
        }
        
        return
      } catch (error) {
        console.error('❌ Error setting up SpeechSynthesis:', error)
        setCurrentlyPlaying(null)
        // Fall through to try HTML5 Audio as fallback
      }
    }
    
    // Helper function to fetch and play audio when SpeechSynthesis fails
    const fetchAndPlayAudio = async (text: string) => {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })
        
        if (!response.ok) throw new Error('TTS API failed')
        
        const audioBlob = await response.blob()
        const arrayBuffer = await audioBlob.arrayBuffer()
        audioCache.set(text, arrayBuffer)
        
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        
        audio.volume = 1.0
        audio.setAttribute('playsinline', 'true')
        audio.setAttribute('webkit-playsinline', 'true')
        
        audio.onended = () => {
          setCurrentlyPlaying(null)
          URL.revokeObjectURL(audioUrl)
        }
        audio.onerror = () => {
          setCurrentlyPlaying(null)
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.load()
        await audio.play()
      } catch (error) {
        console.error('❌ Error with audio fallback:', error)
        setCurrentlyPlaying(null)
      }
    }
    
    // If we reach here and it's iOS but SpeechSynthesis failed, try audio
    if (isIOS) {
      await fetchAndPlayAudio(wordText)
      return
    }

    // For non-iOS or if SpeechSynthesis fails, use HTML5 Audio
    try {
      setCurrentlyPlaying(wordText)

      let arrayBuffer: ArrayBuffer

      // Check if audio is cached
      const cachedAudio = audioCache.get(wordText)

      if (cachedAudio) {
        arrayBuffer = cachedAudio
      } else {
        // Call the Google Cloud TTS API
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: wordText }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate speech')
        }

        const audioBlob = await response.blob()
        arrayBuffer = await audioBlob.arrayBuffer()

        // Cache the audio for future use
        audioCache.set(wordText, arrayBuffer)
      }

      // Use HTML5 Audio for better mobile compatibility
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)

      // iOS-specific fixes
      audio.volume = 1.0
      audio.preload = 'auto'
      // Set playsInline for iOS - required for inline playback without fullscreen
      audio.setAttribute('playsinline', 'true')
      audio.setAttribute('webkit-playsinline', 'true')

      // Cleanup handlers
      const cleanup = () => {
        setCurrentlyPlaying(null)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onended = cleanup
      audio.onerror = (e) => {
        console.error('Audio error:', e)
        cleanup()
        // Fallback to SpeechSynthesis if available
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(wordText)
          utterance.rate = 0.9
          utterance.onend = () => setCurrentlyPlaying(null)
          utterance.onerror = () => setCurrentlyPlaying(null)
          window.speechSynthesis.speak(utterance)
        } else {
          throw new Error('Audio playback failed')
        }
      }

      // Load audio first
      audio.load()

      // Try to play immediately (iOS requires user gesture to be within the call stack)
      // For cached audio, this should work. For uncached, we'll wait for loadeddata
      const playAudio = async () => {
        try {
          await audio.play()
        } catch (playError: any) {
          // If play fails, try SpeechSynthesis as fallback
          if ('speechSynthesis' in window) {
            console.log('Audio.play() failed, falling back to SpeechSynthesis')
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(wordText)
            utterance.rate = 0.9
            utterance.onend = () => setCurrentlyPlaying(null)
            utterance.onerror = () => setCurrentlyPlaying(null)
            window.speechSynthesis.speak(utterance)
            URL.revokeObjectURL(audioUrl)
            return
          }
          
          // If play fails (e.g., audio not loaded yet), wait for loadeddata
          if (playError.name !== 'AbortError') {
            await new Promise<void>((resolve) => {
              let timeoutId: NodeJS.Timeout
              const handleLoadedData = async () => {
                clearTimeout(timeoutId)
                try {
                  await audio.play()
                  resolve()
                } catch (retryError: any) {
                  // Final fallback to SpeechSynthesis
                  if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel()
                    const utterance = new SpeechSynthesisUtterance(wordText)
                    utterance.rate = 0.9
                    utterance.onend = () => setCurrentlyPlaying(null)
                    utterance.onerror = () => setCurrentlyPlaying(null)
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
                  const utterance = new SpeechSynthesisUtterance(wordText)
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
      console.error('Error playing pronunciation:', error)
      setCurrentlyPlaying(null)

      // Final fallback to browser TTS
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(wordText)
        utterance.rate = 0.9
        utterance.onend = () => setCurrentlyPlaying(null)
        utterance.onerror = () => setCurrentlyPlaying(null)
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  // Highlight the target word in example sentences
  const highlightWord = (text: string, targetWord: string) => {
    const regex = new RegExp(`\\b(${targetWord})\\b`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (part.toLowerCase() === targetWord.toLowerCase()) {
        return (
          <span key={index} className="font-bold italic">
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <Card className="border-l-4 border-l-chart-5 bg-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="relative">
                <Link href={`/vocabulary/word-lists/${word.word.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardTitle
                    className={`text-2xl font-bold text-foreground hover:text-chart-5 transition-colors cursor-pointer ${
                      showTooltip ? 'border-b-2 border-dashed border-transparent hover:border-chart-5' : ''
                    }`}
                    onClick={(e) => {
                      if (showTooltip) {
                        e.preventDefault()
                        setActiveTooltip(!activeTooltip)
                      }
                    }}
                  >
                    {index !== undefined && (
                      <span className="text-muted-foreground font-normal mr-2">#{index}.</span>
                    )}
                    {word.word}
                  </CardTitle>
                </Link>
                {showTooltip && activeTooltip && (
                  <div className="absolute z-10 mt-2 p-3 bg-chart-5 text-white rounded-lg shadow-xl max-w-xs text-sm leading-relaxed">
                    <div className="font-semibold mb-1">{word.meanings[0]}</div>
                    <div className="text-xs opacity-90 italic flex items-center gap-1.5">
                      {(() => {
                        const { Icon, color } = getPartOfSpeechIcon(word.part_of_speech)
                        return <Icon className="h-3.5 w-3.5 text-white" />
                      })()}
                      {word.part_of_speech}
                    </div>
                    <div className="absolute -top-2 left-4 w-4 h-4 bg-chart-5 transform rotate-45"></div>
                  </div>
                )}
              </div>
              {showAudio && (
                <Button
                  onClick={async (e) => {
                    e.stopPropagation()
                    
                    // Check if audio is cached first
                    const cachedAudio = audioCache.get(word.word)
                    
                    // On iOS with uncached audio, try SpeechSynthesis synchronously in click handler
                    // This ensures it's called within the user gesture context
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
                    
                    if (isIOS && !cachedAudio) {
                      // Try SpeechSynthesis synchronously in click handler (iOS requirement)
                      if (speakWithSpeechSynthesis(word.word)) {
                        return // Success - SpeechSynthesis called
                      }
                      // If SpeechSynthesis fails, fall through to pronounceWord
                    }
                    
                    // For cached audio or non-iOS, use normal async flow
                    await pronounceWord(word.word)
                  }}
                  className={`h-12 w-12 p-0 rounded-full transition-all duration-200 shadow-lg active:scale-95 ${
                    currentlyPlaying === word.word
                      ? 'bg-chart-5 hover:bg-chart-5/90 animate-pulse scale-110'
                      : 'bg-chart-5 hover:bg-chart-5/90 hover:scale-110'
                  }`}
                  title="Click to hear pronunciation"
                >
                  {currentlyPlaying === word.word ? (
                    <AudioWaveform className="h-6 w-6 text-white animate-pulse" />
                  ) : (
                    <Volume2 className="h-6 w-6 text-white" />
                  )}
                </Button>
              )}
              <span className="text-base text-muted-foreground font-normal">
                {word.pronunciation}
              </span>
            </div>
            <CardDescription className="text-sm italic">
              <div className="flex items-center gap-2">
                {(() => {
                  const { Icon, color, bgColor } = getPartOfSpeechIcon(word.part_of_speech)
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bgColor} ${color} font-medium text-xs`}>
                      <Icon className="h-3.5 w-3.5" />
                      {word.part_of_speech}
                    </span>
                  )
                })()}
              </div>
            </CardDescription>
          </div>
          <div className="flex-shrink-0 flex flex-col gap-2 w-full sm:w-auto">
            <CompleteStudyButton
              topicTitle={word.word}
              customPath={`/vocabulary/word-lists/${word.word.toLowerCase().replace(/\s+/g, '-')}`}
              category="vocabulary"
            />

            {/* Desktop: Circular Difficulty Buttons */}
            <div className="hidden md:flex flex-col gap-2 w-full">
              <div className="flex items-center justify-center gap-1.5">
                {/* Wait for decision (Not Reviewed) */}
                <button
                  onClick={async () => {
                    setDifficulty(1)
                    setIsReviewed(false)
                    // Clear from Supabase to mark as not reviewed
                    if (isLoggedIn) {
                      await setWordDifficulty(word.word, 1)
                      setHistoryRefreshTrigger(prev => prev + 1)
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
                  onClick={async () => {
                    await setWordDifficulty(word.word, 0)
                    setDifficulty(0)
                    setIsReviewed(true)
                    setHistoryRefreshTrigger(prev => prev + 1)
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
                  onClick={async () => {
                    await setWordDifficulty(word.word, 1)
                    setDifficulty(1)
                    setIsReviewed(true)
                    setHistoryRefreshTrigger(prev => prev + 1)
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
                  onClick={async () => {
                    await setWordDifficulty(word.word, 2)
                    setDifficulty(2)
                    setIsReviewed(true)
                    setHistoryRefreshTrigger(prev => prev + 1)
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
                  onClick={async () => {
                    await setWordDifficulty(word.word, 3)
                    setDifficulty(3)
                    setIsReviewed(true)
                    setHistoryRefreshTrigger(prev => prev + 1)
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
            </div>

            {/* Mobile: Difficulty Picker Button */}
            {isMobile && (
              <div className="flex flex-col items-center gap-2 w-full max-w-[200px]">
                <Button
                  onClick={() => setShowDifficultyPicker(true)}
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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
                  onClick={async (e) => {
                    e.stopPropagation()
                    // On iOS with uncached audio, try SpeechSynthesis synchronously
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
                    const cachedAudio = audioCache.get(meaning)
                    
                    if (isIOS && !cachedAudio && speakWithSpeechSynthesis(meaning)) {
                      return // SpeechSynthesis succeeded
                    }
                    
                    // Otherwise use normal flow
                    await pronounceWord(meaning)
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
              {word.examples.map((example, idx) => (
                <p key={idx} className="text-sm text-muted-foreground italic pl-4 border-l-2 border-chart-5 leading-relaxed">
                  "{highlightWord(example, word.word)}"
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Memory Tip */}
        {word.tip && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1 uppercase tracking-wide">
                  Memory Tip
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  {word.tip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Synonyms and Antonyms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {word.synonyms && word.synonyms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                Synonyms
              </h3>
              <div className="flex flex-wrap gap-2">
                {word.synonyms.map((syn, idx) => (
                  <button
                    key={idx}
                    onClick={async () => {
                      // On iOS with uncached audio, try SpeechSynthesis synchronously
                      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
                      const cachedAudio = audioCache.get(syn)
                      
                      if (isIOS && !cachedAudio && speakWithSpeechSynthesis(syn)) {
                        return // SpeechSynthesis succeeded
                      }
                      
                      // Otherwise use normal flow
                      await pronounceWord(syn)
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

          {word.antonyms && word.antonyms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                Antonyms
              </h3>
              <div className="flex flex-wrap gap-2">
                {word.antonyms.map((ant, idx) => (
                  <button
                    key={idx}
                    onClick={async () => {
                      // On iOS with uncached audio, try SpeechSynthesis synchronously
                      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
                      const cachedAudio = audioCache.get(ant)
                      
                      if (isIOS && !cachedAudio && speakWithSpeechSynthesis(ant)) {
                        return // SpeechSynthesis succeeded
                      }
                      
                      // Otherwise use normal flow
                      await pronounceWord(ant)
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
        </div>

        {/* Further Information */}
        {word.further_information && word.further_information.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-chart-5" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Additional Notes
              </h3>
            </div>
            <ul className="space-y-2">
              {word.further_information.map((info, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-5 flex-shrink-0" />
                  <span className="leading-relaxed">{info}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Difficulty History */}
        <div className="pt-4 border-t border-border">
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-between hover:bg-muted/50 mb-2"
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-chart-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Difficulty History
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </Button>

          {showHistory && (
            <div className="mt-3">
              <DifficultyHistoryTimeline word={word.word} refreshTrigger={historyRefreshTrigger} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
