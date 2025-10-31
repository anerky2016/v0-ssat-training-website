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
    <Card className={cn("p-4", className)}>
      <div className="flex flex-wrap gap-2 justify-center">
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
                "w-10 h-10 p-0 font-bold relative",
                !hasWords && "opacity-30 cursor-not-allowed",
                isSelected && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {letter}
              {hasWords && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
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
