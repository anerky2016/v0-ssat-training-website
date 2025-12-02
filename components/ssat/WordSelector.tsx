"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LevelSelector } from "@/components/vocabulary/LevelSelector"
import { VocabularyLevel, loadVocabularyWords, type VocabularyWord } from "@/lib/vocabulary-levels"
import { getAllDifficulties } from "@/lib/vocabulary-difficulty"
import { Loader2, CheckCircle2 } from "lucide-react"

interface WordSelectorProps {
  onWordsSelected: (words: string[]) => void
  selectedWords: string[]
}

export function WordSelector({ onWordsSelected, selectedWords }: WordSelectorProps) {
  const [selectedLevels, setSelectedLevels] = useState<VocabularyLevel[]>(["SSAT"])
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [availableWords, setAvailableWords] = useState<VocabularyWord[]>([])
  const [visibleWords, setVisibleWords] = useState<VocabularyWord[]>([])
  const [loadMoreCount, setLoadMoreCount] = useState(50)
  const [hasDifficultyData, setHasDifficultyData] = useState(false)

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  // Load words when filters change
  useEffect(() => {
    loadWords()
  }, [selectedLevels, selectedLetters, selectedDifficulties])

  const loadWords = async () => {
    if (selectedLevels.length === 0) {
      setAvailableWords([])
      setVisibleWords([])
      return
    }

    setIsLoading(true)
    try {
      const allWords: VocabularyWord[] = []

      for (const level of selectedLevels) {
        const levelWords = await loadVocabularyWords(level)
        allWords.push(...levelWords.map(w => ({ ...w, level })))
      }

      // Apply filters
      let filtered = allWords

      // Filter by letter
      if (selectedLetters.length > 0) {
        filtered = filtered.filter(w =>
          selectedLetters.some(letter => w.word.toUpperCase().startsWith(letter))
        )
      }

      // Filter by difficulty (only if user has rated words)
      if (selectedDifficulties.length > 0) {
        const userDifficulties = await getAllDifficulties()
        const hasData = Object.keys(userDifficulties).length > 0
        setHasDifficultyData(hasData)

        if (hasData) {
          filtered = filtered.filter(w => {
            const diff = userDifficulties[w.word.toLowerCase()]
            return diff !== undefined && selectedDifficulties.includes(diff)
          })
        }
        // If no difficulty data exists, ignore the difficulty filter and show all words
      } else {
        setHasDifficultyData(false)
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
    onWordsSelected(newSelected)
  }

  const handleSelectAll = () => {
    const allWords = availableWords.map(w => w.word)
    onWordsSelected(allWords)
  }

  const handleClearAll = () => {
    onWordsSelected([])
  }

  const difficultyLabels = ['Easy', 'Medium', 'Hard', 'Very Hard']
  const difficultyColors = [
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  ]

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
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {difficultyLabels.map((label, index) => (
              <Badge
                key={index}
                onClick={() => {
                  setSelectedDifficulties(prev =>
                    prev.includes(index)
                      ? prev.filter(d => d !== index)
                      : [...prev, index]
                  )
                }}
                className={`cursor-pointer transition-opacity ${
                  selectedDifficulties.includes(index)
                    ? difficultyColors[index]
                    : 'bg-muted text-muted-foreground opacity-50 hover:opacity-100'
                }`}
              >
                {label}
              </Badge>
            ))}
            {selectedDifficulties.length > 0 && (
              <Button
                onClick={() => setSelectedDifficulties([])}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 h-auto py-1"
              >
                Clear
              </Button>
            )}
          </div>
          {selectedDifficulties.length > 0 && !hasDifficultyData && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Difficulty filtering requires rating words first. Since no difficulty ratings exist, showing all words matching other filters.
              </p>
            </div>
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
