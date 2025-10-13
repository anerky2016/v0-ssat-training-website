"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lightbulb, Target, BookOpen, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import exponentsData from "@/data/exponents-negative-bases.json"
import { MathJaxContext, MathJax } from 'better-react-mathjax'
import { PrintExercisesButton } from "@/components/print-exercises-button"
import { CompleteStudyButton } from "@/components/complete-study-button"

export default function NegativeExponentsNegativeBasesPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy")
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>({})

  const mathJaxConfig = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']]
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleAnswer = (id: string) => {
    setShowAnswers(prev => {
      const newState = { ...prev, [id]: !prev[id] }

      // Dispatch custom event when answer is revealed for tracking
      if (newState[id] && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('answer-revealed'))
      }

      return newState
    })
  }

  const toggleQuizAnswer = (id: string) => {
    setQuizAnswers(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (!mounted) {
    return null
  }

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="min-h-screen">
        <Header />
        <main>
          {/* Hero Section */}
          <section className="py-4 sm:py-6 lg:py-8 bg-gradient-to-b from-chart-7/5 to-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <Link href="/math/exponents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Exponents Chapter
                </Link>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                  {exponentsData.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  <strong>Audience:</strong> {exponentsData.audience}
                </p>
                <p className="text-base text-muted-foreground mb-6">
                  <MathJax>{exponentsData.summary}</MathJax>
                </p>
                <CompleteStudyButton topicTitle={exponentsData.title} />
              </div>
            </div>
          </section>

          {/* Key Points */}
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-chart-3" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Key Points</h2>
                </div>
                <div className="grid gap-6">
                  {exponentsData.keyPoints.map((point, index) => (
                    <Card key={index} className="border-chart-3/20">
                      <CardHeader>
                        <CardTitle className="text-xl text-primary">{point.heading}</CardTitle>
                        <CardDescription className="text-base">{point.kidFriendlyNote}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <MathJax>{point.latex}</MathJax>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Common Pitfalls */}
          <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Common Pitfalls</h2>
                </div>
                <div className="grid gap-6">
                  {exponentsData.commonPitfalls.map((pitfall, index) => (
                    <Card key={index} className="border-orange-500/20">
                      <CardHeader>
                        <CardTitle className="text-lg text-orange-600 dark:text-orange-400">{pitfall.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 overflow-x-auto">
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">❌ Wrong:</p>
                            <MathJax>{pitfall.badLatex}</MathJax>
                          </div>
                          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 overflow-x-auto">
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">✓ Correct:</p>
                            <MathJax>{pitfall.fixLatex}</MathJax>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Worked Examples */}
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-chart-4" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Worked Examples</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {exponentsData.workedExamples.map((example) => (
                    <Card key={example.id} className="border-chart-4/20">
                      <CardHeader>
                        <CardTitle className="text-lg">Example {example.id.replace('ex', '')}</CardTitle>
                        <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <MathJax>{example.promptLatex}</MathJax>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-foreground">Solution:</p>
                          <ol className="space-y-2">
                            {example.solutionSteps.map((step, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="font-semibold text-primary">{idx + 1}.</span>
                                <span><MathJax>{step}</MathJax></span>
                              </li>
                            ))}
                          </ol>
                          <div className="bg-chart-4/10 rounded-lg p-4 overflow-x-auto">
                            <p className="text-sm font-semibold text-foreground mb-2">Answer:</p>
                            <MathJax>{example.answerLatex}</MathJax>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Mini Quiz */}
          <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <Card className="border-purple-500/20 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <CardHeader>
                    <CardTitle className="text-xl">Quick Check: {exponentsData.miniQuiz.prompt}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-6">
                      {exponentsData.miniQuiz.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              id={item.id}
                              checked={quizAnswers[item.id] || false}
                              onChange={() => toggleQuizAnswer(item.id)}
                              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor={item.id} className="text-base cursor-pointer">
                              <MathJax>{item.latex}</MathJax>
                            </label>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">💡 Explanation:</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        <MathJax>{exponentsData.miniQuiz.explanation}</MathJax>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Teacher Tips */}
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-chart-5/10 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-chart-5" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Pro Tips</h2>
                </div>
                <div className="grid gap-4">
                  {exponentsData.teacherTips.map((note, index) => (
                    <Card key={index} className="border-chart-5/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-chart-5 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground"><MathJax>{note}</MathJax></p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Practice Exercises */}
          <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Practice Problems</h2>
                <p className="text-muted-foreground mb-6">
                  Master negative exponents with practice problems at different difficulty levels.
                </p>

                {/* Difficulty Selector and Print Button */}
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  {Object.keys(exponentsData.exercises).filter(key => key !== 'instructions').map((difficulty) => (
                    <Button
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? "default" : "outline"}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className="capitalize"
                    >
                      {difficulty}
                    </Button>
                  ))}
                  {exponentsData.exercises[selectedDifficulty as keyof typeof exponentsData.exercises] && (
                    <PrintExercisesButton
                      exercises={exponentsData.exercises[selectedDifficulty as keyof typeof exponentsData.exercises] as any}
                      topicTitle={exponentsData.title}
                      difficulty={selectedDifficulty}
                    />
                  )}
                </div>

                {/* Current Set Info */}
                <Card className="mb-6 border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      <strong>Directions:</strong> {exponentsData.exercises.instructions}
                    </p>
                  </CardContent>
                </Card>

                {/* Practice Items */}
                <div className="space-y-4">
                  {(exponentsData.exercises[selectedDifficulty as keyof typeof exponentsData.exercises] as any)?.map((item: any) => (
                    <Card key={item.id} className="border-border">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <CardTitle className="text-lg">Problem {item.id.replace(/[A-Z]/g, '')}</CardTitle>
                          <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto flex-1 sm:flex-initial">
                            <MathJax>{item.qLatex}</MathJax>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAnswer(item.id)}
                          >
                            {showAnswers[item.id] ? "Hide" : "Show"} Answer
                          </Button>
                        </div>

                        {showAnswers[item.id] && (
                          <div className="mt-4 p-4 bg-chart-7/10 rounded-lg overflow-x-auto">
                            <p className="text-sm font-semibold text-foreground mb-2">Answer:</p>
                            <MathJax>{item.aLatex}</MathJax>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Complete Study Button */}
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-chart-8/5">
                  <CardContent className="pt-8 pb-8 text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                      Finished This Lesson?
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Mark this lesson as complete to track your progress and schedule spaced repetition reviews.
                    </p>
                    <CompleteStudyButton topicTitle={exponentsData.title} centered size="lg" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="py-8">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex justify-center">
                <Link href="/math/exponents">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Exponents Chapter
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </MathJaxContext>
  )
}
