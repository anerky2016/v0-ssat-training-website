"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, Info, ChevronUp, ChevronDown } from "lucide-react"
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
  const [activeTooltip, setActiveTooltip] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1)

  // Initialize difficulties from Supabase and load current word difficulty
  useEffect(() => {
    const loadDifficulty = async () => {
      await initializeDifficulties()
      const currentDifficulty = getWordDifficulty(word.word)
      setDifficulty(currentDifficulty)
    }

    loadDifficulty()
  }, [word.word])

  const handleIncreaseDifficulty = async () => {
    const newDifficulty = await increaseDifficulty(word.word)
    setDifficulty(newDifficulty)
  }

  const handleDecreaseDifficulty = async () => {
    const newDifficulty = await decreaseDifficulty(word.word)
    setDifficulty(newDifficulty)
  }

  const pronounceWord = async (wordText: string) => {
    try {
      setIsPlaying(true)

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

      // Play audio using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createBufferSource()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))

      source.buffer = audioBuffer
      source.connect(audioContext.destination)

      source.onended = () => {
        setIsPlaying(false)
        audioContext.close()
      }

      source.start(0)
    } catch (error) {
      console.error('Error playing pronunciation:', error)
      setIsPlaying(false)

      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(wordText)
        utterance.rate = 0.9
        utterance.onend = () => setIsPlaying(false)
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
                    isPlaying
                      ? 'bg-chart-5 hover:bg-chart-5/90 animate-pulse scale-110'
                      : 'bg-chart-5 hover:bg-chart-5/90 hover:scale-110'
                  }`}
                  title="Click to hear pronunciation"
                >
                  <Volume2 className={`h-6 w-6 text-white transition-transform ${isPlaying ? 'animate-bounce' : ''}`} />
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
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-transform" />
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
                    <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
      </CardContent>
    </Card>
  )
}
