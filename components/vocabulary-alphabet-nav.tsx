"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface VocabularyAlphabetNavProps {
  selectedLetter: string | null
  onLetterClick: (letter: string) => void
  letterCounts: Record<string, number>
  className?: string
}

export function VocabularyAlphabetNav({
  selectedLetter,
  onLetterClick,
  letterCounts,
  className,
}: VocabularyAlphabetNavProps) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <Card className={cn("p-3 sm:p-4", className)}>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
        {alphabet.map((letter) => {
          const count = letterCounts[letter] || 0
          const isSelected = selectedLetter === letter
          const hasWords = count > 0

          return (
            <Button
              key={letter}
              variant={isSelected ? "default" : hasWords ? "outline" : "ghost"}
              size="sm"
              onClick={() => hasWords && onLetterClick(letter)}
              disabled={!hasWords}
              className={cn(
                "min-w-[36px] min-h-[36px] w-9 h-9 sm:w-10 sm:h-10 p-0 font-bold relative text-sm sm:text-base",
                !hasWords && "opacity-30 cursor-not-allowed",
                isSelected && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {letter}
              {hasWords && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-primary text-primary-foreground text-[9px] sm:text-[10px] rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Button>
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
