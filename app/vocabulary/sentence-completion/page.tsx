"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft, RotateCcw, CheckCircle2, XCircle, Trophy, BookOpen, History } from "lucide-react"
import Link from "next/link"
import chapter2Questions from "@/data/vocabulary-chapter2-questions.json"
import { SentenceCompletionQuestion } from "@/components/vocabulary/questions/SentenceCompletionQuestion"
import { saveMistakes, isUserLoggedIn } from "@/lib/sentence-completion-mistakes"
import { getCompletedQuestions, markQuestionsCompleted, resetProgress as resetProgressDB } from "@/lib/sentence-completion-progress"

export default function SentenceCompletionPage() {
  const [quizStarted, setQuizStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [numberOfQuestions, setNumberOfQuestions] = useState(20)
  const [shuffleSeed, setShuffleSeed] = useState(0) // Trigger to reshuffle questions
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set())

  // Load completed questions from database (or localStorage fallback) on mount
  useEffect(() => {
    async function loadCompletedQuestions() {
      const localStorageKey = 'sentence-completion-completed'

      if (isUserLoggedIn()) {
        // Logged-in user: Load from database
        const dbCompleted = await getCompletedQuestions()

        // Also check localStorage for any local progress
        const localSaved = localStorage.getItem(localStorageKey)
        let localCompleted: string[] = []
        if (localSaved) {
          try {
            localCompleted = JSON.parse(localSaved)
          } catch (e) {
            console.error('Failed to parse localStorage:', e)
          }
        }

        // Merge database and localStorage (union)
        const merged = new Set([...dbCompleted, ...localCompleted])
        setCompletedQuestions(merged)

        // If there were local-only items, sync them to database
        const localOnly = localCompleted.filter(id => !dbCompleted.includes(id))
        if (localOnly.length > 0) {
          console.log(`Syncing ${localOnly.length} local questions to database...`)
          await markQuestionsCompleted(localOnly)
        }

        console.log(`Loaded ${merged.size} completed questions for logged-in user`)
      } else {
        // Anonymous user: Use localStorage only
        const saved = localStorage.getItem(localStorageKey)
        if (saved) {
          try {
            const completed = JSON.parse(saved)
            setCompletedQuestions(new Set(completed))
            console.log(`Loaded ${completed.length} completed questions from localStorage`)
          } catch (e) {
            console.error('Failed to load completed questions:', e)
          }
        }
      }
    }

    loadCompletedQuestions()
  }, [])

  // Generate quiz questions by filtering out completed ones, then shuffling
  const quizQuestions = useMemo(() => {
    // Filter out completed questions
    const available = chapter2Questions.questions.filter(q => !completedQuestions.has(q.id))

    // Shuffle available questions
    const shuffled = [...available].sort(() => Math.random() - 0.5)

    // Take requested number (or all available if fewer)
    return shuffled.slice(0, Math.min(numberOfQuestions, shuffled.length))
  }, [numberOfQuestions, shuffleSeed, completedQuestions])

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    })
  }

  const handleSubmit = async () => {
    // Calculate score and collect mistakes
    let correctCount = 0
    const mistakes: Array<{
      questionId: string
      question: string
      correctAnswer: string
      userAnswer: string
      explanation?: string
    }> = []

    quizQuestions.forEach((q) => {
      const userAnswer = userAnswers[q.id]
      if (userAnswer === q.answer) {
        correctCount++
      } else {
        // Record the mistake
        mistakes.push({
          questionId: q.id,
          question: q.question,
          correctAnswer: q.answer,
          userAnswer: userAnswer || '',
          explanation: q.explanation,
        })
      }
    })

    setScore(correctCount)
    setQuizSubmitted(true)

    // Mark all questions in this quiz as completed
    const newCompleted = new Set(completedQuestions)
    const questionIds = quizQuestions.map(q => q.id)
    questionIds.forEach(id => newCompleted.add(id))
    setCompletedQuestions(newCompleted)

    // Save completed questions to localStorage (always, as backup)
    localStorage.setItem('sentence-completion-completed', JSON.stringify(Array.from(newCompleted)))
    console.log(`Marked ${questionIds.length} questions as completed. Total completed: ${newCompleted.size}`)

    // Save completed questions to database (if user is logged in)
    if (isUserLoggedIn()) {
      const savedCount = await markQuestionsCompleted(questionIds)
      console.log(`Saved ${savedCount} completed questions to database`)
    }

    // Save mistakes to database (if user is logged in)
    if (isUserLoggedIn() && mistakes.length > 0) {
      const savedCount = await saveMistakes(mistakes)
      console.log(`Saved ${savedCount} mistakes for review`)
    }

    // Scroll to top to see results
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const answeredCount = Object.keys(userAnswers).length
  const allAnswered = answeredCount === quizQuestions.length

  const resetQuiz = () => {
    setQuizStarted(false)
    setScore(0)
    setUserAnswers({})
    setQuizSubmitted(false)
    setShuffleSeed(prev => prev + 1) // Trigger reshuffle on reset
  }

  const startQuiz = () => {
    setShuffleSeed(prev => prev + 1) // Trigger reshuffle on start
    setQuizStarted(true)
  }

  const resetProgress = async () => {
    if (confirm('Are you sure you want to reset all progress? This will clear all completed questions.')) {
      // Clear state
      setCompletedQuestions(new Set())

      // Clear localStorage
      localStorage.removeItem('sentence-completion-completed')

      // Clear database (if logged in)
      if (isUserLoggedIn()) {
        const success = await resetProgressDB()
        if (success) {
          console.log('Successfully reset progress in database')
        }
      }

      // Trigger re-shuffle
      setShuffleSeed(prev => prev + 1)
    }
  }

  // Calculate stats
  const totalQuestions = chapter2Questions.questions.length
  const completedCount = completedQuestions.size
  const remainingCount = totalQuestions - completedCount

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
                  href="/vocabulary"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Vocabulary
                </Link>

                <div className="mb-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                    Sentence Completion Quiz
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    Practice fill-in-the-blank vocabulary questions from Chapter 2
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Link href="/vocabulary/sentence-completion/history">
                      <Button variant="outline">
                        <History className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                    </Link>
                    <Link href="/vocabulary/sentence-completion/review">
                      <Button variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Review Mistakes
                      </Button>
                    </Link>
                  </div>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {/* Progress Info */}
                    {completedCount > 0 && (
                      <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-teal-900 dark:text-teal-100">
                            Progress
                          </h3>
                          <Button
                            onClick={resetProgress}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        </div>
                        <p className="text-sm text-teal-800 dark:text-teal-200">
                          Completed: {completedCount} / {totalQuestions} questions
                          <br />
                          Remaining: {remainingCount} questions
                        </p>
                      </div>
                    )}

                    {/* Quiz Info */}
                    <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                      <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-2">
                        About This Quiz
                      </h3>
                      <p className="text-sm text-teal-800 dark:text-teal-200">
                        This quiz contains {totalQuestions} fill-in-the-blank vocabulary questions.
                        Each question tests your understanding of word meanings in context.
                        {completedCount > 0 && ' Completed questions will not appear again.'}
                      </p>
                    </div>

                    {/* Number of Questions */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block">
                        Number of Questions
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[10, 20, 30, 50, 100].map(num => (
                          <Button
                            key={num}
                            onClick={() => setNumberOfQuestions(num)}
                            variant={numberOfQuestions === num ? "default" : "outline"}
                            size="sm"
                            className={numberOfQuestions === num ? "bg-teal-500 hover:bg-teal-600" : ""}
                          >
                            {num}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      {remainingCount === 0 ? (
                        <div className="text-center py-4">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                          <p className="font-semibold mb-2">All Questions Completed!</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            You've finished all {totalQuestions} questions.
                          </p>
                          <Button
                            onClick={resetProgress}
                            variant="outline"
                            size="lg"
                            className="w-full"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Start Over
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground mb-4">
                            {quizQuestions.length} questions ready
                            {remainingCount < numberOfQuestions && (
                              <span className="text-amber-600 dark:text-amber-400">
                                {' '}(only {remainingCount} remaining)
                              </span>
                            )}
                          </p>
                          <Button
                            onClick={startQuiz}
                            size="lg"
                            className="w-full bg-teal-500 hover:bg-teal-600"
                          >
                            Start Quiz
                          </Button>
                        </>
                      )}
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
                    Score: <span className="text-teal-500">{score}/{quizQuestions.length}</span>
                  </div>
                )}
              </div>

              {/* Results Summary (shown after submission) */}
              {quizSubmitted && (
                <Card className="mb-8 border-teal-500 bg-teal-50 dark:bg-teal-950/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10 text-teal-500">
                        <Trophy className="h-8 w-8" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                      <div className="text-5xl font-bold text-teal-500 mb-2">
                        {Math.round((score / quizQuestions.length) * 100)}%
                      </div>
                      <p className="text-lg text-muted-foreground mb-4">
                        You got {score} out of {quizQuestions.length} correct
                      </p>
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm">
                          {Math.round((score / quizQuestions.length) * 100) >= 90 && "Outstanding! You have excellent vocabulary knowledge!"}
                          {Math.round((score / quizQuestions.length) * 100) >= 70 && Math.round((score / quizQuestions.length) * 100) < 90 && "Great job! Keep practicing to perfect your skills!"}
                          {Math.round((score / quizQuestions.length) * 100) >= 50 && Math.round((score / quizQuestions.length) * 100) < 70 && "Good effort! Review the words and try again!"}
                          {Math.round((score / quizQuestions.length) * 100) < 50 && "Keep studying! Practice makes perfect!"}
                        </p>
                      </div>
                      <div className="mt-4 flex gap-2 justify-center flex-wrap">
                        <Button onClick={resetQuiz} variant="outline">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                        {isUserLoggedIn() && (
                          <Link href="/vocabulary/sentence-completion/review">
                            <Button variant="outline">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Review Mistakes
                            </Button>
                          </Link>
                        )}
                        <Link href="/vocabulary">
                          <Button className="bg-teal-500 hover:bg-teal-600">
                            Back to Vocabulary
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
                    <SentenceCompletionQuestion
                      question={{
                        id: question.id,
                        question: question.question,
                        options: question.options,
                        answer: question.answer,
                        explanation: question.explanation
                      }}
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
                <div className="sticky bottom-4 bg-background/95 backdrop-blur-sm rounded-lg border-2 border-teal-500 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm">
                      <span className="font-semibold">{answeredCount}</span> of {quizQuestions.length} questions answered
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={!allAnswered}
                      size="lg"
                      className="bg-teal-500 hover:bg-teal-600"
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
