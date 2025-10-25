"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Info, Volume2 } from "lucide-react"

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
  isPlaying: boolean
  showDetails: boolean
  onFlip: () => void
  onPronounce: (word: string) => void
  onToggleDetails: () => void
}

export function VocabularyFlashcard({
  word,
  isFlipped,
  isMastered,
  isPlaying,
  showDetails,
  onFlip,
  onPronounce,
  onToggleDetails,
}: VocabularyFlashcardProps) {
  return (
    <div
      className="relative w-full min-h-[450px] cursor-pointer"
      onClick={onFlip}
      style={{ perspective: "1000px" }}
    >
      <div
        className="absolute w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <Card
          className="absolute w-full min-h-[450px] border-2 border-chart-7 bg-card flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <CardContent className="text-center p-8 w-full">
            <div className="text-5xl font-bold text-foreground mb-3">
              {word.word}
            </div>
            <div className="flex flex-col items-center justify-center gap-3 mb-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onPronounce(word.word)
                }}
                className={`h-14 w-14 p-0 rounded-full transition-all shadow-lg ${
                  isPlaying
                    ? 'bg-chart-1 hover:bg-chart-1/90 animate-pulse'
                    : 'bg-chart-1 hover:bg-chart-1/90 hover:scale-110'
                }`}
                title="Click to hear pronunciation"
              >
                <Volume2 className="h-7 w-7 text-white" />
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
            <div className="mt-12 text-sm text-muted-foreground">
              Click to reveal definition
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className="absolute w-full min-h-[450px] border-2 border-chart-7 bg-card overflow-y-auto"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-4">
              {/* Meanings */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                  Definition{word.meanings.length > 1 ? 's' : ''}
                </h3>
                <ol className="list-decimal list-inside space-y-1">
                  {word.meanings.map((meaning, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground leading-relaxed">
                      {meaning}
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
            <div className="mt-6 text-sm text-muted-foreground text-center">
              Click to flip back
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
