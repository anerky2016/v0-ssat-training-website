"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lightbulb, Target, Sparkles, BookOpen, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import combiningData from "@/data/combining-like-terms.json"
import { MathJaxContext, MathJax } from 'better-react-mathjax'
import { PrintExercisesButton } from "@/components/print-exercises-button"
import { CompleteStudyButton } from "@/components/complete-study-button"

export default function CombiningLikeTermsPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy")
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

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

  if (!mounted) {
    return null
  }

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="min-h-screen">
        <Header />
        <main>
          {/* Hero Section */}
          <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-chart-8/5 to-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <Link href="/math/expressions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Expressions Chapter
                </Link>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                  {combiningData.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  <strong>Audience:</strong> {combiningData.audience}
                </p>
                <CompleteStudyButton topicTitle={combiningData.title} />
              </div>
            </div>
          </section>

          {/* Kid-Friendly Definition */}
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-chart-2" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Understanding Like Terms</h2>
                </div>
                <Card className="border-chart-2/20 mb-6">
                  <CardContent className="pt-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      <MathJax>{combiningData.concept.kid_friendly_def}</MathJax>
                    </p>
                  </CardContent>
                </Card>

                {/* Rule Summary */}
                <div className="grid gap-4">
                  {combiningData.concept.rule_summary.map((rule, index) => (
                    <Card key={index} className="border-chart-2/20">
                      <CardContent className="pt-6">
                        <p className="text-base text-muted-foreground leading-relaxed">
                          <MathJax>{rule}</MathJax>
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Distributive Connection */}
                <Card className="border-chart-2/20 mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">Important Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                      <MathJax>{combiningData.concept.distributive_connection}</MathJax>
                    </div>
                  </CardContent>
                </Card>

                {/* Kid Tip */}
                <Card className="border-chart-2/20 mt-6 bg-chart-2/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-chart-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        <strong>Pro Tip:</strong> <MathJax>{combiningData.concept.kid_tip}</MathJax>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Worked Examples */}
          <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-chart-4" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Worked Examples</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {combiningData.concept.worked_examples.map((example, index) => (
                    <Card key={index} className="border-chart-4/20">
                      <CardHeader>
                        <CardTitle className="text-lg">{example.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {example.steps.map((step, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground">
                              <MathJax>{step}</MathJax>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Common Mistakes */}
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-chart-1" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Common Mistakes to Avoid</h2>
                </div>
                <div className="grid gap-4">
                  {combiningData.concept.common_mistakes.map((mistake, index) => (
                    <Card key={index} className="border-chart-1/20 bg-chart-1/5">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-chart-1 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            <MathJax>{mistake}</MathJax>
                          </p>
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
                  Master combining like terms with practice problems at different difficulty levels.
                </p>

                {/* Difficulty Selector and Print Button */}
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  {Object.keys(combiningData.exercises).map((difficulty) => (
                    <Button
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? "default" : "outline"}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className="capitalize"
                    >
                      {difficulty}
                    </Button>
                  ))}
                  {combiningData.exercises[selectedDifficulty as keyof typeof combiningData.exercises] && (
                    <PrintExercisesButton
                      exercises={combiningData.exercises[selectedDifficulty as keyof typeof combiningData.exercises].problems}
                      topicTitle={combiningData.title}
                      difficulty={selectedDifficulty}
                    />
                  )}
                </div>

                {/* Current Set Info */}
                {combiningData.exercises[selectedDifficulty as keyof typeof combiningData.exercises] && (
                  <>
                    <Card className="mb-6 border-primary/20">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                          <strong>Directions:</strong> <MathJax>{combiningData.exercises[selectedDifficulty as keyof typeof combiningData.exercises].instructions}</MathJax>
                        </p>
                      </CardContent>
                    </Card>

                    {/* Practice Items */}
                    <div className="space-y-4">
                      {combiningData.exercises[selectedDifficulty as keyof typeof combiningData.exercises].problems.map((problem) => (
                        <Card key={problem.id} className="border-border">
                          <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <CardTitle className="text-lg">Problem {problem.id}</CardTitle>
                              <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto flex-1 sm:flex-initial">
                                <MathJax>{problem.question_latex}</MathJax>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAnswer(problem.id)}
                              >
                                {showAnswers[problem.id] ? "Hide" : "Show"} Answer
                              </Button>
                            </div>

                            {showAnswers[problem.id] && (
                              <div className="mt-4 space-y-3">
                                <div className="p-4 bg-chart-8/10 rounded-lg overflow-x-auto">
                                  <p className="text-sm font-semibold text-foreground mb-2">Answer:</p>
                                  <MathJax>{problem.answer_latex}</MathJax>
                                </div>
                                {problem.solution_steps && problem.solution_steps.length > 0 && (
                                  <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-semibold text-foreground mb-2">Solution Steps:</p>
                                    <ul className="space-y-2">
                                      {problem.solution_steps.map((step, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                          <span className="font-semibold text-primary">{idx + 1}.</span>
                                          <span><MathJax>{step}</MathJax></span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex justify-center">
                <Link href="/math/expressions">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Expressions Chapter
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
