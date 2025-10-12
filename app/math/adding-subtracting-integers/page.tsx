"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lightbulb, Target, Sparkles, Info } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import integersData from "@/data/adding-subtracting-integers.json"
import { MathJaxContext, MathJax } from 'better-react-mathjax'
import { PrintExercisesButton } from "@/components/print-exercises-button"

export default function AddingSubtractingIntegersPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy")
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

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

  const exercisesByDifficulty = {
    easy: integersData.exercises.easy || [],
    medium: integersData.exercises.medium || [],
    challenge: integersData.exercises.challenge || [],
    extreme: integersData.exercises.extreme || [],
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
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-chart-6/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <Link href="/math" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Math Topics
              </Link>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                {integersData.topic}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                <strong>Audience:</strong> {integersData.audience}
              </p>
              <p className="text-base text-muted-foreground">
                {integersData.summary}
              </p>
            </div>
          </div>
        </section>

        {/* Concepts Sections */}
        {integersData.concepts.map((concept, index) => (
          <section key={index} className={`py-12 sm:py-16 lg:py-20 ${index % 2 === 1 ? 'bg-muted/30' : ''}`}>
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {concept.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {concept.kid_friendly}
                </p>

                {/* LaTeX Example */}
                {concept.latex_example && (
                  <Card className="mb-6 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Example</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                        <MathJax>{"$$" + concept.latex_example + "$$"}</MathJax>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* Teaching Tips */}
        {integersData.teaching_tips && integersData.teaching_tips.length > 0 && (
          <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-chart-5/10 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-chart-5" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Teaching Tips</h2>
                </div>
                <Card className="border-chart-5/20">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {integersData.teaching_tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Worked Examples */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-chart-2" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Worked Examples</h2>
              </div>

              <div className="space-y-4">
                {integersData.worked_examples.map((example, idx) => (
                  <Card key={idx} className="border-chart-2/20">
                    <CardHeader>
                      <CardTitle className="text-lg">{example.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Steps */}
                        {example.steps && example.steps.length > 0 && (
                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm font-semibold mb-3">Steps:</p>
                            <ol className="space-y-2 list-decimal list-inside">
                              {example.steps.map((step, stepIdx) => (
                                <li key={stepIdx} className="text-sm text-muted-foreground">
                                  <MathJax inline>{step}</MathJax>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* LaTeX Answer */}
                        {example.latex && (
                          <div className="bg-primary/10 rounded-lg p-4 overflow-x-auto">
                            <p className="text-sm font-semibold mb-2">Answer:</p>
                            <MathJax>{"$$" + example.latex + "$$"}</MathJax>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Practice Problems */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-chart-4" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Practice Problems</h2>
              </div>

              {/* Difficulty Selector and Print Button */}
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.keys(exercisesByDifficulty).map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? "default" : "outline"}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className="capitalize"
                  >
                    {difficulty}
                  </Button>
                ))}
                <PrintExercisesButton
                  exercises={exercisesByDifficulty[selectedDifficulty as keyof typeof exercisesByDifficulty]}
                  topicTitle={integersData.topic}
                  difficulty={selectedDifficulty}
                />
              </div>

              {/* Practice Items */}
              <div className="space-y-4">
                {exercisesByDifficulty[selectedDifficulty as keyof typeof exercisesByDifficulty].map((item) => (
                  <Card key={item.id} className="border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Problem {item.id}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAnswer(item.id)}
                        >
                          {showAnswers[item.id] ? "Hide" : "Show"} Answer
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        <MathJax>{item.prompt}</MathJax>
                      </div>
                    </CardHeader>
                    {showAnswers[item.id] && (
                      <CardContent>
                        <div className="bg-chart-1/10 rounded-lg p-4 overflow-x-auto">
                          <p className="text-sm font-semibold mb-2">Answer:</p>
                          <div className="text-sm space-y-2">
                            <MathJax>{item.answer}</MathJax>
                            {item.explain && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-sm font-semibold mb-1">Explanation:</p>
                                <p className="text-sm text-muted-foreground">
                                  <MathJax>{item.explain}</MathJax>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex justify-center">
              <Link href="/math">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Math Topics
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
