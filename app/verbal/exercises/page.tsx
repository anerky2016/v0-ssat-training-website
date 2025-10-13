"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookText, ArrowLeft, RotateCcw, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import vocabQuestions from "@/data/vocab_questions.json"
import {
  SynonymQuestion,
  AntonymQuestion,
  SentenceCompletionQuestion,
  DefinitionMatchQuestion,
  type SynonymQuestionData,
  type AntonymQuestionData,
  type SentenceCompletionQuestionData,
  type DefinitionMatchQuestionData,
} from "@/components/vocabulary/questions"

type QuestionType = 'synonym' | 'antonym' | 'sentence' | 'definition'

interface SelectedQuestion {
  word: string
  type: QuestionType
  data: SynonymQuestionData | AntonymQuestionData | SentenceCompletionQuestionData | DefinitionMatchQuestionData
}

export default function VerbalExercisesPage() {
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [showResults, setShowResults] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const wordsPerPage = 3

  // Randomly select one question of each type for each word (client-side only)
  useEffect(() => {
    const questions: SelectedQuestion[] = []

    vocabQuestions.questions.forEach((wordData) => {
      const { word, questionSet } = wordData

      // Randomly select one synonym question
      if (questionSet.synonymQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * questionSet.synonymQuestions.length)
        questions.push({
          word,
          type: 'synonym',
          data: questionSet.synonymQuestions[randomIndex]
        })
      }

      // Randomly select one antonym question
      if (questionSet.antonymQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * questionSet.antonymQuestions.length)
        questions.push({
          word,
          type: 'antonym',
          data: questionSet.antonymQuestions[randomIndex]
        })
      }

      // Randomly select one sentence completion question
      if (questionSet.sentenceCompletionQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * questionSet.sentenceCompletionQuestions.length)
        questions.push({
          word,
          type: 'sentence',
          data: questionSet.sentenceCompletionQuestions[randomIndex]
        })
      }

      // Randomly select one definition match question
      if (questionSet.definitionMatchQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * questionSet.definitionMatchQuestions.length)
        questions.push({
          word,
          type: 'definition',
          data: questionSet.definitionMatchQuestions[randomIndex]
        })
      }
    })

    setSelectedQuestions(questions)
  }, [])

  const handleAnswer = (questionId: string, isCorrect: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: isCorrect
    }))
  }

  const handleSubmit = () => {
    setShowResults(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setAnswers({})
    setShowResults(false)
    setSearchTerm("")
    setCurrentPage(1)
    // Force page reload to get new random questions
    window.location.reload()
  }

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Group questions by word
  const questionsByWord = useMemo(() => {
    const grouped: Record<string, SelectedQuestion[]> = {}
    selectedQuestions.forEach((q) => {
      if (!grouped[q.word]) {
        grouped[q.word] = []
      }
      grouped[q.word].push(q)
    })
    return grouped
  }, [selectedQuestions])

  // Filter questions by search term
  const filteredQuestionsByWord = useMemo(() => {
    if (!searchTerm.trim()) {
      return questionsByWord
    }

    const filtered: Record<string, SelectedQuestion[]> = {}
    const lowerSearchTerm = searchTerm.toLowerCase()

    Object.entries(questionsByWord).forEach(([word, questions]) => {
      if (word.toLowerCase().includes(lowerSearchTerm)) {
        filtered[word] = questions
      }
    })

    return filtered
  }, [questionsByWord, searchTerm])

  // Paginate words
  const allWords = Object.keys(filteredQuestionsByWord)
  const totalPages = Math.ceil(allWords.length / wordsPerPage)
  const startIndex = (currentPage - 1) * wordsPerPage
  const endIndex = startIndex + wordsPerPage
  const currentPageWords = allWords.slice(startIndex, endIndex)

  // Get questions for current page only
  const paginatedQuestionsByWord = useMemo(() => {
    const paginated: Record<string, SelectedQuestion[]> = {}
    currentPageWords.forEach(word => {
      paginated[word] = filteredQuestionsByWord[word]
    })
    return paginated
  }, [filteredQuestionsByWord, currentPageWords])

  // Calculate question IDs for current page only
  const currentPageQuestionIds = useMemo(() => {
    const ids = new Set<string>()
    Object.entries(paginatedQuestionsByWord).forEach(([word, questions]) => {
      questions.forEach((q) => {
        const questionKey = `${word}-${q.type}-${q.data.id}`
        ids.add(questionKey)
      })
    })
    return ids
  }, [paginatedQuestionsByWord])

  const totalQuestions = currentPageQuestionIds.size
  const answeredQuestions = Object.keys(answers).filter(id => currentPageQuestionIds.has(id)).length
  const correctAnswers = Object.entries(answers)
    .filter(([id, isCorrect]) => currentPageQuestionIds.has(id) && isCorrect)
    .length
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  // Pagination handlers
  const scrollToQuestions = () => {
    const questionsElement = document.getElementById('questions-section')
    if (questionsElement) {
      questionsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      setTimeout(() => scrollToQuestions(), 100)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      setTimeout(() => scrollToQuestions(), 100)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <Link
                href="/verbal"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Verbal
              </Link>

              <div className="mb-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1">
                  <BookText className="h-6 w-6" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                  Vocabulary Practice Exercises
                </h1>
                <p className="text-lg text-muted-foreground">
                  Test your vocabulary skills with synonyms, antonyms, sentence completion, and definitions.
                </p>
              </div>

              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by word..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 h-12 text-base"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {searchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Found {allWords.length} word{allWords.length !== 1 ? 's' : ''} matching "{searchTerm}"
                  </p>
                )}
                {allWords.length > wordsPerPage && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing page {currentPage} of {totalPages}
                  </p>
                )}
              </div>

              {/* Progress Card */}
              {!showResults && answeredQuestions > 0 && (
                <Card className="mb-8 border-chart-1 bg-chart-1/5">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Progress: {answeredQuestions} / {totalQuestions}
                    </CardTitle>
                    <CardDescription>
                      Keep going! Answer all questions to see your results.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {/* Results Card */}
              {showResults && (
                <Card className="mb-8 border-chart-1 bg-chart-1/5">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Your Score: {correctAnswers} / {totalQuestions} ({percentage}%)
                    </CardTitle>
                    <CardDescription className="text-base">
                      {percentage === 100
                        ? "🎉 Perfect score! Outstanding work!"
                        : percentage >= 80
                          ? "🌟 Excellent! You have a strong vocabulary."
                          : percentage >= 60
                            ? "👍 Good job! Keep practicing to improve further."
                            : "📚 Keep studying! Review the vocabulary words and try again."}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {/* Loading State */}
              {selectedQuestions.length === 0 && (
                <div className="text-center py-12">
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                  </div>
                  <p className="text-muted-foreground mt-4">Loading questions...</p>
                </div>
              )}

              {/* No results message */}
              {selectedQuestions.length > 0 && allWords.length === 0 && (
                <Card className="border-orange-500">
                  <CardContent className="pt-6 text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No words found</h3>
                    <p className="text-muted-foreground mb-4">
                      No vocabulary words match "{searchTerm}"
                    </p>
                    <Button onClick={() => setSearchTerm("")} variant="outline">
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Questions grouped by word */}
              <div id="questions-section" className="space-y-12">
                {Object.entries(paginatedQuestionsByWord).map(([word, questions], wordIndex) => (
                  <div key={word}>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-foreground capitalize">
                        {word}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Word {startIndex + wordIndex + 1} of {allWords.length}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {questions.map((question, index) => {
                        const questionKey = `${word}-${question.type}-${question.data.id}`

                        switch (question.type) {
                          case 'synonym':
                            return (
                              <SynonymQuestion
                                key={questionKey}
                                question={question.data as SynonymQuestionData}
                                onAnswer={(isCorrect) => handleAnswer(questionKey, isCorrect)}
                                showFeedback={showResults}
                              />
                            )
                          case 'antonym':
                            return (
                              <AntonymQuestion
                                key={questionKey}
                                question={question.data as AntonymQuestionData}
                                onAnswer={(isCorrect) => handleAnswer(questionKey, isCorrect)}
                                showFeedback={showResults}
                              />
                            )
                          case 'sentence':
                            return (
                              <SentenceCompletionQuestion
                                key={questionKey}
                                question={question.data as SentenceCompletionQuestionData}
                                onAnswer={(isCorrect) => handleAnswer(questionKey, isCorrect)}
                                showFeedback={showResults}
                              />
                            )
                          case 'definition':
                            return (
                              <DefinitionMatchQuestion
                                key={questionKey}
                                question={question.data as DefinitionMatchQuestionData}
                                onAnswer={(isCorrect) => handleAnswer(questionKey, isCorrect)}
                                showFeedback={showResults}
                              />
                            )
                          default:
                            return null
                        }
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8">
                  {/* Page indicator - centered on mobile */}
                  <div className="text-center mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  {/* Navigation buttons - grid on mobile, flex on desktop */}
                  <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-center sm:gap-4">
                    <Button
                      variant="outline"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="h-10 sm:h-auto flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden xs:inline">Previous</span>
                      <span className="xs:hidden">Prev</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="h-10 sm:h-auto flex items-center justify-center gap-2"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <span className="xs:hidden">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-12 flex gap-4 flex-wrap">
                {!showResults ? (
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    disabled={answeredQuestions < totalQuestions}
                    className="bg-chart-1 hover:bg-chart-1/90"
                  >
                    Submit Answers {answeredQuestions > 0 && `(${answeredQuestions}/${totalQuestions})`}
                  </Button>
                ) : (
                  <Button onClick={handleReset} size="lg" variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try New Questions
                  </Button>
                )}

                <Link href="/vocabulary/word-lists">
                  <Button variant="ghost" size="lg">
                    Study Word List
                  </Button>
                </Link>

                <Link href="/vocabulary/flashcards">
                  <Button variant="ghost" size="lg">
                    Practice Flashcards
                  </Button>
                </Link>
              </div>

              {/* Tips Card */}
              <Card className="mt-8 border-chart-1 bg-chart-1/5">
                <CardHeader>
                  <CardTitle>Study Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>• Read each question carefully before selecting an answer</p>
                  <p>• For synonyms and antonyms, think about the meaning of the word</p>
                  <p>• In sentence completion, try each option in the blank to see what fits best</p>
                  <p>• Definition questions test your precise understanding of word meanings</p>
                  <p>• Click "Try New Questions" to practice with different questions for each word</p>
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
