"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LetterDifficultyStats {
  total: number
  unreviewed: number
  easy: number
  medium: number
  hard: number
  veryHard: number
}

interface VocabularyAlphabetNavProps {
  selectedLetter: string | null
  onLetterClick: (letter: string) => void
  letterCounts: Record<string, number>
  letterDifficultyStats?: Record<string, LetterDifficultyStats>
  className?: string
}

export function VocabularyAlphabetNav({
  selectedLetter,
  onLetterClick,
  letterCounts,
  letterDifficultyStats,
  className,
}: VocabularyAlphabetNavProps) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <Card className={cn("p-3 sm:p-4", className)}>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
        {alphabet.map((letter) => {
          const count = letterCounts[letter] || 0
          const stats = letterDifficultyStats?.[letter]
          const isSelected = selectedLetter === letter
          const hasWords = count > 0

          return (
            <div key={letter} className="flex flex-col items-center gap-1">
              <Button
                variant={isSelected ? "default" : hasWords ? "outline" : "ghost"}
                size="sm"
                onClick={() => hasWords && onLetterClick(letter)}
                disabled={!hasWords}
                className={cn(
                  "min-w-[36px] min-h-[36px] w-9 h-9 sm:w-10 sm:h-10 p-0 font-bold relative text-sm sm:text-base",
                  !hasWords && "opacity-30 cursor-not-allowed",
                  isSelected && "ring-2 ring-primary ring-offset-2"
                )}
                title={stats ? `${letter}: ${stats.unreviewed} unreviewed, ${stats.easy} easy, ${stats.medium} medium, ${stats.hard} hard, ${stats.veryHard} very hard` : undefined}
              >
                {letter}
                {hasWords && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-primary text-primary-foreground text-[9px] sm:text-[10px] rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Button>

              {/* Difficulty indicator dots */}
              {hasWords && stats && stats.total > 0 && (
                <div className="flex gap-0.5 h-1">
                  {stats.unreviewed > 0 && (
                    <div
                      className="bg-gray-400 rounded-full"
                      style={{ width: `${Math.max(2, (stats.unreviewed / stats.total) * 24)}px` }}
                      title={`${stats.unreviewed} unreviewed`}
                    />
                  )}
                  {stats.easy > 0 && (
                    <div
                      className="bg-green-500 rounded-full"
                      style={{ width: `${Math.max(2, (stats.easy / stats.total) * 24)}px` }}
                      title={`${stats.easy} easy`}
                    />
                  )}
                  {stats.medium > 0 && (
                    <div
                      className="bg-yellow-500 rounded-full"
                      style={{ width: `${Math.max(2, (stats.medium / stats.total) * 24)}px` }}
                      title={`${stats.medium} medium`}
                    />
                  )}
                  {stats.hard > 0 && (
                    <div
                      className="bg-orange-500 rounded-full"
                      style={{ width: `${Math.max(2, (stats.hard / stats.total) * 24)}px` }}
                      title={`${stats.hard} hard`}
                    />
                  )}
                  {stats.veryHard > 0 && (
                    <div
                      className="bg-red-500 rounded-full"
                      style={{ width: `${Math.max(2, (stats.veryHard / stats.total) * 24)}px` }}
                      title={`${stats.veryHard} very hard`}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedLetter && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLetterClick('')}
            className="text-xs"
          >
            Show All Words
          </Button>
        </div>
      )}
    </Card>
  )
}
