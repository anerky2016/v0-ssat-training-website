"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import exercisesData from "@/data/math-practice-exercises.json"

const exercises = exercisesData.exercises

export default function ExercisesPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})

  const handleSubmit = (questionId: number) => {
    setSubmitted({ ...submitted, [questionId]: true })
  }

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex })
    setSubmitted({ ...submitted, [questionId]: false })
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <Link
            href="/math"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Math
          </Link>

          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 text-balance">
              {exercisesData.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed">
              {exercisesData.description}. Select your answer and check your work.
            </p>
          </div>

          <div className="space-y-6">
            {exercises.map((exercise, index) => {
              const isSubmitted = submitted[exercise.id]
              const userAnswer = answers[exercise.id]
              const isCorrect = userAnswer === exercise.correct

              return (
                <Card key={exercise.id} className="border-border bg-card">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {exercise.topic}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            exercise.difficulty === "Easy"
                              ? "bg-green-500/10 text-green-700 dark:text-green-400"
                              : exercise.difficulty === "Medium"
                                ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                : "bg-red-500/10 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {exercise.difficulty}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{exercise.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={userAnswer?.toString()}
                      onValueChange={(value) => handleAnswer(exercise.id, Number.parseInt(value))}
                      className="space-y-3 mb-4"
                    >
                      {exercise.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={optionIndex.toString()} id={`q${exercise.id}-${optionIndex}`} />
                          <Label
                            htmlFor={`q${exercise.id}-${optionIndex}`}
                            className="flex-1 cursor-pointer text-sm sm:text-base"
                          >
                            {option}
                          </Label>
                          {isSubmitted && optionIndex === exercise.correct && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          {isSubmitted && optionIndex === userAnswer && !isCorrect && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      ))}
                    </RadioGroup>

                    {!isSubmitted && userAnswer !== undefined && (
                      <Button onClick={() => handleSubmit(exercise.id)} className="w-full sm:w-auto">
                        Check Answer
                      </Button>
                    )}

                    {isSubmitted && (
                      <div
                        className={`mt-4 p-4 rounded-lg ${
                          isCorrect
                            ? "bg-green-500/10 border border-green-500/20"
                            : "bg-red-500/10 border border-red-500/20"
                        }`}
                      >
                        <p
                          className={`font-medium mb-2 ${isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                        >
                          {isCorrect ? "Correct!" : "Incorrect"}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          <strong>Explanation:</strong> {exercise.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
