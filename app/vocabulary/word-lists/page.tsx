"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ListChecks, ArrowLeft } from "lucide-react"
import Link from "next/link"
import vocabularyData from "@/data/vocabulary-words.json"
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard"

export default function WordListsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const wordsPerPage = 20

  const filteredWords = vocabularyData.words.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Reset to page 1 when search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
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

                {filteredWords.length > wordsPerPage && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredWords.length)} of {filteredWords.length} words
                  </div>
                )}
              </div>

              <div id="word-list" className="space-y-6">
                {currentWords.map((word, index) => (
                  <VocabularyWordCard key={startIndex + index} word={word} />
                ))}
              </div>

              {filteredWords.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No words found matching "{searchTerm}"</p>
                  </CardContent>
                </Card>
              )}

              {/* Pagination Controls */}
              {filteredWords.length > wordsPerPage && (
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
