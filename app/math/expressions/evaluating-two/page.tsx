"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lightbulb, Target, Sparkles, BookOpen } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import evaluatingTwoData from "@/data/evaluating-two-variable.json"
import { MathJaxContext, MathJax } from 'better-react-mathjax'
import { PrintExercisesButton } from "@/components/print-exercises-button"
import { CompleteStudyButton } from "@/components/complete-study-button"

export default function EvaluatingTwoVariablePage() {
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
                <div className="mb-6">
                  <CompleteStudyButton topicTitle={evaluatingTwoData.title} />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                  {evaluatingTwoData.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  <strong>Audience:</strong> {evaluatingTwoData.audience}
                </p>
                <CompleteStudyButton topicTitle={evaluatingTwoData.title} />
              </div>
            </div>
          </section>

          {/* Kid-Friendly Explainer */}
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-chart-2" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Understanding Evaluating Two-Variable Expressions</h2>
                </div>
                <div className="grid gap-4">
                  {evaluatingTwoData.kid_friendly_explainer.map((explanation, index) => (
                    <Card key={index} className="border-chart-2/20">
                      <CardContent className="pt-6">
                        <p className="text-base text-muted-foreground leading-relaxed">
                          <MathJax>{explanation}</MathJax>
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Core Rules */}
          <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-chart-3" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Core Rules</h2>
                </div>
                <div className="grid gap-6">
                  {evaluatingTwoData.core_rules.map((rule, index) => (
                    <Card key={index} className="border-chart-3/20">
                      <CardHeader>
                        <CardTitle className="text-xl text-primary">{rule.name}</CardTitle>
                        <CardDescription className="text-base">{rule.plain_english}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <MathJax>{"\\[" + rule.latex + "\\]"}</MathJax>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Step-by-Step Examples */}
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
                  {evaluatingTwoData.step_by_step_examples.map((example) => (
                    <Card key={example.id} className="border-chart-4/20">
                      <CardHeader>
                        <CardTitle className="text-lg">Example {example.id.replace('ex', '')}</CardTitle>
                        <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <MathJax>{"\\[" + example.problem_latex + "\\]"}</MathJax>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-foreground">Solution:</p>
                          <ol className="space-y-2">
                            {example.walkthrough.map((step, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="font-semibold text-primary">{idx + 1}.</span>
                                <span><MathJax>{step}</MathJax></span>
                              </li>
                            ))}
                          </ol>
                          <div className="bg-chart-4/10 rounded-lg p-4 overflow-x-auto">
                            <MathJax>{"\\[" + example.answer_latex + "\\]"}</MathJax>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Teacher Notes */}
          <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-chart-5/10 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-chart-5" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Pro Tips</h2>
                </div>
                <div className="grid gap-4">
                  {evaluatingTwoData.teacher_notes.map((note, index) => (
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
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Practice Problems</h2>
                <p className="text-muted-foreground mb-6">
                  Master evaluating two-variable expressions with practice problems at different difficulty levels.
                </p>

                {/* Difficulty Selector and Print Button */}
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  {Object.keys(evaluatingTwoData.exercises).map((difficulty) => (
                    <Button
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? "default" : "outline"}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className="capitalize"
                    >
                      {difficulty}
                    </Button>
                  ))}
                  {evaluatingTwoData.exercises[selectedDifficulty as keyof typeof evaluatingTwoData.exercises] && (
                    <PrintExercisesButton
                      exercises={evaluatingTwoData.exercises[selectedDifficulty as keyof typeof evaluatingTwoData.exercises].items}
                      topicTitle={evaluatingTwoData.title}
                      difficulty={selectedDifficulty}
                    />
                  )}
                </div>

                {/* Current Set Info */}
                {evaluatingTwoData.exercises[selectedDifficulty as keyof typeof evaluatingTwoData.exercises] && (
                  <>
                    <Card className="mb-6 border-primary/20">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                          <strong>Directions:</strong> <MathJax>{evaluatingTwoData.exercises[selectedDifficulty as keyof typeof evaluatingTwoData.exercises].directions}</MathJax>
                        </p>
                      </CardContent>
                    </Card>

                    {/* Practice Items */}
                    <div className="space-y-4">
                      {evaluatingTwoData.exercises[selectedDifficulty as keyof typeof evaluatingTwoData.exercises].items.map((item) => (
                        <Card key={item.id} className="border-border">
                          <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <CardTitle className="text-lg">Problem {item.id.replace(/[a-z]/g, '')}</CardTitle>
                              <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto flex-1 sm:flex-initial">
                                <MathJax>{"\\[" + item.question_latex + "\\]"}</MathJax>
                              </div>
                            </div>
                            {item.hint && (
                              <CardDescription className="text-sm text-muted-foreground italic flex items-baseline gap-1">
                                <span>💡</span>
                                <span><MathJax>{item.hint}</MathJax></span>
                              </CardDescription>
                            )}
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
                              <div className="mt-4 p-4 bg-chart-8/10 rounded-lg overflow-x-auto">
                                <p className="text-sm font-semibold text-foreground mb-2">Answer:</p>
                                <MathJax>{"\\[" + item.answer_latex + "\\]"}</MathJax>
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
