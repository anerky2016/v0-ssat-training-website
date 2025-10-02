"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BookText, CheckCircle2, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

const synonymQuestions = [
  {
    id: 1,
    word: "ABUNDANT",
    options: ["scarce", "plentiful", "moderate", "limited"],
    correct: 1,
    explanation: "Abundant means existing in large quantities; plentiful.",
  },
  {
    id: 2,
    word: "BENEVOLENT",
    options: ["cruel", "kind", "neutral", "angry"],
    correct: 1,
    explanation: "Benevolent means well-meaning and kindly.",
  },
  {
    id: 3,
    word: "CANDID",
    options: ["dishonest", "sweet", "frank", "hidden"],
    correct: 2,
    explanation: "Candid means truthful and straightforward; frank.",
  },
]

const analogyQuestions = [
  {
    id: 4,
    question: "BOOK is to CHAPTER as",
    options: ["car is to wheel", "house is to room", "tree is to forest", "student is to teacher"],
    correct: 1,
    explanation: "A book contains chapters, just as a house contains rooms. This is a part-to-whole relationship.",
  },
  {
    id: 5,
    question: "PAINTER is to BRUSH as",
    options: ["writer is to pen", "doctor is to patient", "teacher is to student", "chef is to restaurant"],
    correct: 0,
    explanation:
      "A painter uses a brush as their tool, just as a writer uses a pen. This is a worker-to-tool relationship.",
  },
]

export default function VerbalExercisesPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)

  const allQuestions = [...synonymQuestions, ...analogyQuestions]

  const handleSubmit = () => {
    setShowResults(true)
  }

  const handleReset = () => {
    setAnswers({})
    setShowResults(false)
  }

  const score = allQuestions.filter((q) => answers[q.id] === q.correct).length

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
                  Verbal Practice Exercises
                </h1>
                <p className="text-lg text-muted-foreground">
                  Practice synonyms and analogies to build your vocabulary skills.
                </p>
              </div>

              {showResults && (
                <Card className="mb-8 border-chart-1 bg-chart-1/5">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Your Score: {score} / {allQuestions.length}
                    </CardTitle>
                    <CardDescription>
                      {score === allQuestions.length
                        ? "Perfect score! Excellent work!"
                        : score >= allQuestions.length * 0.7
                          ? "Great job! Keep practicing to improve further."
                          : "Keep practicing! Review the explanations below."}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Synonyms</h2>
                  {synonymQuestions.map((question, index) => (
                    <Card key={question.id} className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          Question {index + 1}: {question.word}
                          {showResults &&
                            (answers[question.id] === question.correct ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            ))}
                        </CardTitle>
                        <CardDescription>Choose the word closest in meaning</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <RadioGroup
                          value={answers[question.id]?.toString()}
                          onValueChange={(value) =>
                            !showResults && setAnswers({ ...answers, [question.id]: Number.parseInt(value) })
                          }
                          disabled={showResults}
                        >
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2 mb-2">
                              <RadioGroupItem value={optIndex.toString()} id={`q${question.id}-${optIndex}`} />
                              <Label
                                htmlFor={`q${question.id}-${optIndex}`}
                                className={`cursor-pointer ${
                                  showResults && optIndex === question.correct ? "font-semibold text-green-600" : ""
                                }`}
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        {showResults && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Analogies</h2>
                  {analogyQuestions.map((question, index) => (
                    <Card key={question.id} className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          Question {synonymQuestions.length + index + 1}
                          {showResults &&
                            (answers[question.id] === question.correct ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            ))}
                        </CardTitle>
                        <CardDescription>{question.question}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <RadioGroup
                          value={answers[question.id]?.toString()}
                          onValueChange={(value) =>
                            !showResults && setAnswers({ ...answers, [question.id]: Number.parseInt(value) })
                          }
                          disabled={showResults}
                        >
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2 mb-2">
                              <RadioGroupItem value={optIndex.toString()} id={`q${question.id}-${optIndex}`} />
                              <Label
                                htmlFor={`q${question.id}-${optIndex}`}
                                className={`cursor-pointer ${
                                  showResults && optIndex === question.correct ? "font-semibold text-green-600" : ""
                                }`}
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        {showResults && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                {!showResults ? (
                  <Button onClick={handleSubmit} size="lg" className="bg-chart-1 hover:bg-chart-1/90">
                    Submit Answers
                  </Button>
                ) : (
                  <Button onClick={handleReset} size="lg" variant="outline">
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
