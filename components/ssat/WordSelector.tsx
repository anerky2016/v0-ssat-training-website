"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LevelSelector } from "@/components/vocabulary/LevelSelector"
import { VocabularyLevel, loadVocabularyWords, type VocabularyWord } from "@/lib/vocabulary-levels"
import { getAllDifficulties, getDifficultyLabel, getDifficultyColor, type DifficultyLevel } from "@/lib/vocabulary-difficulty"
import { Loader2, CheckCircle2 } from "lucide-react"

interface WordSelectorProps {
  onWordsSelected: (words: string[]) => void
  selectedWords: string[]
}

export function WordSelector({ onWordsSelected, selectedWords }: WordSelectorProps) {
  const [selectedLevels, setSelectedLevels] = useState<VocabularyLevel[]>(["SSAT"])
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyLevel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [availableWords, setAvailableWords] = useState<VocabularyWord[]>([])
  const [visibleWords, setVisibleWords] = useState<VocabularyWord[]>([])
  const [loadMoreCount, setLoadMoreCount] = useState(50)
  const [wordDifficulties, setWordDifficulties] = useState<Record<string, DifficultyLevel>>({})

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  const difficultyLevels: DifficultyLevel[] = [0, 1, 2, 3]

  // Load difficulty data
  useEffect(() => {
    const loadDifficulties = async () => {
      const difficulties = await getAllDifficulties()
      const difficultyMap: Record<string, DifficultyLevel> = {}
      Object.values(difficulties).forEach(d => {
        difficultyMap[d.word.toLowerCase()] = d.difficulty
      })
      setWordDifficulties(difficultyMap)
    }
    loadDifficulties()
  }, [])

  // Load words when filters change
  useEffect(() => {
    setLoadMoreCount(50) // Reset to initial count when filters change
    loadWords()
  }, [selectedLevels, selectedLetters, selectedDifficulties])

  const loadWords = () => {
    if (selectedLevels.length === 0) {
      setAvailableWords([])
      setVisibleWords([])
      return
    }

    setIsLoading(true)
    try {
      const allWords: VocabularyWord[] = []

      for (const level of selectedLevels) {
        const levelWords = loadVocabularyWords([level])
        console.log(`[WordSelector] Loaded ${levelWords.length} words for level ${level}`)
        allWords.push(...levelWords.map(w => ({ ...w, level })))
      }

      console.log(`[WordSelector] Total words loaded: ${allWords.length}`)
      console.log(`[WordSelector] Selected letters: ${selectedLetters.join(', ')}`)

      // Apply filters
      let filtered = allWords

      // Filter by letter
      if (selectedLetters.length > 0) {
        filtered = filtered.filter(w =>
          selectedLetters.some(letter => w.word.toUpperCase().startsWith(letter))
        )
        console.log(`[WordSelector] After letter filter: ${filtered.length} words`)
        if (filtered.length > 0) {
          console.log(`[WordSelector] First few words: ${filtered.slice(0, 5).map(w => w.word).join(', ')}`)
        }
      }

      // Filter by difficulty
      if (selectedDifficulties.length > 0) {
        filtered = filtered.filter(w => {
          const difficulty = wordDifficulties[w.word.toLowerCase()]
          return difficulty !== undefined && selectedDifficulties.includes(difficulty)
        })
        console.log(`[WordSelector] After difficulty filter: ${filtered.length} words`)
      }

      setAvailableWords(filtered)
      setVisibleWords(filtered.slice(0, loadMoreCount))
    } catch (error) {
      console.error('Error loading words:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadMore = () => {
    const newCount = loadMoreCount + 50
    setLoadMoreCount(newCount)
    setVisibleWords(availableWords.slice(0, newCount))
  }

  const handleWordToggle = (word: string) => {
    const newSelected = selectedWords.includes(word)
      ? selectedWords.filter(w => w !== word)
      : [...selectedWords, word]
    console.log(`[WordSelector] Word toggled: ${word}, New selection count: ${newSelected.length}`, newSelected)
    onWordsSelected(newSelected)
  }

  const handleSelectAll = () => {
    const allWords = availableWords.map(w => w.word)
    onWordsSelected(allWords)
  }

  const handleClearAll = () => {
    onWordsSelected([])
  }

  return (
    <div className="space-y-6">
      {/* Level Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <LevelSelector
            selectedLevels={selectedLevels}
            onLevelsChange={setSelectedLevels}
          />
        </CardContent>
      </Card>

      {/* Letter Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Letter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {alphabet.map((letter) => (
              <Button
                key={letter}
                onClick={() => {
                  setSelectedLetters(prev =>
                    prev.includes(letter)
                      ? prev.filter(l => l !== letter)
                      : [...prev, letter]
                  )
                }}
                variant={selectedLetters.includes(letter) ? "default" : "outline"}
                size="sm"
                className={selectedLetters.includes(letter) ? "bg-purple-500 hover:bg-purple-600" : ""}
              >
                {letter}
              </Button>
            ))}
            {selectedLetters.length > 0 && (
              <Button
                onClick={() => setSelectedLetters([])}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {difficultyLevels.map((level) => {
              const label = getDifficultyLabel(level, true)
              const isSelected = selectedDifficulties.includes(level)
              return (
                <Button
                  key={level}
                  onClick={() => {
                    setSelectedDifficulties(prev =>
                      prev.includes(level)
                        ? prev.filter(d => d !== level)
                        : [...prev, level]
                    )
                  }}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={isSelected ? "bg-purple-500 hover:bg-purple-600" : ""}
                >
                  {label}
                </Button>
              )
            })}
            {selectedDifficulties.length > 0 && (
              <Button
                onClick={() => setSelectedDifficulties([])}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Clear
              </Button>
            )}
          </div>
          {selectedDifficulties.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              No difficulty filter applied - showing all words
            </p>
          )}
        </CardContent>
      </Card>

      {/* Word List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Select Words ({selectedWords.length} selected)
            </CardTitle>
            <div className="flex gap-2">
              {availableWords.length > 0 && (
                <>
                  <Button
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                  >
                    Select All ({availableWords.length})
                  </Button>
                  {selectedWords.length > 0 && (
                    <Button
                      onClick={handleClearAll}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : availableWords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No words found with current filters</p>
              <p className="text-sm mt-2">Try selecting different levels or removing filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
                {visibleWords.map((wordData) => {
                  const isSelected = selectedWords.includes(wordData.word)
                  return (
                    <div
                      key={wordData.word}
                      onClick={() => handleWordToggle(wordData.word)}
                      className={`
                        p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                          : 'border-border hover:border-purple-300 dark:hover:border-purple-700'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {wordData.word}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {wordData.level === "SSAT" ? "SSAT" : `WW${wordData.level}`}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {visibleWords.length < availableWords.length && (
                <div className="text-center mt-4">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    size="sm"
                  >
                    Load More ({availableWords.length - visibleWords.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
