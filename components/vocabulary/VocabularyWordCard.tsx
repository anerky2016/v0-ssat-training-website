"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, Info, ChevronUp, ChevronDown, AudioWaveform, History } from "lucide-react"
import { CompleteStudyButton } from "@/components/complete-study-button"
import Link from "next/link"
import { audioCache } from "@/lib/audio-cache"
import {
  getWordDifficulty,
  increaseDifficulty,
  decreaseDifficulty,
  getDifficultyLabel,
  getDifficultyColor,
  initializeDifficulties,
  type DifficultyLevel
} from "@/lib/vocabulary-difficulty"
import { DifficultyHistoryTimeline } from "./DifficultyHistoryTimeline"
import { useAuth } from "@/contexts/firebase-auth-context"

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

interface VocabularyWordCardProps {
  word: VocabularyWord
  showTooltip?: boolean
  showAudio?: boolean
}

export function VocabularyWordCard({
  word,
  showTooltip = true,
  showAudio = true
}: VocabularyWordCardProps) {
  const { loading: authLoading } = useAuth()
  const [activeTooltip, setActiveTooltip] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null) // Track which text is currently playing
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1)
  const [showHistory, setShowHistory] = useState(false)
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0)

  // Initialize difficulties from Supabase and load current word difficulty
  // Wait for auth to be ready to ensure user session is restored
  useEffect(() => {
    const loadDifficulty = async () => {
      // Wait for auth to finish loading before initializing
      if (authLoading) return

      await initializeDifficulties()
      const currentDifficulty = getWordDifficulty(word.word)
      setDifficulty(currentDifficulty)
    }

    loadDifficulty()
  }, [word.word, authLoading])

  const handleIncreaseDifficulty = async () => {
    const newDifficulty = await increaseDifficulty(word.word)
    setDifficulty(newDifficulty)
    setHistoryRefreshTrigger(prev => prev + 1) // Trigger history refresh
  }

  const handleDecreaseDifficulty = async () => {
    const newDifficulty = await decreaseDifficulty(word.word)
    setDifficulty(newDifficulty)
    setHistoryRefreshTrigger(prev => prev + 1) // Trigger history refresh
  }

  const pronounceWord = async (wordText: string) => {
    // Detect iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    // On iOS, use SpeechSynthesis directly as it's more reliable
    // HTML5 Audio has strict user gesture requirements that break after async operations
    if (isIOS && 'speechSynthesis' in window) {
      try {
        setCurrentlyPlaying(wordText)
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(wordText)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        utterance.onend = () => {
          setCurrentlyPlaying(null)
        }
        
        utterance.onerror = (e) => {
          console.error('SpeechSynthesis error:', e)
          setCurrentlyPlaying(null)
        }
        
        window.speechSynthesis.speak(utterance)
        return
      } catch (error) {
        console.error('Error with SpeechSynthesis:', error)
        setCurrentlyPlaying(null)
        // Fall through to try HTML5 Audio as fallback
      }
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
                    {word.word}
                  </CardTitle>
                </Link>
                {showTooltip && activeTooltip && (
                  <div className="absolute z-10 mt-2 p-3 bg-chart-5 text-white rounded-lg shadow-xl max-w-xs text-sm leading-relaxed">
                    <div className="font-semibold mb-1">{word.meanings[0]}</div>
                    <div className="text-xs opacity-90 italic">{word.part_of_speech}</div>
                    <div className="absolute -top-2 left-4 w-4 h-4 bg-chart-5 transform rotate-45"></div>
                  </div>
                )}
              </div>
              {showAudio && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    pronounceWord(word.word)
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
              {word.part_of_speech}
            </CardDescription>
          </div>
          <div className="flex-shrink-0 flex flex-col gap-2 w-full sm:w-auto">
            <CompleteStudyButton
              topicTitle={word.word}
              customPath={`/vocabulary/word-lists/${word.word.toLowerCase().replace(/\s+/g, '-')}`}
              category="vocabulary"
            />
            {/* Difficulty Controls */}
            <div className="flex items-center gap-1.5 sm:gap-1">
              <Button
                onClick={handleDecreaseDifficulty}
                disabled={difficulty === 0}
                variant="outline"
                size="sm"
                className="h-9 w-12 sm:h-8 sm:w-10 p-0 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Decrease difficulty"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className={`px-3 sm:px-2 py-1 sm:py-0.5 rounded text-xs font-medium whitespace-nowrap flex-1 sm:flex-none text-center ${
                getDifficultyColor(difficulty)
              }`}>
                {getDifficultyLabel(difficulty)}
              </div>
              <Button
                onClick={handleIncreaseDifficulty}
                disabled={difficulty === 3}
                variant="outline"
                size="sm"
                className="h-9 w-12 sm:h-8 sm:w-10 p-0 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Increase difficulty"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
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
                  onClick={(e) => {
                    e.stopPropagation()
                    pronounceWord(meaning)
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
                    onClick={() => pronounceWord(syn)}
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
                    onClick={() => pronounceWord(ant)}
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
