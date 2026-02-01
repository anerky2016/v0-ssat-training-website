"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ListChecks, ArrowLeft, ChevronLeft, ChevronRight, X, Filter, Lightbulb, ChevronUp, ChevronDown, Sparkles, Target, TrendingDown, TrendingUp, GraduationCap, Layers, Award, Brain } from "lucide-react"
import Link from "next/link"
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard"
import { VocabularyAlphabetNav } from "@/components/vocabulary-alphabet-nav"
import { LevelSelector } from "@/components/vocabulary/LevelSelector"
import { getAllDifficulties, getDifficultyLabel, getDifficultyColor, isUserLoggedIn, type DifficultyLevel } from "@/lib/vocabulary-difficulty"
import { loadVocabularyWords, VocabularyLevel, getAvailableLevels, getTotalWordCount } from "@/lib/vocabulary-levels"

export default function WordListsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [selectedDifficulties, setSelectedDifficulties] = useState<(DifficultyLevel | 'unreviewed')[]>([])
  const [selectedLevels, setSelectedLevels] = useState<VocabularyLevel[]>(() => {
    const allLevels = getAvailableLevels()
    // Default: include SSAT and all Wordly Wise levels
    return allLevels
  })

  // Helper function to update URL with new params
  const updateURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Update URL
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }
  const [wordDifficulties, setWordDifficulties] = useState<Record<string, DifficultyLevel>>({})
  const [wordReviewStatus, setWordReviewStatus] = useState<Record<string, boolean>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [mobileLetterSelected, setMobileLetterSelected] = useState(false)
  const [desktopLetterSelected, setDesktopLetterSelected] = useState(false)
  const [showHowToDialog, setShowHowToDialog] = useState(false)
  const [difficultiesLoaded, setDifficultiesLoaded] = useState(false)
  const wordsPerPage = 20
  const minSwipeDistance = 50

  // Load vocabulary words from selected levels
  const vocabularyData = useMemo(() => {
    const words = loadVocabularyWords(selectedLevels)
    return { words }
  }, [selectedLevels])

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load difficulties from Supabase
  // Reload when filters change to ensure we have the latest difficulty data
  useEffect(() => {
    const loadDifficulties = async () => {
      // Check if user is logged in
      if (!isUserLoggedIn()) {
        console.warn('User not logged in - difficulty tracking disabled')
        return
      }

      try {
        console.log('Loading latest difficulty data from Supabase...')
        // Load all difficulties from Supabase
        const allDifficulties = await getAllDifficulties()

        // Build maps for quick lookup
        const difficulties: Record<string, DifficultyLevel> = {}
        const reviewStatus: Record<string, boolean> = {}

        vocabularyData.words.forEach(word => {
          const normalizedWord = word.word.toLowerCase()
          const wordDifficulty = allDifficulties[normalizedWord]

          if (wordDifficulty) {
            difficulties[word.word] = wordDifficulty.difficulty
            reviewStatus[word.word] = true
          } else {
            reviewStatus[word.word] = false
          }
        })

        setWordDifficulties(difficulties)
        setWordReviewStatus(reviewStatus)
        setDifficultiesLoaded(true)
        console.log('Difficulty data loaded successfully', {
          totalWords: vocabularyData.words.length,
          wordsWithDifficulty: Object.keys(difficulties).length,
          reviewedWords: Object.values(reviewStatus).filter(Boolean).length
        })
      } catch (error) {
        console.error('Failed to load difficulties:', error)
      }
    }
    loadDifficulties()
  }, [vocabularyData, selectedLetter, selectedDifficulties, searchTerm])

  // Check if this is first visit and show how-to dialog
  useEffect(() => {
    const hasVisited = localStorage.getItem('vocabulary-word-lists-visited')
    if (!hasVisited) {
      setShowHowToDialog(true)
    }
  }, [])

  // Handle dialog close and mark as visited
  const handleDialogClose = () => {
    setShowHowToDialog(false)
    localStorage.setItem('vocabulary-word-lists-visited', 'true')
  }

  // Initialize from URL parameters
  useEffect(() => {
    const letter = searchParams.get('letter')
    const reviewWords = searchParams.get('reviewWords')
    const difficulties = searchParams.get('difficulties')
    const levels = searchParams.get('levels')
    const search = searchParams.get('search')

    // Initialize letter filter
    if (letter) {
      setSelectedLetter(letter.toUpperCase())
      setMobileLetterSelected(true)
      setDesktopLetterSelected(true)
    }

    // Initialize difficulty filter
    if (difficulties) {
      const diffArray = difficulties.split(',').map(d => {
        if (d === 'unreviewed') return 'unreviewed'
        const num = parseInt(d, 10)
        if (!isNaN(num) && num >= 0 && num <= 3) return num as DifficultyLevel
        return null
      }).filter(Boolean) as (DifficultyLevel | 'unreviewed')[]
      setSelectedDifficulties(diffArray)
    }

    // Initialize levels filter
    if (levels) {
      const levelArray = levels.split(',') as VocabularyLevel[]
      const availableLevels = getAvailableLevels()
      const validLevels = levelArray.filter(l => availableLevels.includes(l))
      if (validLevels.length > 0) {
        setSelectedLevels(validLevels)
      }
    }

    // Initialize search term
    if (search) {
      setSearchTerm(search)
    }

    // If coming from review session, auto-show cards
    if (reviewWords || letter || difficulties || search) {
      setMobileLetterSelected(true)
      setDesktopLetterSelected(true)
    }
  }, [searchParams])

  // Calculate letter counts based on selected levels
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

    alphabet.forEach(letter => {
      counts[letter] = 0
    })

    vocabularyData.words.forEach(word => {
      const firstLetter = word.word.charAt(0).toUpperCase()
      if (counts[firstLetter] !== undefined) {
        counts[firstLetter]++
      }
    })

    return counts
  }, [vocabularyData])

  // Calculate difficulty statistics per letter
  const letterDifficultyStats = useMemo(() => {
    console.log('📊 [Word Lists] Calculating letter difficulty statistics...')
    console.log('📊 [Word Lists] Dependencies:', {
      totalWords: vocabularyData.words.length,
      reviewStatusCount: Object.keys(wordReviewStatus).length,
      difficultiesCount: Object.keys(wordDifficulties).length,
      difficultiesLoaded
    })
    const stats: Record<string, { total: number; unreviewed: number; easy: number; medium: number; hard: number; veryHard: number }> = {}
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

    // Initialize stats for each letter
    alphabet.forEach(letter => {
      stats[letter] = {
        total: 0,
        unreviewed: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        veryHard: 0
      }
    })

    console.log(`📊 [Word Lists] Processing ${vocabularyData.words.length} total words`)
    console.log('📊 [Word Lists] Sample wordReviewStatus:', Object.entries(wordReviewStatus).slice(0, 5))
    console.log('📊 [Word Lists] Sample wordDifficulties:', Object.entries(wordDifficulties).slice(0, 5))

    // Count words by letter and difficulty
    vocabularyData.words.forEach(word => {
      const firstLetter = word.word.charAt(0).toUpperCase()
      if (stats[firstLetter]) {
        stats[firstLetter].total++

        const isReviewed = wordReviewStatus[word.word]
        if (!isReviewed) {
          stats[firstLetter].unreviewed++
        } else {
          const difficulty = wordDifficulties[word.word]
          if (difficulty === 0) stats[firstLetter].easy++
          else if (difficulty === 1) stats[firstLetter].medium++
          else if (difficulty === 2) stats[firstLetter].hard++
          else if (difficulty === 3) stats[firstLetter].veryHard++
        }
      }
    })

    // Log statistics for letters with words
    const lettersWithWords = alphabet.filter(letter => stats[letter].total > 0)
    console.log('📊 [Word Lists] Statistics calculated for letters:', lettersWithWords.join(', '))
    lettersWithWords.forEach(letter => {
      console.log(`📊 [Word Lists] Letter ${letter}:`, stats[letter])
    })

    return stats
  }, [vocabularyData, wordReviewStatus, wordDifficulties, difficultiesLoaded])

  const filteredWords = vocabularyData.words.filter(word => {
    // Check if filtering by review words from URL
    const reviewWordsParam = searchParams.get('reviewWords')
    if (reviewWordsParam) {
      const reviewWordsList = reviewWordsParam.split(',').map(w => w.toLowerCase())
      const matchesReviewList = reviewWordsList.includes(word.word.toLowerCase())
      if (!matchesReviewList) return false
    }

    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLetter = !selectedLetter || word.word.charAt(0).toUpperCase() === selectedLetter

    let matchesDifficulty = true
    if (selectedDifficulties.length > 0) {
      const isReviewed = wordReviewStatus[word.word]
      const wordDifficulty = wordDifficulties[word.word]

      // Check if word matches any of the selected difficulties
      matchesDifficulty = selectedDifficulties.some(difficulty => {
        if (difficulty === 'unreviewed') {
          return !isReviewed
        } else {
          return isReviewed && wordDifficulty === difficulty
        }
      })
    }

    return matchesSearch && matchesLetter && matchesDifficulty
  })

  // Calculate difficulty counts for filter buttons
  const difficultyCounts = useMemo(() => {
    const baseWords = vocabularyData.words.filter(word => {
      const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLetter = !selectedLetter || word.word.charAt(0).toUpperCase() === selectedLetter
      return matchesSearch && matchesLetter
    })

    const counts = {
      all: baseWords.length,
      unreviewed: 0,
      0: 0,
      1: 0,
      2: 0,
      3: 0
    }

    baseWords.forEach(word => {
      const isReviewed = wordReviewStatus[word.word]
      if (!isReviewed) {
        counts.unreviewed++
      } else {
        const difficulty = wordDifficulties[word.word]
        if (difficulty !== undefined) {
          counts[difficulty]++
        }
      }
    })

    return counts
  }, [vocabularyData, searchTerm, selectedLetter, wordReviewStatus, wordDifficulties])

  // Reset to page 1 when search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value
    setSearchTerm(newSearch)
    setSelectedLetter(null) // Clear letter filter when searching
    setCurrentPage(1)
    setCurrentCardIndex(0)

    // Update URL
    updateURL({
      search: newSearch || null,
      letter: null, // Clear letter when searching
    })

    // Show cards directly when searching
    if (newSearch) {
      if (isMobile) {
        setMobileLetterSelected(true)
      } else {
        setDesktopLetterSelected(true)
      }
    }
  }

  // Handle difficulty filter - toggle multi-select
  const handleDifficultyFilter = (difficulty: DifficultyLevel | 'unreviewed' | null) => {
    let newDifficulties: (DifficultyLevel | 'unreviewed')[]

    if (difficulty === null) {
      // Clear all filters
      newDifficulties = []
    } else {
      // Toggle the difficulty in the array
      if (selectedDifficulties.includes(difficulty)) {
        newDifficulties = selectedDifficulties.filter(d => d !== difficulty)
      } else {
        newDifficulties = [...selectedDifficulties, difficulty]
      }
    }

    setSelectedDifficulties(newDifficulties)
    setCurrentPage(1)
    setCurrentCardIndex(0)

    // Update URL
    updateURL({
      difficulties: newDifficulties.length > 0 ? newDifficulties.join(',') : null,
    })
  }

  // Handle letter selection
  const handleLetterClick = (letter: string) => {
    const newLetter = letter === selectedLetter ? null : letter
    setSelectedLetter(newLetter)
    setCurrentPage(1)
    setCurrentCardIndex(0)

    // Update URL
    updateURL({
      letter: newLetter,
    })

    // Mark letter as selected to show cards
    if (newLetter) {
      if (isMobile) {
        setMobileLetterSelected(true)
      } else {
        setDesktopLetterSelected(true)
      }
    }
  }

  // Handle "All Words" selection
  const handleAllWordsClick = () => {
    setSelectedLetter(null)
    setCurrentPage(1)
    setCurrentCardIndex(0)

    // Update URL to clear letter filter
    updateURL({
      letter: null,
    })

    if (isMobile) {
      setMobileLetterSelected(true)
    } else {
      setDesktopLetterSelected(true)
    }
  }

  // Return to alphabet selection on mobile
  const handleBackToAlphabet = () => {
    setMobileLetterSelected(false)
    setSelectedLetter(null)
    setCurrentCardIndex(0)
    setSearchTerm('') // Clear search when returning to alphabet

    // Clear URL parameters
    updateURL({
      letter: null,
      search: null,
      difficulties: null,
    })
  }

  // Return to alphabet selection on desktop
  const handleDesktopBackToAlphabet = () => {
    setDesktopLetterSelected(false)
    setSelectedLetter(null)
    setSelectedDifficulties([])
    setCurrentPage(1)
    setSearchTerm('') // Clear search when returning to alphabet

    // Clear URL parameters
    updateURL({
      letter: null,
      search: null,
      difficulties: null,
    })
  }

  // Touch event handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setSwipeDirection(null)
    setIsDragging(true)
    setDragOffset(0)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return

    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)

    // Calculate drag offset for real-time card movement
    const offset = currentTouch - touchStart
    setDragOffset(offset)

    // Prevent browser navigation when swiping horizontally
    // Only prevent if there's significant horizontal movement
    if (Math.abs(offset) > 10) {
      e.preventDefault()
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false)
    setDragOffset(0)

    if (!touchStart || !touchEnd) {
      setTouchStart(null)
      setTouchEnd(null)
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    // Prevent browser back/forward navigation
    if (Math.abs(distance) > 10) {
      e.preventDefault()
    }

    if (isLeftSwipe && currentCardIndex < filteredWords.length - 1) {
      goToNextCard()
    } else if (isRightSwipe && currentCardIndex > 0) {
      goToPreviousCard()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // Card navigation for mobile
  const goToNextCard = () => {
    if (currentCardIndex < filteredWords.length - 1) {
      setSwipeDirection('left')
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1)
        setSwipeDirection(null)
      }, 500) // Match the flip animation duration
    }
  }

  const goToPreviousCard = () => {
    if (currentCardIndex > 0) {
      setSwipeDirection('right')
      setTimeout(() => {
        setCurrentCardIndex(prev => prev - 1)
        setSwipeDirection(null)
      }, 500) // Match the flip animation duration
    }
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredWords.length / wordsPerPage)
  const startIndex = (currentPage - 1) * wordsPerPage
  const endIndex = startIndex + wordsPerPage
  const currentWords = filteredWords.slice(startIndex, endIndex)

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page)
    // Scroll to the word list section
    const wordListElement = document.getElementById('word-list')
    if (wordListElement) {
      wordListElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Show last page
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <Link
                href="/vocabulary"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Vocabulary
              </Link>

              <div className="mb-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-5/10 text-chart-5">
                  <ListChecks className="h-6 w-6" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                  Vocabulary Word Lists
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Comprehensive SSAT vocabulary with pronunciations, definitions, examples, and etymology.
                </p>

                <div className="space-y-4">
                  {/* Level Selector */}
                  <LevelSelector
                    selectedLevels={selectedLevels}
                    onLevelsChange={(levels) => {
                      setSelectedLevels(levels)
                      setCurrentPage(1)
                      setCurrentCardIndex(0)

                      // Update URL
                      updateURL({
                        levels: levels.join(','),
                      })
                    }}
                  />

                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Search words..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-chart-5"
                    />
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  {(desktopLetterSelected || mobileLetterSelected) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Difficulty:</span>
                      <Button
                        onClick={() => handleDifficultyFilter(null)}
                        variant={selectedDifficulties.length === 0 ? "default" : "outline"}
                        size="sm"
                        className={selectedDifficulties.length === 0 ? "bg-chart-5 hover:bg-chart-5/90" : ""}
                      >
                        All ({difficultyCounts.all})
                      </Button>
                      <Button
                        onClick={() => handleDifficultyFilter('unreviewed')}
                        variant={selectedDifficulties.includes('unreviewed') ? "default" : "outline"}
                        size="sm"
                        className={`${selectedDifficulties.includes('unreviewed') ? getDifficultyColor(1, false) : ""}`}
                      >
                        {getDifficultyLabel(1, false)} ({difficultyCounts.unreviewed})
                      </Button>
                      <Button
                        onClick={() => handleDifficultyFilter(0)}
                        variant={selectedDifficulties.includes(0) ? "default" : "outline"}
                        size="sm"
                        className={`${selectedDifficulties.includes(0) ? getDifficultyColor(0) : ""}`}
                      >
                        {getDifficultyLabel(0)} ({difficultyCounts[0]})
                      </Button>
                      <Button
                        onClick={() => handleDifficultyFilter(1)}
                        variant={selectedDifficulties.includes(1) ? "default" : "outline"}
                        size="sm"
                        className={`${selectedDifficulties.includes(1) ? getDifficultyColor(1) : ""}`}
                      >
                        {getDifficultyLabel(1)} ({difficultyCounts[1]})
                      </Button>
                      <Button
                        onClick={() => handleDifficultyFilter(2)}
                        variant={selectedDifficulties.includes(2) ? "default" : "outline"}
                        size="sm"
                        className={`${selectedDifficulties.includes(2) ? getDifficultyColor(2) : ""}`}
                      >
                        {getDifficultyLabel(2)} ({difficultyCounts[2]})
                      </Button>
                      <Button
                        onClick={() => handleDifficultyFilter(3)}
                        variant={selectedDifficulties.includes(3) ? "default" : "outline"}
                        size="sm"
                        className={`${selectedDifficulties.includes(3) ? getDifficultyColor(3) : ""}`}
                      >
                        {getDifficultyLabel(3)} ({difficultyCounts[3]})
                      </Button>
                    </div>
                  )}

                  {/* Letter Statistics Bar Chart */}
                  {(() => {
                    const shouldShow = (desktopLetterSelected || mobileLetterSelected) && selectedLetter && letterDifficultyStats[selectedLetter]
                    console.log('📊 [Word Lists] Statistics Card Display Check:', {
                      shouldShow,
                      desktopLetterSelected,
                      mobileLetterSelected,
                      selectedLetter,
                      hasStats: selectedLetter ? !!letterDifficultyStats[selectedLetter] : false,
                      stats: selectedLetter ? letterDifficultyStats[selectedLetter] : null
                    })
                    return shouldShow
                  })() && (
                    <Card className="p-4 bg-card border-chart-5/20">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Letter {selectedLetter} Statistics</h3>
                          <span className="text-sm text-muted-foreground">
                            {letterDifficultyStats[selectedLetter].total} word{letterDifficultyStats[selectedLetter].total !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Stacked Bar Chart */}
                        <div className="space-y-2">
                          {(() => {
                            const stats = letterDifficultyStats[selectedLetter]
                            console.log('📊 [Bar Chart] Rendering for letter:', selectedLetter, stats)
                            console.log('📊 [Bar Chart] Segments:', {
                              unreviewed: stats.unreviewed > 0,
                              easy: stats.easy > 0,
                              medium: stats.medium > 0,
                              hard: stats.hard > 0,
                              veryHard: stats.veryHard > 0
                            })
                            return null
                          })()}
                          <div className="h-8 flex rounded-lg overflow-hidden bg-secondary">
                            {letterDifficultyStats[selectedLetter].unreviewed > 0 && (
                              <div
                                className="bg-gray-400 hover:opacity-90 transition-opacity flex items-center justify-center text-xs font-medium text-white"
                                style={{ width: `${(letterDifficultyStats[selectedLetter].unreviewed / letterDifficultyStats[selectedLetter].total) * 100}%` }}
                                title={`Unreviewed: ${letterDifficultyStats[selectedLetter].unreviewed}`}
                              >
                                {letterDifficultyStats[selectedLetter].unreviewed > 0 && (
                                  <span className="px-1">{letterDifficultyStats[selectedLetter].unreviewed}</span>
                                )}
                              </div>
                            )}
                            {letterDifficultyStats[selectedLetter].easy > 0 && (
                              <div
                                className="bg-green-500 hover:opacity-90 transition-opacity flex items-center justify-center text-xs font-medium text-white"
                                style={{ width: `${(letterDifficultyStats[selectedLetter].easy / letterDifficultyStats[selectedLetter].total) * 100}%` }}
                                title={`Easy: ${letterDifficultyStats[selectedLetter].easy}`}
                              >
                                {letterDifficultyStats[selectedLetter].easy > 0 && (
                                  <span className="px-1">{letterDifficultyStats[selectedLetter].easy}</span>
                                )}
                              </div>
                            )}
                            {letterDifficultyStats[selectedLetter].medium > 0 && (
                              <div
                                className="bg-yellow-500 hover:opacity-90 transition-opacity flex items-center justify-center text-xs font-medium text-white"
                                style={{ width: `${(letterDifficultyStats[selectedLetter].medium / letterDifficultyStats[selectedLetter].total) * 100}%` }}
                                title={`Medium: ${letterDifficultyStats[selectedLetter].medium}`}
                              >
                                {letterDifficultyStats[selectedLetter].medium > 0 && (
                                  <span className="px-1">{letterDifficultyStats[selectedLetter].medium}</span>
                                )}
                              </div>
                            )}
                            {letterDifficultyStats[selectedLetter].hard > 0 && (
                              <div
                                className="bg-orange-500 hover:opacity-90 transition-opacity flex items-center justify-center text-xs font-medium text-white"
                                style={{ width: `${(letterDifficultyStats[selectedLetter].hard / letterDifficultyStats[selectedLetter].total) * 100}%` }}
                                title={`Hard: ${letterDifficultyStats[selectedLetter].hard}`}
                              >
                                {letterDifficultyStats[selectedLetter].hard > 0 && (
                                  <span className="px-1">{letterDifficultyStats[selectedLetter].hard}</span>
                                )}
                              </div>
                            )}
                            {letterDifficultyStats[selectedLetter].veryHard > 0 && (
                              <div
                                className="bg-red-500 hover:opacity-90 transition-opacity flex items-center justify-center text-xs font-medium text-white"
                                style={{ width: `${(letterDifficultyStats[selectedLetter].veryHard / letterDifficultyStats[selectedLetter].total) * 100}%` }}
                                title={`Very Hard: ${letterDifficultyStats[selectedLetter].veryHard}`}
                              >
                                {letterDifficultyStats[selectedLetter].veryHard > 0 && (
                                  <span className="px-1">{letterDifficultyStats[selectedLetter].veryHard}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Legend */}
                          <div className="flex flex-wrap gap-3 text-xs">
                            {letterDifficultyStats[selectedLetter].unreviewed > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-gray-400" />
                                <span className="text-muted-foreground">Unreviewed ({letterDifficultyStats[selectedLetter].unreviewed})</span>
                              </div>
                            )}
                            {letterDifficultyStats[selectedLetter].easy > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-green-500" />
                                <span className="text-muted-foreground">Easy ({letterDifficultyStats[selectedLetter].easy})</span>
                              </div>
                            )}
                            {letterDifficultyStats[selectedLetter].medium > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-yellow-500" />
                                <span className="text-muted-foreground">Medium ({letterDifficultyStats[selectedLetter].medium})</span>
                              </div>
                            )}
                            {letterDifficultyStats[selectedLetter].hard > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-orange-500" />
                                <span className="text-muted-foreground">Hard ({letterDifficultyStats[selectedLetter].hard})</span>
                              </div>
                            )}
                            {letterDifficultyStats[selectedLetter].veryHard > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-red-500" />
                                <span className="text-muted-foreground">Very Hard ({letterDifficultyStats[selectedLetter].veryHard})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {!isMobile && desktopLetterSelected && filteredWords.length > wordsPerPage && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredWords.length)} of {filteredWords.length} words
                  </div>
                )}
              </div>

              {/* Desktop: Alphabet Selection Screen */}
              {!isMobile && !desktopLetterSelected ? (
                <div className="mb-6">
                  <Card className="p-8 border-chart-5 bg-chart-5/5">
                    <h2 className="text-2xl font-bold text-center mb-4">Select a Letter to Start</h2>
                    <p className="text-base text-muted-foreground text-center mb-6">
                      Choose a letter to study vocabulary words, or browse all words
                    </p>

                    <VocabularyAlphabetNav
                      selectedLetter={selectedLetter}
                      onLetterClick={handleLetterClick}
                      letterCounts={letterCounts}
                      letterDifficultyStats={letterDifficultyStats}
                      className="mb-6"
                    />

                    <Button
                      onClick={handleAllWordsClick}
                      variant="default"
                      size="lg"
                      className="w-full max-w-md mx-auto block bg-chart-5 hover:bg-chart-5/90"
                    >
                      <ListChecks className="h-5 w-5 mr-2" />
                      Browse All {filteredWords.length} Words
                    </Button>
                  </Card>
                </div>
              ) : null}

              {/* Mobile: Alphabet Selection Screen */}
              {isMobile && !mobileLetterSelected ? (
                <div className="mb-6">
                  <Card className="p-6 border-chart-5 bg-chart-5/5">
                    <h2 className="text-xl font-bold text-center mb-4">Select a Letter to Start</h2>
                    <p className="text-sm text-muted-foreground text-center mb-6">
                      Choose a letter to study vocabulary words, or browse all words
                    </p>

                    <VocabularyAlphabetNav
                      selectedLetter={selectedLetter}
                      onLetterClick={handleLetterClick}
                      letterCounts={letterCounts}
                      letterDifficultyStats={letterDifficultyStats}
                      className="mb-4"
                    />

                    <Button
                      onClick={handleAllWordsClick}
                      variant="default"
                      size="lg"
                      className="w-full bg-chart-5 hover:bg-chart-5/90 mt-4"
                    >
                      <ListChecks className="h-5 w-5 mr-2" />
                      Browse All {filteredWords.length} Words
                    </Button>
                  </Card>
                </div>
              ) : null}

              {/* Mobile Card View with Swipe */}
              {isMobile && mobileLetterSelected && filteredWords.length > 0 ? (
                <div className="mb-6">
                  {/* Header with Exit Button and Letter Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleBackToAlphabet}
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        title="Exit card mode"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      <div className="text-base font-semibold">
                        {selectedLetter ? (
                          <>
                            <span className="text-muted-foreground">Letter</span>{' '}
                            <span className="text-chart-5 text-xl">{selectedLetter}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">All Words</span>
                        )}
                      </div>
                    </div>
                    <div className="text-base font-semibold text-chart-5">
                      {currentCardIndex + 1} / {filteredWords.length}
                    </div>
                  </div>

                  <div
                    id="word-list"
                    className="relative overflow-visible"
                    style={{
                      perspective: '1200px',
                      minHeight: '600px',
                      touchAction: 'pan-y',
                      overscrollBehavior: 'contain'
                    }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    {/* Current card with book flip animation */}
                    <div
                      className={`${isDragging ? '' : 'transition-all duration-500 ease-out'}`}
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: isDragging
                          ? `rotateY(${dragOffset / 5}deg) translateZ(0px)`
                          : swipeDirection === 'left'
                          ? 'rotateY(-180deg) translateZ(-50px)'
                          : swipeDirection === 'right'
                          ? 'rotateY(180deg) translateZ(-50px)'
                          : 'rotateY(0deg) translateZ(0px)',
                        opacity: isDragging
                          ? Math.max(0.7, 1 - Math.abs(dragOffset) / 600)
                          : swipeDirection
                          ? 0
                          : 1,
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      <VocabularyWordCard word={filteredWords[currentCardIndex]} />
                    </div>

                    {/* Next card preview (behind current card) */}
                    {!swipeDirection && (dragOffset > 50 || dragOffset < -50) && (
                      <div
                        className="absolute inset-0 -z-10"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: dragOffset > 0
                            ? `rotateY(${-180 + dragOffset / 5}deg) translateZ(-50px)`
                            : `rotateY(${180 + dragOffset / 5}deg) translateZ(-50px)`,
                          opacity: Math.min(Math.abs(dragOffset) / 200, 1),
                          backfaceVisibility: 'hidden',
                        }}
                      >
                        <VocabularyWordCard
                          word={filteredWords[
                            dragOffset > 0
                              ? Math.max(0, currentCardIndex - 1)
                              : Math.min(filteredWords.length - 1, currentCardIndex + 1)
                          ]}
                        />
                      </div>
                    )}

                    {/* Page flip edge shadow */}
                    {isDragging && Math.abs(dragOffset) > 20 && (
                      <div
                        className={`absolute top-0 bottom-0 w-8 pointer-events-none ${
                          dragOffset > 0 ? 'left-0' : 'right-0'
                        }`}
                        style={{
                          background: dragOffset > 0
                            ? `linear-gradient(to right, rgba(0,0,0,${Math.min(Math.abs(dragOffset) / 300, 0.3)}), transparent)`
                            : `linear-gradient(to left, rgba(0,0,0,${Math.min(Math.abs(dragOffset) / 300, 0.3)}), transparent)`,
                        }}
                      />
                    )}

                    {/* Swipe direction indicators */}
                    {isDragging && Math.abs(dragOffset) > 30 && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 ${
                          dragOffset > 0 ? 'left-4' : 'right-4'
                        } bg-chart-5 text-white rounded-full p-3 shadow-lg transition-opacity z-10`}
                        style={{ opacity: Math.min(Math.abs(dragOffset) / 100, 1) }}
                      >
                        {dragOffset > 0 ? (
                          <ChevronLeft className="h-6 w-6" />
                        ) : (
                          <ChevronRight className="h-6 w-6" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pagination Dots */}
                  <div className="flex items-center justify-center gap-1.5 my-4">
                    {filteredWords.slice(0, Math.min(filteredWords.length, 10)).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSwipeDirection(index > currentCardIndex ? 'left' : 'right')
                          setTimeout(() => {
                            setCurrentCardIndex(index)
                            setSwipeDirection(null)
                          }, 500)
                        }}
                        className={`h-2 rounded-full transition-all ${
                          index === currentCardIndex
                            ? 'w-8 bg-chart-5'
                            : 'w-2 bg-muted hover:bg-muted-foreground/30'
                        }`}
                        aria-label={`Go to word ${index + 1}`}
                      />
                    ))}
                    {filteredWords.length > 10 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        +{filteredWords.length - 10}
                      </span>
                    )}
                  </div>

                  {/* Mobile Navigation Controls */}
                  <div className="flex items-center justify-between mt-4 gap-4">
                    <Button
                      onClick={goToPreviousCard}
                      disabled={currentCardIndex === 0}
                      variant="outline"
                      size="lg"
                      className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5 mr-2" />
                      <span className="hidden xs:inline">Previous</span>
                      <span className="xs:hidden">Prev</span>
                    </Button>
                    <div className="text-sm font-semibold text-foreground whitespace-nowrap px-3 py-2 rounded-md bg-muted">
                      {currentCardIndex + 1} / {filteredWords.length}
                    </div>
                    <Button
                      onClick={goToNextCard}
                      disabled={currentCardIndex === filteredWords.length - 1}
                      variant="outline"
                      size="lg"
                      className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <span className="xs:hidden">Next</span>
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Desktop List View - only show after letter selection */}
              {!isMobile && desktopLetterSelected && filteredWords.length > 0 && (
                <>
                  {/* Header with Reset Button */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleDesktopBackToAlphabet}
                        variant="outline"
                        size="sm"
                        className="h-9"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reset Selection
                      </Button>
                      {selectedLetter && (
                        <div className="text-base font-semibold">
                          <span className="text-muted-foreground">Letter</span>{' '}
                          <span className="text-chart-5 text-xl">{selectedLetter}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div id="word-list" className="space-y-6">
                    {currentWords.map((word, index) => (
                      <VocabularyWordCard key={startIndex + index} word={word} index={startIndex + index + 1} />
                    ))}
                  </div>
                </>
              )}

              {filteredWords.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      {searchTerm ? (
                        `No words found matching "${searchTerm}"`
                      ) : selectedDifficulties.length > 0 ? (
                        `No words found with selected difficulties${selectedLetter ? ` in letter "${selectedLetter}"` : ''}`
                      ) : selectedLetter ? (
                        `No words found starting with "${selectedLetter}"`
                      ) : (
                        'No words found'
                      )}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Pagination Controls - Desktop Only, after letter selection */}
              {!isMobile && desktopLetterSelected && filteredWords.length > wordsPerPage && (
                <div className="mt-8">
                  {/* Page Numbers - Centered */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center mb-4">
                    {getPageNumbers().map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-muted-foreground text-sm">
                            ...
                          </span>
                        )
                      }
                      return (
                        <Button
                          key={page}
                          onClick={() => goToPage(page as number)}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          className={`min-w-[36px] sm:min-w-[40px] h-9 px-2 sm:px-3 text-sm ${
                            currentPage === page
                              ? 'bg-chart-5 hover:bg-chart-5/90 text-white'
                              : ''
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Previous/Next Buttons - Full Width on Mobile */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Previous</span>
                      <span className="xs:hidden">Prev</span>
                    </Button>

                    <Button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      className="w-full"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <span className="xs:hidden">Next</span>
                      <ArrowLeft className="h-4 w-4 ml-1 sm:ml-2 rotate-180" />
                    </Button>
                  </div>

                  {/* Page Info - Mobile Friendly */}
                  <div className="mt-3 text-center text-xs sm:text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              )}

              {/* Only show practice buttons after letter selection */}
              {((isMobile && mobileLetterSelected) || (!isMobile && desktopLetterSelected)) && filteredWords.length > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    href={`/vocabulary/flashcards?words=${encodeURIComponent(
                      filteredWords.map(w => w.word).join(',')
                    )}&from=word-lists${selectedLetter ? `&letter=${selectedLetter}` : ''}`}
                  >
                    <Button size="lg" className="bg-chart-5 hover:bg-chart-5/90 w-full sm:w-auto">
                      <Brain className="h-5 w-5 mr-2" />
                      Practice with Flashcards ({filteredWords.length} words)
                    </Button>
                  </Link>
                  <Link
                    href={`/vocabulary/quiz${selectedLetter ? `?letter=${selectedLetter}` : ''}`}
                  >
                    <Button size="lg" className="bg-chart-1 hover:bg-chart-1/90 w-full sm:w-auto">
                      <Award className="h-5 w-5 mr-2" />
                      Take Quiz on {selectedLetter ? `Letter ${selectedLetter}` : 'All Words'}
                    </Button>
                  </Link>
                </div>
              )}

              <Card className="mt-8 border-chart-5 bg-chart-5/5">
                <CardHeader>
                  <CardTitle>Study Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>• Pay attention to the etymology (word origins) to understand root meanings</p>
                  <p>• Notice patterns in synonyms to build word families in your memory</p>
                  <p>• Read the examples carefully to understand context and usage</p>
                  <p>• Look for common prefixes and suffixes (ab-, -tion, -ive, etc.)</p>
                  <p>• Practice using new words in your own sentences</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* How-To Dialog for First-Time Users */}
      <Dialog open={showHowToDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-7 w-7 text-yellow-500" />
              <DialogTitle className="text-2xl">Welcome! Let's Get Started 🎯</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Here's everything you need to know about tracking your vocabulary progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Difficulty Levels Section */}
            <div className="bg-gradient-to-r from-green-500/10 to-red-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                <Target className="h-5 w-5" />
                Track Your Progress with Levels
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Each word has a level that shows how well you know it. You can change the level
                anytime using the ↑ and ↓ buttons next to each word.
              </p>

              <div className="space-y-3 mt-4">
                <div className="flex items-start gap-3">
                  <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${getDifficultyColor(1, false)}`}>
                    {getDifficultyLabel(1, false)}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    Brand new words! Haven't checked them yet. Click ↑ or ↓ to pick a level.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${getDifficultyColor(0)}`}>
                    {getDifficultyLabel(0)}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    You've got this! These words are easy for you.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${getDifficultyColor(1)}`}>
                    {getDifficultyLabel(1)}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    Pretty comfortable with these. Just need a quick review now and then.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${getDifficultyColor(2)}`}>
                    {getDifficultyLabel(2)}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    These are tricky! Need more practice to remember them.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${getDifficultyColor(3)}`}>
                    {getDifficultyLabel(3)}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    Super challenging! These need extra time and lots of practice.
                  </p>
                </div>
              </div>
            </div>

            {/* How to Use Controls */}
            <div>
              <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                How to Change Levels:
              </h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <p>Click <strong>↓ down arrow</strong> when a word gets easier for you (you're learning it!)</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600 flex-shrink-0" />
                  <p>Click <strong>↑ up arrow</strong> if a word feels harder (needs more study time)</p>
                </div>
              </div>
            </div>

            {/* Filtering */}
            <div>
              <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Focus on What You Need:
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                After you pick a letter, you'll see buttons at the top to show only certain types of words.
                Want to practice only hard words? Just click "Hard" and that's all you'll see!
                This makes studying much easier.
              </p>
            </div>

            {/* Flashcard Mode */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-base mb-3 text-purple-700 dark:text-purple-400 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Try Flashcard Mode!
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Flashcards are like digital study cards - tap to flip them over! Find this in the Vocabulary section.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[70px]">Front side:</span>
                  <span>The word and how to say it (with sound 🔊)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[70px]">Back side:</span>
                  <span>What it means, example sentences, and more</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[70px]">On computer:</span>
                  <span>Click to flip • ← → arrows to move • Enter/Space to flip</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[70px]">On phone:</span>
                  <span>Tap to flip • Swipe left/right to move between cards</span>
                </div>
              </div>
            </div>

            {/* Study Tips */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-base mb-2 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Quick Study Tip
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Start here:</strong> Look at your "Wait for decision" words first - pick levels for them.
                Then practice the "Hard" and "Very Hard" ones. Don't forget to review the "Easy" ones sometimes
                to keep them fresh in your memory!
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleDialogClose} className="w-full sm:w-auto gap-2">
              <Sparkles className="h-4 w-4" />
              Got it! Let's start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
