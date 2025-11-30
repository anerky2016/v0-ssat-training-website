"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft, RotateCcw, Trophy, Trash2 } from "lucide-react"
import Link from "next/link"
import { AnalogyQuestion, type AnalogyQuestionData } from "@/components/ssat/AnalogyQuestion"
import test8Data from "@/data/ssat-test8-questions.json"
import { getCompletedQuestions, markQuestionsCompleted, resetProgress, isUserLoggedIn } from "@/lib/ssat-progress"

export default function AnalogyPracticePage() {
  const [quizStarted, setQuizStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [numberOfQuestions, setNumberOfQuestions] = useState(20)
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Load completed questions on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const completed = await getCompletedQuestions('ANALOGY')
        setCompletedQuestions(new Set(completed))
      } catch (error) {
        console.error('Error loading progress:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProgress()
  }, [])

  // Filter analogy questions only
  const allAnalogyQuestions = useMemo(() => {
    return test8Data.questions.filter(q => q.questionType === 'ANALOGY') as AnalogyQuestionData[]
  }, [])

  // Generate quiz questions by shuffling
  const quizQuestions = useMemo(() => {
    const shuffled = [...allAnalogyQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(numberOfQuestions, shuffled.length))
  }, [numberOfQuestions, shuffleSeed, allAnalogyQuestions])

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = () => {
    let correctCount = 0

    quizQuestions.forEach((q) => {
      const userAnswer = userAnswers[q.id]
      if (userAnswer === q.answer) {
        correctCount++
      }
    })

    setScore(correctCount)
    setQuizSubmitted(true)

    // Scroll to top to see results
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const answeredCount = Object.keys(userAnswers).length
  const allAnswered = answeredCount === quizQuestions.length

  const resetQuiz = async () => {
    // Mark questions as completed before exiting
    if (quizSubmitted) {
      const questionIds = quizQuestions.map(q => q.id)
      await markQuestionsCompleted(questionIds, 'ANALOGY')

      // Update local state
      const newCompleted = new Set(completedQuestions)
      questionIds.forEach(id => newCompleted.add(id))
      setCompletedQuestions(newCompleted)
    }

    setQuizStarted(false)
    setScore(0)
    setUserAnswers({})
    setQuizSubmitted(false)
    setShuffleSeed(prev => prev + 1)
  }

  const handleResetProgress = async () => {
    if (confirm('Are you sure you want to reset all analogy progress? This cannot be undone.')) {
      const success = await resetProgress('ANALOGY')
      if (success) {
        setCompletedQuestions(new Set())
        alert('Progress reset successfully!')
      } else {
        alert('Failed to reset progress. Please try again.')
      }
    }
  }

  const startQuiz = () => {
    setShuffleSeed(prev => prev + 1)
    setQuizStarted(true)
  }

  // Setup screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-3xl">
                <Link
                  href="/ssat"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to SSAT Practice
                </Link>

                <div className="mb-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                    Analogy Practice
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    Practice solving analogies from SSAT Test 8
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {/* Progress Stats */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                          Your Progress
                        </h3>
                        {completedQuestions.size > 0 && (
                          <Button
                            onClick={handleResetProgress}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-purple-800 dark:text-purple-200">Completed:</span>
                          <span className="font-semibold text-purple-900 dark:text-purple-100">
                            {completedQuestions.size} / {allAnalogyQuestions.length}
                          </span>
                        </div>
                        <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(completedQuestions.size / allAnalogyQuestions.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quiz Info */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        About This Quiz
                      </h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        This quiz contains {allAnalogyQuestions.length} analogy questions from SSAT Middle Level Test 8.
                        Each question tests your ability to identify word relationships and complete analogies.
                      </p>
                    </div>

                    {/* Number of Questions */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block">
                        Number of Questions
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[10, 20, 30, 50].map(num => (
                          <Button
                            key={num}
                            onClick={() => setNumberOfQuestions(num)}
                            variant={numberOfQuestions === num ? "default" : "outline"}
                            size="sm"
                            className={numberOfQuestions === num ? "bg-purple-500 hover:bg-purple-600" : ""}
                            disabled={num > allAnalogyQuestions.length}
                          >
                            {num}
                          </Button>
                        ))}
                        <Button
                          onClick={() => setNumberOfQuestions(allAnalogyQuestions.length)}
                          variant={numberOfQuestions === allAnalogyQuestions.length ? "default" : "outline"}
                          size="sm"
                          className={numberOfQuestions === allAnalogyQuestions.length ? "bg-purple-500 hover:bg-purple-600" : ""}
                        >
                          All ({allAnalogyQuestions.length})
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-4">
                        {quizQuestions.length} questions ready
                      </p>
                      <Button
                        onClick={startQuiz}
                        size="lg"
                        className="w-full bg-purple-500 hover:bg-purple-600"
                      >
                        Start Quiz
                      </Button>
                    </div>
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

  // Quiz in progress
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 -mt-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={resetQuiz}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Exit Quiz
                  </Button>
                  <div className="text-sm font-semibold text-muted-foreground">
                    {answeredCount} of {quizQuestions.length} answered
                  </div>
                </div>
                {quizSubmitted && (
                  <div className="text-sm font-semibold">
                    Score: <span className="text-purple-500">{score}/{quizQuestions.length}</span>
                  </div>
                )}
              </div>

              {/* Results Summary */}
              {quizSubmitted && (
                <Card className="mb-8 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                        <Trophy className="h-8 w-8" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                      <div className="text-5xl font-bold text-purple-500 mb-2">
                        {Math.round((score / quizQuestions.length) * 100)}%
                      </div>
                      <p className="text-lg text-muted-foreground mb-4">
                        You got {score} out of {quizQuestions.length} correct
                      </p>
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm">
                          {Math.round((score / quizQuestions.length) * 100) >= 90 && "Outstanding! You have excellent analogy skills!"}
                          {Math.round((score / quizQuestions.length) * 100) >= 70 && Math.round((score / quizQuestions.length) * 100) < 90 && "Great job! Keep practicing to perfect your skills!"}
                          {Math.round((score / quizQuestions.length) * 100) >= 50 && Math.round((score / quizQuestions.length) * 100) < 70 && "Good effort! Review the relationships and try again!"}
                          {Math.round((score / quizQuestions.length) * 100) < 50 && "Keep studying! Practice makes perfect!"}
                        </p>
                      </div>
                      <div className="mt-4 flex gap-2 justify-center flex-wrap">
                        <Button onClick={resetQuiz} variant="outline">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                        <Link href="/ssat">
                          <Button className="bg-purple-500 hover:bg-purple-600">
                            Back to SSAT Practice
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Questions */}
              <div className="space-y-6 mb-8">
                {quizQuestions.map((question, index) => (
                  <div key={question.id}>
                    <div className="text-sm font-semibold text-muted-foreground mb-2">
                      Question {index + 1} of {quizQuestions.length}
                    </div>
                    <AnalogyQuestion
                      question={question}
                      selectedAnswer={userAnswers[question.id] || null}
                      onSelectAnswer={(answer) => handleSelectAnswer(question.id, answer)}
                      submitted={quizSubmitted}
                      showFeedback={quizSubmitted}
                    />
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              {!quizSubmitted && (
                <div className="sticky bottom-4 bg-background/95 backdrop-blur-sm rounded-lg border-2 border-purple-500 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm">
                      <span className="font-semibold">{answeredCount}</span> of {quizQuestions.length} questions answered
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={!allAnswered}
                      size="lg"
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      Submit Quiz
                    </Button>
                  </div>
                  {!allAnswered && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Please answer all questions before submitting
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
