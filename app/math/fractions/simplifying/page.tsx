"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Lightbulb, Target, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import simplifyingData from "@/data/fractions-simplifying.json"
import { PrintExercisesButton } from "@/components/print-exercises-button"
import { CompleteStudyButton } from "@/components/complete-study-button"

export default function SimplifyingFractionsPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy")
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({})
  const [showSteps, setShowSteps] = useState<Record<string, boolean>>({})

  const currentSet = simplifyingData.practice.sets.find(set => set.difficulty === selectedDifficulty)

  const toggleAnswer = (id: string) => {
    setShowAnswer(prev => {
      const newState = { ...prev, [id]: !prev[id] }

      // Dispatch custom event when answer is revealed for tracking
      if (newState[id] && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('answer-revealed'))
      }

      return newState
    })
  }

  const toggleSteps = (id: string) => {
    setShowSteps(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-4 sm:py-6 lg:py-8 bg-gradient-to-b from-chart-1/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <Link href="/math/fractions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Fractions
              </Link>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                {simplifyingData.topic}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {simplifyingData.kid_friendly_explainer.what}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {simplifyingData.learning_goals.map((goal, index) => (
                  <div key={index} className="px-3 py-1 bg-chart-1/10 text-chart-1 rounded-full text-sm">
                    {goal}
                  </div>
                ))}
              </div>
              <CompleteStudyButton category="math" topicTitle={simplifyingData.topic} />
            </div>
          </div>
        </section>

        {/* Why Learn This */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-chart-2" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Why Learn This?</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {simplifyingData.kid_friendly_explainer.why.map((reason, index) => (
                  <Card key={index} className="border-chart-2/20">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground leading-relaxed">{reason}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Vocabulary */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-chart-3" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Key Vocabulary</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(simplifyingData.vocabulary).map(([term, definition]) => (
                  <Card key={term}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-primary">{term.replace(/_/g, ' ').toUpperCase()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{definition}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How To Steps */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-chart-4" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">How to Simplify</h2>
              </div>
              <Card className="border-chart-4/20">
                <CardContent className="pt-6">
                  <ol className="space-y-4">
                    {simplifyingData.how_to_steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-chart-4 font-bold text-sm">{index + 1}</span>
                        </div>
                        <p className="text-muted-foreground pt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tips & Tricks */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-chart-5/10 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-chart-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Pro Tips</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {simplifyingData.tips.map((tip, index) => (
                  <Card key={index} className="border-chart-5/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-chart-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{tip}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Fun Examples */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Real-World Examples</h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {simplifyingData.fun_examples.map((example, index) => (
                  <Card key={index} className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">{example.context}</CardTitle>
                      <CardDescription className="text-2xl font-bold text-primary">{example.given}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{example.explain}</p>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        {example.work.map((step, idx) => (
                          <p key={idx} className="text-xs font-mono text-muted-foreground">{step}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Common Misconceptions */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Common Mistakes to Avoid</h2>
              </div>
              <div className="space-y-3">
                {simplifyingData.common_misconceptions.map((misconception, index) => (
                  <Card key={index} className="border-destructive/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{misconception}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Practice Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Practice Problems</h2>
              <p className="text-muted-foreground mb-6">{simplifyingData.practice.instructions}</p>

              {/* Difficulty Selector and Print Button */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                {simplifyingData.practice.sets.map((set) => (
                  <Button
                    key={set.difficulty}
                    variant={selectedDifficulty === set.difficulty ? "default" : "outline"}
                    onClick={() => setSelectedDifficulty(set.difficulty)}
                    className="capitalize"
                  >
                    {set.difficulty}
                  </Button>
                ))}
                {currentSet && (
                  <PrintExercisesButton
                    exercises={currentSet.items}
                    topicTitle={simplifyingData.topic}
                    difficulty={selectedDifficulty}
                  />
                )}
              </div>

              {/* Current Set Info */}
              {currentSet && (
                <>
                  <Card className="mb-6 border-primary/20">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        <strong>Focus:</strong> {currentSet.skills_focus}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Practice Items */}
                  <div className="space-y-4">
                    {currentSet.items.map((item) => (
                      <Card key={item.id} className="border-border">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Problem {item.id}</CardTitle>
                            <div className="text-2xl font-bold text-primary">{item.prompt}</div>
                          </div>
                          {'hint' in item && (
                            <CardDescription className="text-sm text-muted-foreground italic">
                              💡 {item.hint}
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
                              {showAnswer[item.id] ? "Hide" : "Show"} Answer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSteps(item.id)}
                            >
                              {showSteps[item.id] ? "Hide" : "Show"} Steps
                            </Button>
                          </div>

                          {showAnswer[item.id] && (
                            <div className="mt-4 p-4 bg-chart-1/10 rounded-lg">
                              <p className="text-sm font-semibold text-foreground">
                                Answer: {typeof item.answer === 'string' ? item.answer : `${item.answer.improper_simplified} or ${item.answer.mixed_number}`}
                              </p>
                            </div>
                          )}

                          {showSteps[item.id] && (
                            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                              <p className="text-sm font-semibold text-foreground mb-2">Solution Steps:</p>
                              {item.steps.map((step, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground font-mono">
                                  {idx + 1}. {step}
                                </p>
                              ))}
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

        {/* Extensions */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Challenge Yourself</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {simplifyingData.extensions.map((extension, index) => (
                  <Card key={index} className="border-chart-1/20">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">{extension}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Complete Study Button */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
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
                  <CompleteStudyButton category="math" topicTitle={simplifyingData.topic} centered size="lg" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex justify-center">
              <Link href="/math/fractions">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Fractions Chapter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
