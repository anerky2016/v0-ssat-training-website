"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft, RotateCcw, CheckCircle2, XCircle, Trophy } from "lucide-react"
import Link from "next/link"
import vocabularyData from "@/data/vocabulary-words.json"
import { SynonymQuestion } from "@/components/vocabulary/questions/SynonymQuestion"
import { AntonymQuestion } from "@/components/vocabulary/questions/AntonymQuestion"
import { AnalogyQuestion } from "@/components/vocabulary/questions/AnalogyQuestion"

type QuestionType = "synonyms" | "antonyms" | "analogies"

interface QuizQuestion {
  id: string
  type: QuestionType
  word: string
  question: string
  options: string[]
  answer: string
  explanation?: string
}

export default function VocabularyQuizPage() {
  const searchParams = useSearchParams()
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [quizComplete, setQuizComplete] = useState(false)

  // Quiz settings
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["synonyms", "antonyms", "analogies"])
  const [numberOfQuestions, setNumberOfQuestions] = useState(10)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  // Initialize from URL parameters
  useEffect(() => {
    const letter = searchParams.get('letter')
    if (letter) {
      setSelectedLetter(letter.toUpperCase())
    }
  }, [searchParams])

  // Generate quiz questions
  const quizQuestions = useMemo(() => {
    const allQuestions: QuizQuestion[] = []

    // Filter words by letter if selected
    const filteredWords = selectedLetter
      ? vocabularyData.words.filter(w => w.word.charAt(0).toUpperCase() === selectedLetter)
      : vocabularyData.words

    // Collect all questions from filtered words
    filteredWords.forEach((wordData) => {
      if (!wordData.questions) return

      // Add synonym questions
      if (selectedTypes.includes("synonyms") && wordData.questions.synonyms) {
        wordData.questions.synonyms.forEach((q, idx) => {
          allQuestions.push({
            id: `${wordData.word}-synonym-${idx}`,
            type: "synonyms",
            word: wordData.word,
            question: q.question,
            options: q.options,
            answer: q.correctAnswer,
            explanation: q.explanation
          })
        })
      }

      // Add antonym questions
      if (selectedTypes.includes("antonyms") && wordData.questions.antonyms) {
        wordData.questions.antonyms.forEach((q, idx) => {
          allQuestions.push({
            id: `${wordData.word}-antonym-${idx}`,
            type: "antonyms",
            word: wordData.word,
            question: q.question,
            options: q.options,
            answer: q.correctAnswer,
            explanation: q.explanation
          })
        })
      }

      // Add analogy questions
      if (selectedTypes.includes("analogies") && wordData.questions.analogies) {
        wordData.questions.analogies.forEach((q, idx) => {
          allQuestions.push({
            id: `${wordData.word}-analogy-${idx}`,
            type: "analogies",
            word: wordData.word,
            question: q.question,
            options: q.options,
            answer: q.correctAnswer,
            explanation: q.explanation
          })
        })
      }
    })

    // Shuffle and limit to requested number
    const shuffled = allQuestions.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, numberOfQuestions)
  }, [selectedTypes, numberOfQuestions, selectedLetter])

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
    if (quizQuestions.length === 0) {
      alert("No questions available with current settings. Please adjust your selections.")
      return
    }
    setQuizStarted(true)
  }

  const toggleQuestionType = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type))
      }
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

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
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                    Vocabulary Quiz
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Test your knowledge with synonyms, antonyms, and analogies
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Types */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block">
                        Question Types
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => toggleQuestionType("synonyms")}
                          variant={selectedTypes.includes("synonyms") ? "default" : "outline"}
                          className={selectedTypes.includes("synonyms") ? "bg-blue-500 hover:bg-blue-600" : ""}
                        >
                          Synonyms
                        </Button>
                        <Button
                          onClick={() => toggleQuestionType("antonyms")}
                          variant={selectedTypes.includes("antonyms") ? "default" : "outline"}
                          className={selectedTypes.includes("antonyms") ? "bg-orange-500 hover:bg-orange-600" : ""}
                        >
                          Antonyms
                        </Button>
                        <Button
                          onClick={() => toggleQuestionType("analogies")}
                          variant={selectedTypes.includes("analogies") ? "default" : "outline"}
                          className={selectedTypes.includes("analogies") ? "bg-purple-500 hover:bg-purple-600" : ""}
                        >
                          Analogies
                        </Button>
                      </div>
                    </div>

                    {/* Number of Questions */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block">
                        Number of Questions
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 20, 25].map(num => (
                          <Button
                            key={num}
                            onClick={() => setNumberOfQuestions(num)}
                            variant={numberOfQuestions === num ? "default" : "outline"}
                            size="sm"
                          >
                            {num}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Letter Filter */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block">
                        Filter by Letter (Optional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => setSelectedLetter(null)}
                          variant={selectedLetter === null ? "default" : "outline"}
                          size="sm"
                        >
                          All
                        </Button>
                        {alphabet.map(letter => (
                          <Button
                            key={letter}
                            onClick={() => setSelectedLetter(letter)}
                            variant={selectedLetter === letter ? "default" : "outline"}
                            size="sm"
                            className="w-10 h-10 p-0"
                          >
                            {letter}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-4">
                        {quizQuestions.length} questions available with current settings
                      </p>
                      <Button
                        onClick={startQuiz}
                        size="lg"
                        className="w-full bg-chart-1 hover:bg-chart-1/90"
                        disabled={quizQuestions.length === 0}
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
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-chart-1/10 text-chart-1">
                      <Trophy className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>

                    <div className="text-6xl font-bold text-chart-1 mb-2">
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
                        <Button size="lg" className="bg-chart-1 hover:bg-chart-1/90">
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
                  Score: <span className="text-chart-1">{score}/{currentQuestionIndex + 1}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-8 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-1 transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`
                  }}
                />
              </div>

              {/* Question */}
              {currentQuestion && (
                <>
                  {currentQuestion.type === "synonyms" && (
                    <SynonymQuestion
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
                  {currentQuestion.type === "antonyms" && (
                    <AntonymQuestion
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
                  {currentQuestion.type === "analogies" && (
                    <AnalogyQuestion
                      question={{
                        id: currentQuestion.id,
                        question: currentQuestion.question,
                        options: currentQuestion.options,
                        answer: currentQuestion.answer,
                        explanation: currentQuestion.explanation
                      }}
                      onAnswer={handleAnswer}
                      showFeedback={true}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
