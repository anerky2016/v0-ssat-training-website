"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lightbulb, Target, Sparkles, BookOpen } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import exponentsData from "@/data/exponents-division.json"
import { MathJaxContext, MathJax } from 'better-react-mathjax'
import { BucketVisualization } from "@/components/bucket-visualization"
import { NegativeExponentVisualization } from "@/components/negative-exponent-visualization"
import { PrintExercisesButton } from "@/components/print-exercises-button"

export default function ExponentsDivisionPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy")
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleAnswer = (id: string) => {
    setShowAnswers(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (!mounted) {
    return null
  }

  return (
    <MathJaxContext>
      <div className="min-h-screen">
        <Header />
        <main>
          {/* Hero Section */}
          <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-chart-7/5 to-background">
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
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Understanding Division with Exponents</h2>
                </div>
                <div className="grid gap-4">
                  {exponentsData.kid_friendly_explainer.map((explanation, index) => (
                    <Card key={index} className="border-chart-2/20">
                      <CardContent className="pt-6">
                        <p className="text-base text-muted-foreground leading-relaxed">{explanation}</p>
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
                <div className="space-y-12">
                  {/* Rule 1: Same base division with bucket visualization */}
                  <div className="p-6 bg-background/50 rounded-xl border-2 border-primary/20">
                    <Card className="border-chart-3/20 mb-6">
                      <CardHeader>
                        <CardTitle className="text-xl text-primary">{exponentsData.core_rules[0].name}</CardTitle>
                        <CardDescription className="text-base">{exponentsData.core_rules[0].plain_english}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <MathJax>{"\\[" + exponentsData.core_rules[0].latex + "\\]"}</MathJax>
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Interactive Bucket Visualization</h3>
                      <p className="text-muted-foreground mb-6 text-sm">
                        Click "Start" to see how buckets cancel out when dividing powers with the same base.
                      </p>
                      <div className="space-y-6">
                        <div>
                          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <span className="text-muted-foreground">Example 1: More buckets on top</span>
                            <span className="text-red-600 dark:text-red-400 font-bold text-base">
                              <MathJax inline>{"\\(x^5 \\div x^2\\)"}</MathJax>
                            </span>
                          </div>
                          <BucketVisualization numeratorExponent={5} denominatorExponent={2} base="x" />
                        </div>

                        <div>
                          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <span className="text-muted-foreground">Example 2: More buckets on bottom</span>
                            <span className="text-red-600 dark:text-red-400 font-bold text-base">
                              <MathJax inline>{"\\(y^3 \\div y^6\\)"}</MathJax>
                            </span>
                          </div>
                          <BucketVisualization numeratorExponent={3} denominatorExponent={6} base="y" />
                        </div>

                        <div>
                          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <span className="text-muted-foreground">Example 3: Equal buckets - all cancel</span>
                            <span className="text-red-600 dark:text-red-400 font-bold text-base">
                              <MathJax inline>{"\\(a^4 \\div a^4\\)"}</MathJax>
                            </span>
                          </div>
                          <BucketVisualization numeratorExponent={4} denominatorExponent={4} base="a" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rule 2: Negative exponents with bucket visualization */}
                  <div className="p-6 bg-background/50 rounded-xl border-2 border-orange-300 dark:border-orange-700">
                    <Card className="border-orange-300 dark:border-orange-700 mb-6">
                      <CardHeader>
                        <CardTitle className="text-xl text-orange-600 dark:text-orange-400">{exponentsData.core_rules[1].name}</CardTitle>
                        <CardDescription className="text-base">{exponentsData.core_rules[1].plain_english}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <MathJax>{"\\[" + exponentsData.core_rules[1].latex + "\\]"}</MathJax>
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Understanding Negative Exponents with Buckets</h3>
                      <p className="text-muted-foreground mb-6 text-sm">
                        Watch how leftover buckets on the bottom create negative exponents, and why they flip to the denominator.
                      </p>
                      <div className="space-y-6">
                        <div>
                          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <span className="text-muted-foreground">Example: Fewer buckets on top creates negative exponent</span>
                            <span className="text-orange-600 dark:text-orange-400 font-bold text-base">
                              <MathJax inline>{"\\(x^2 \\div x^5\\)"}</MathJax>
                            </span>
                          </div>
                          <NegativeExponentVisualization numeratorExponent={2} denominatorExponent={5} base="x" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rule 3: Alternative form (without visualization) */}
                  <div>
                    <Card className="border-chart-3/20">
                      <CardHeader>
                        <CardTitle className="text-xl text-primary">{exponentsData.core_rules[2].name}</CardTitle>
                        <CardDescription className="text-base">{exponentsData.core_rules[2].plain_english}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <MathJax>{"\\[" + exponentsData.core_rules[2].latex + "\\]"}</MathJax>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step-by-Step Examples */}
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
                  {exponentsData.step_by_step_examples.map((example) => (
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
                                <span>{step}</span>
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
                  {exponentsData.teacher_notes.map((note, index) => (
                    <Card key={index} className="border-chart-5/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-chart-5 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">{note}</p>
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
                  Master division of exponents with practice problems at different difficulty levels.
                </p>

                {/* Difficulty Selector and Print Button */}
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  {Object.keys(exponentsData.exercises).map((difficulty) => (
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
                      exercises={exponentsData.exercises[selectedDifficulty as keyof typeof exponentsData.exercises].items}
                      topicTitle={exponentsData.title}
                      difficulty={selectedDifficulty}
                    />
                  )}
                </div>

                {/* Current Set Info */}
                {exponentsData.exercises[selectedDifficulty as keyof typeof exponentsData.exercises] && (
                  <>
                    <Card className="mb-6 border-primary/20">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                          <strong>Directions:</strong> {exponentsData.exercises[selectedDifficulty as keyof typeof exponentsData.exercises].directions}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Practice Items */}
                    <div className="space-y-4">
                      {exponentsData.exercises[selectedDifficulty as keyof typeof exponentsData.exercises].items.map((item) => (
                        <Card key={item.id} className="border-border">
                          <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <CardTitle className="text-lg">Problem {item.id.replace(/[a-z]/g, '')}</CardTitle>
                              <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto flex-1 sm:flex-initial">
                                <MathJax>{"\\[" + item.question_latex + "\\]"}</MathJax>
                              </div>
                            </div>
                            {item.hint && (
                              <CardDescription className="text-sm text-muted-foreground italic">
                                💡 <MathJax inline>{item.hint}</MathJax>
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
                              <div className="mt-4 p-4 bg-chart-7/10 rounded-lg overflow-x-auto">
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
