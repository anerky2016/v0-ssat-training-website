"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ListChecks, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import vocabularyData from "@/data/vocabulary-words.json"
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard"
import { VocabularyAlphabetNav } from "@/components/vocabulary-alphabet-nav"

export default function WordListsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
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
    return matchesSearch && matchesLetter
  })

  // Reset to page 1 when search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setSelectedLetter(null) // Clear letter filter when searching
    setCurrentPage(1)
    setCurrentCardIndex(0)
  }

  // Handle letter selection
  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? null : letter)
    setCurrentPage(1)
    setCurrentCardIndex(0)
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
  }

  const onTouchEnd = () => {
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
      }, 150)
    }
  }

  const goToPreviousCard = () => {
    if (currentCardIndex > 0) {
      setSwipeDirection('right')
      setTimeout(() => {
        setCurrentCardIndex(prev => prev - 1)
        setSwipeDirection(null)
      }, 150)
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

                {!isMobile && filteredWords.length > wordsPerPage && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredWords.length)} of {filteredWords.length} words
                  </div>
                )}
              </div>

              <VocabularyAlphabetNav
                selectedLetter={selectedLetter}
                onLetterClick={handleLetterClick}
                letterCounts={letterCounts}
                className="mb-6"
              />

              {/* Mobile Card View with Swipe */}
              {isMobile && filteredWords.length > 0 ? (
                <div className="mb-6">
                  {/* Swipe Hint */}
                  <div className="text-center mb-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ChevronLeft className="h-4 w-4 animate-pulse" />
                    <span>Swipe to navigate</span>
                    <ChevronRight className="h-4 w-4 animate-pulse" />
                  </div>

                  <div
                    id="word-list"
                    className="relative overflow-hidden touch-pan-y"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    {/* Card with real-time drag feedback */}
                    <div
                      className={`${isDragging ? '' : 'transition-all duration-300 ease-out'}`}
                      style={{
                        transform: isDragging
                          ? `translateX(${dragOffset}px) scale(${1 - Math.abs(dragOffset) / 2000})`
                          : swipeDirection === 'left'
                          ? 'translateX(-100%)'
                          : swipeDirection === 'right'
                          ? 'translateX(100%)'
                          : 'translateX(0)',
                        opacity: isDragging
                          ? Math.max(0.5, 1 - Math.abs(dragOffset) / 400)
                          : swipeDirection
                          ? 0
                          : 1,
                      }}
                    >
                      <VocabularyWordCard word={filteredWords[currentCardIndex]} />
                    </div>

                    {/* Swipe direction indicators */}
                    {isDragging && Math.abs(dragOffset) > 20 && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 ${
                          dragOffset > 0 ? 'left-4' : 'right-4'
                        } bg-chart-5 text-white rounded-full p-3 shadow-lg transition-opacity`}
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
                          }, 150)
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
                      className="flex-1 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-5 w-5 mr-2" />
                      Previous
                    </Button>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {currentCardIndex + 1} / {filteredWords.length}
                    </div>
                    <Button
                      onClick={goToNextCard}
                      disabled={currentCardIndex === filteredWords.length - 1}
                      variant="outline"
                      size="lg"
                      className="flex-1 disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* Desktop List View */
                <div id="word-list" className="space-y-6">
                  {currentWords.map((word, index) => (
                    <VocabularyWordCard key={startIndex + index} word={word} />
                  ))}
                </div>
              )}

              {filteredWords.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No words found matching "{searchTerm}"</p>
                  </CardContent>
                </Card>
              )}

              {/* Pagination Controls - Desktop Only */}
              {!isMobile && filteredWords.length > wordsPerPage && (
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

              <div className="mt-8 flex justify-center">
                <Link href="/vocabulary/flashcards">
                  <Button size="lg" className="bg-chart-5 hover:bg-chart-5/90">
                    Practice with Flashcards
                  </Button>
                </Link>
              </div>

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
    </div>
  )
}
