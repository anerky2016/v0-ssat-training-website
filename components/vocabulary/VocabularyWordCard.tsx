"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, Info } from "lucide-react"
import { CompleteStudyButton } from "@/components/complete-study-button"
import Link from "next/link"

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

  const pronounceWord = (wordText: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      setIsPlaying(true)
      const utterance = new SpeechSynthesisUtterance(wordText)

      // Get available voices
      const voices = window.speechSynthesis.getVoices()

      // Prefer natural, premium, or high-quality voices
      const preferredVoice = voices.find(voice =>
        voice.lang.startsWith('en') && (
          voice.name.includes('Natural') ||
          voice.name.includes('Premium') ||
          voice.name.includes('Google') ||
          voice.name.includes('Microsoft') && voice.name.includes('Online')
        )
      ) || voices.find(voice => voice.lang.startsWith('en-US')) // Fallback to any US English voice

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.rate = 0.85 // Slightly slower for clarity
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onend = () => {
        setIsPlaying(false)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      alert('Sorry, your browser does not support text-to-speech.')
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
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
                  className={`h-12 w-12 p-0 rounded-full transition-all shadow-lg ${
                    isPlaying
                      ? 'bg-chart-5 hover:bg-chart-5/90 animate-pulse'
                      : 'bg-chart-5 hover:bg-chart-5/90 hover:scale-110'
                  }`}
                  title="Click to hear pronunciation"
                >
                  <Volume2 className="h-6 w-6 text-white" />
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
          <div className="flex-shrink-0">
            <CompleteStudyButton
              topicTitle={word.word}
              customPath={`/vocabulary/word-lists/${word.word.toLowerCase().replace(/\s+/g, '-')}`}
              category="vocabulary"
            />
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
                  className="flex-shrink-0 p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Click to hear definition"
                >
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
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
                    className="group px-2 py-1 text-xs rounded-md bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 transition-colors flex items-center gap-1.5"
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
                    className="group px-2 py-1 text-xs rounded-md bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
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
