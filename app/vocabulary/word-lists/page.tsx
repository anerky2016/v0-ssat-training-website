"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
import { ListChecks, ArrowLeft, ChevronLeft, ChevronRight, X, Filter, Lightbulb, ChevronUp, ChevronDown } from "lucide-react"
import Link from "next/link"
import vocabularyData from "@/data/vocabulary-words.json"
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard"
import { VocabularyAlphabetNav } from "@/components/vocabulary-alphabet-nav"
import { getWordDifficulty, getDifficultyLabel, getDifficultyColor, initializeDifficulties, hasWordBeenReviewed, type DifficultyLevel } from "@/lib/vocabulary-difficulty"

export default function WordListsPage() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null | 'unreviewed'>(null)
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
  const wordsPerPage = 20
  const minSwipeDistance = 50

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize difficulties and load word difficulties
  useEffect(() => {
    const loadDifficulties = async () => {
      await initializeDifficulties()
      // Load all word difficulties and review status
      const difficulties: Record<string, DifficultyLevel> = {}
      const reviewStatus: Record<string, boolean> = {}
      vocabularyData.words.forEach(word => {
        difficulties[word.word] = getWordDifficulty(word.word)
        reviewStatus[word.word] = hasWordBeenReviewed(word.word)
      })
      setWordDifficulties(difficulties)
      setWordReviewStatus(reviewStatus)
    }
    loadDifficulties()
  }, [])

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
    if (letter) {
      setSelectedLetter(letter.toUpperCase())
      setMobileLetterSelected(true)
      setDesktopLetterSelected(true)
    }
  }, [searchParams])

  // Calculate letter counts
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
  }, [])

  const filteredWords = vocabularyData.words.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLetter = !selectedLetter || word.word.charAt(0).toUpperCase() === selectedLetter

    let matchesDifficulty = true
    if (selectedDifficulty === 'unreviewed') {
      matchesDifficulty = !wordReviewStatus[word.word]
    } else if (selectedDifficulty !== null) {
      matchesDifficulty = wordDifficulties[word.word] === selectedDifficulty
    }

    return matchesSearch && matchesLetter && matchesDifficulty
  })

  // Reset to page 1 when search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setSelectedLetter(null) // Clear letter filter when searching
    setCurrentPage(1)
    setCurrentCardIndex(0)

    // Show cards directly when searching
    if (e.target.value) {
      if (isMobile) {
        setMobileLetterSelected(true)
      } else {
        setDesktopLetterSelected(true)
      }
    }
  }

  // Handle difficulty filter
  const handleDifficultyFilter = (difficulty: DifficultyLevel | null | 'unreviewed') => {
    setSelectedDifficulty(difficulty)
    setCurrentPage(1)
    setCurrentCardIndex(0)
  }

  // Handle letter selection
  const handleLetterClick = (letter: string) => {
    const newLetter = letter === selectedLetter ? null : letter
    setSelectedLetter(newLetter)
    setCurrentPage(1)
    setCurrentCardIndex(0)

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
  }

  // Return to alphabet selection on desktop
  const handleDesktopBackToAlphabet = () => {
    setDesktopLetterSelected(false)
    setSelectedLetter(null)
    setSelectedDifficulty(null)
    setCurrentPage(1)
    setSearchTerm('') // Clear search when returning to alphabet
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
                        variant={selectedDifficulty === null ? "default" : "outline"}
                        size="sm"
                        className={selectedDifficulty === null ? "bg-chart-5 hover:bg-chart-5/90" : ""}
                      >
                        All
                      </Button>
                      <Button
                        onClick={() => handleDifficultyFilter('unreviewed')}
                        variant={selectedDifficulty === 'unreviewed' ? "default" : "outline"}
                        size="sm"
                        className={`${selectedDifficulty === 'unreviewed' ? getDifficultyColor(1, false) : ""}`}
                      >
                        {getDifficultyLabel(1, false)}
                      </Button>
                      <Button
                        onClick={() => handleDifficultyFilter(0)}
                        variant={selectedDifficulty === 0 ? "default" : "outline"}
                        size="sm"
                        className={`${selectedDifficulty === 0 ? getDifficultyColor(0) : ""}`}
                      >
                        {getDifficultyLabel(0)}
                      </Button>
                      <Button
                        onClick={() => handleDifficultyFilter(1)}
                        variant={selectedDifficulty === 1 ? "default" : "outline"}
                        size="sm"
                        className={`${selectedDifficulty === 1 ? getDifficultyColor(1) : ""}`}
                      >
                        {getDifficultyLabel(1)}
                      </Button>
                      <Button
                        onClick={() => handleDifficultyFilter(2)}
                        variant={selectedDifficulty === 2 ? "default" : "outline"}
                        size="sm"
                        className={`${selectedDifficulty === 2 ? getDifficultyColor(2) : ""}`}
                      >
                        {getDifficultyLabel(2)}
                      </Button>
                      <Button
                        onClick={() => handleDifficultyFilter(3)}
                        variant={selectedDifficulty === 3 ? "default" : "outline"}
                        size="sm"
                        className={`${selectedDifficulty === 3 ? getDifficultyColor(3) : ""}`}
                      >
                        {getDifficultyLabel(3)}
                      </Button>
                    </div>
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
                    <p className="text-muted-foreground">No words found matching "{searchTerm}"</p>
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

              {/* Only show flashcard button after letter selection */}
              {((isMobile && mobileLetterSelected) || (!isMobile && desktopLetterSelected)) && filteredWords.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Link
                    href={`/vocabulary/flashcards?words=${encodeURIComponent(
                      filteredWords.map(w => w.word).join(',')
                    )}&from=word-lists${selectedLetter ? `&letter=${selectedLetter}` : ''}`}
                  >
                    <Button size="lg" className="bg-chart-5 hover:bg-chart-5/90">
                      Practice with Flashcards ({filteredWords.length} words)
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
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <DialogTitle className="text-2xl">Welcome to Vocabulary Word Lists!</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Learn how to use the difficulty level system to track your vocabulary progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Difficulty System Overview */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Filter className="h-5 w-5 text-chart-5" />
                How the Difficulty System Works
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Each vocabulary word can be assigned a difficulty level to help you track which words need more practice.
                You can adjust the difficulty using the up/down buttons on each word card.
              </p>
            </div>

            {/* Difficulty Levels */}
            <div>
              <h4 className="font-semibold text-base mb-3">Difficulty Levels:</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${getDifficultyColor(1, false)}`}>
                    {getDifficultyLabel(1, false)}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    New words you haven't evaluated yet. Click the difficulty buttons to set a level.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${getDifficultyColor(0)}`}>
                    {getDifficultyLabel(0)}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    Words you know well and can use confidently in sentences.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${getDifficultyColor(1)}`}>
                    {getDifficultyLabel(1)}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    Words you're familiar with but might need occasional review.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${getDifficultyColor(2)}`}>
                    {getDifficultyLabel(2)}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    Challenging words that require more practice and review.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${getDifficultyColor(3)}`}>
                    {getDifficultyLabel(3)}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    Very difficult words that need significant study and practice.
                  </p>
                </div>
              </div>
            </div>

            {/* How to Use Controls */}
            <div>
              <h4 className="font-semibold text-base mb-3">Adjusting Difficulty:</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <ChevronDown className="h-5 w-5 text-green-600" />
                  <p>Click the <strong>down arrow</strong> to make a word easier (you're getting better at it!)</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <ChevronUp className="h-5 w-5 text-orange-600" />
                  <p>Click the <strong>up arrow</strong> to mark a word as harder (needs more practice)</p>
                </div>
              </div>
            </div>

            {/* Filtering */}
            <div>
              <h4 className="font-semibold text-base mb-3">Filtering Words:</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once you select a letter or view words, you'll see filter buttons at the top.
                Use these to show only words at a specific difficulty level, helping you focus your study sessions
                on exactly what you need to practice.
              </p>
            </div>

            {/* Flashcard Mode */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-base mb-3 text-purple-700 dark:text-purple-400">🃏 Flashcard Mode</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Switch to flashcard mode for interactive study sessions! Access it from the Vocabulary section.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[80px]">Front:</span>
                  <span>Shows the word, pronunciation, and audio button</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[80px]">Back:</span>
                  <span>Reveals definition, examples, synonyms, antonyms, and etymology</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[80px]">Controls:</span>
                  <span>Click/tap to flip • Arrow keys (←/→) to navigate • Enter/Space to flip</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[80px]">Mobile:</span>
                  <span>Swipe left for next card • Swipe right for previous card</span>
                </div>
              </div>
            </div>

            {/* Study Tips */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-base mb-2 text-blue-700 dark:text-blue-400">💡 Study Tip</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Start by reviewing "Wait for decision" words to build your initial assessment.
                Then focus on "Hard" and "Very Hard" words during study sessions, and periodically
                review "Easy" and "Medium" words to maintain retention.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleDialogClose} className="w-full sm:w-auto">
              Got it! Let's start learning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
