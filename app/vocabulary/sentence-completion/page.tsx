"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft, RotateCcw, CheckCircle2, XCircle, Trophy } from "lucide-react"
import Link from "next/link"
import chapter2Questions from "@/data/vocabulary-chapter2-questions.json"
import { SentenceCompletionQuestion } from "@/components/vocabulary/questions/SentenceCompletionQuestion"

export default function SentenceCompletionPage() {
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [quizComplete, setQuizComplete] = useState(false)
  const [numberOfQuestions, setNumberOfQuestions] = useState(20)

  // Generate quiz questions by shuffling and limiting
  const quizQuestions = useMemo(() => {
    const shuffled = [...chapter2Questions.questions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, numberOfQuestions)
  }, [numberOfQuestions])

  const currentQuestion = quizQuestions[currentQuestionIndex]

  const handleAnswer = (isCorrect: boolean) => {
    setAnswers([...answers, isCorrect])
    if (isCorrect) {
      setScore(score + 1)
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex + 1 < quizQuestions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        setQuizComplete(true)
      }
    }, 2000)
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestionIndex(0)
    setScore(0)
    setAnswers([])
    setQuizComplete(false)
  }

  const startQuiz = () => {
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
                  <p className="text-lg text-muted-foreground">
                    Practice fill-in-the-blank vocabulary questions from Chapter 2
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {/* Quiz Info */}
                    <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                      <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-2">
                        About This Quiz
                      </h3>
                      <p className="text-sm text-teal-800 dark:text-teal-200">
                        This quiz contains {chapter2Questions.totalQuestions} fill-in-the-blank vocabulary questions.
                        Each question tests your understanding of word meanings in context.
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
                      <p className="text-sm text-muted-foreground mb-4">
                        {quizQuestions.length} questions ready
                      </p>
                      <Button
                        onClick={startQuiz}
                        size="lg"
                        className="w-full bg-teal-500 hover:bg-teal-600"
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

  // Quiz complete screen
  if (quizComplete) {
    const percentage = Math.round((score / quizQuestions.length) * 100)
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-3xl">
                <Card className="text-center">
                  <CardContent className="pt-12 pb-8">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/10 text-teal-500">
                      <Trophy className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>

                    <div className="text-6xl font-bold text-teal-500 mb-2">
                      {percentage}%
                    </div>
                    <p className="text-xl text-muted-foreground mb-8">
                      You got {score} out of {quizQuestions.length} correct
                    </p>

                    {/* Performance message */}
                    <div className="mb-8 p-4 rounded-lg bg-muted/50">
                      <p className="text-lg">
                        {percentage >= 90 && "Outstanding! You have excellent vocabulary knowledge! 🎉"}
                        {percentage >= 70 && percentage < 90 && "Great job! Keep practicing to perfect your skills! 👏"}
                        {percentage >= 50 && percentage < 70 && "Good effort! Review the words and try again! 💪"}
                        {percentage < 50 && "Keep studying! Practice makes perfect! 📚"}
                      </p>
                    </div>

                    {/* Answer summary */}
                    <div className="mb-8">
                      <h3 className="font-semibold mb-3">Answer Summary</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {answers.map((isCorrect, idx) => (
                          <div
                            key={idx}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCorrect
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isCorrect ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center flex-wrap">
                      <Button onClick={resetQuiz} size="lg" variant="outline">
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Try Again
                      </Button>
                      <Link href="/vocabulary">
                        <Button size="lg" className="bg-teal-500 hover:bg-teal-600">
                          Back to Vocabulary
                        </Button>
                      </Link>
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
              {/* Progress header */}
              <div className="mb-6 flex items-center justify-between">
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
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  Score: <span className="text-teal-500">{score}/{currentQuestionIndex + 1}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-8 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`
                  }}
                />
              </div>

              {/* Question */}
              {currentQuestion && (
                <SentenceCompletionQuestion
                  question={{
                    id: currentQuestion.id,
                    question: currentQuestion.question,
                    options: currentQuestion.options,
                    answer: currentQuestion.answer
                  }}
                  onAnswer={handleAnswer}
                  showFeedback={true}
                />
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
