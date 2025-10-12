"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Cylinder as CylinderIcon, Lightbulb, Target, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import cylinderData from "@/data/geometry-cylinder.json"
import { MathJaxContext, MathJax } from 'better-react-mathjax'
import { PrintExercisesButton } from "@/components/print-exercises-button"

export default function CylinderPage() {
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
    easy: cylinderData.exercises.easy || [],
    medium: cylinderData.exercises.medium || [],
    challenge: cylinderData.exercises.challenge || [],
    extreme: cylinderData.exercises.extreme || [],
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
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-chart-10/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <Link href="/math/geometry" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Geometry
              </Link>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                {cylinderData.topic}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                <strong>Audience:</strong> {cylinderData.audience}
              </p>
              <p className="text-base text-muted-foreground">
                {cylinderData.summary}
              </p>
            </div>
          </div>
        </section>

        {/* Concepts Sections */}
        {cylinderData.concepts.map((concept, index) => (
          <section key={index} className={`py-12 sm:py-16 lg:py-20 ${index % 2 === 1 ? 'bg-muted/30' : ''}`}>
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {concept.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {concept.kid_friendly}
                </p>

                {/* Key Terms */}
                {concept.key_terms && concept.key_terms.length > 0 && (
                  <Card className="mb-6 border-chart-10/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-chart-5" />
                        Key Terms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {concept.key_terms.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-10 flex-shrink-0" />
                            <div className="text-sm flex-1">
                              <strong className="text-foreground"><MathJax>{item.term}</MathJax></strong>
                              <span className="text-muted-foreground">: {item.kid_friendly}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Formulas */}
                {concept.latex && (
                  <Card className="mb-6 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Formulas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {concept.latex.volume && (
                        <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <p className="text-sm font-semibold mb-2">Volume:</p>
                          <MathJax>{"$$" + concept.latex.volume + "$$"}</MathJax>
                        </div>
                      )}
                      {concept.latex.surface_area && (
                        <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <p className="text-sm font-semibold mb-2">Surface Area:</p>
                          <MathJax>{"$$" + concept.latex.surface_area + "$$"}</MathJax>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* Worked Example */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-chart-2" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Worked Example</h2>
              </div>

              <Card className="border-chart-2/20">
                <CardHeader>
                  <CardTitle className="text-lg">Example Problem</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Given: r = {cylinderData.worked_example.given.radius_cm} cm, h = {cylinderData.worked_example.given.height_cm} cm, {cylinderData.worked_example.given.pi_used}
                  </p>
                  {cylinderData.worked_example.svg && (
                    <div className="flex justify-center my-4">
                      <div dangerouslySetInnerHTML={{ __html: cylinderData.worked_example.svg }} />
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {cylinderData.worked_example.steps.map((step, stepIdx) => (
                      <div key={stepIdx}>
                        <p className="text-sm font-semibold mb-2 text-foreground">{step.label}:</p>
                        <div className="space-y-2">
                          {step.latex.map((line, lineIdx) => (
                            <div key={lineIdx} className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                              <MathJax>{"$$" + line + "$$"}</MathJax>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 overflow-x-auto mt-6">
                    <p className="text-sm font-semibold mb-2">Answers:</p>
                    <div className="space-y-1 text-sm">
                      <p><MathJax>Volume: {cylinderData.worked_example.answers.volume_symbolic} ≈ {cylinderData.worked_example.answers.volume_numeric}</MathJax></p>
                      <p><MathJax>Surface Area: {cylinderData.worked_example.answers.surface_area_symbolic} ≈ {cylinderData.worked_example.answers.surface_area_numeric}</MathJax></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Practice Problems */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-chart-4" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Practice Problems</h2>
              </div>

              <Card className="mb-6 border-chart-5/20">
                <CardHeader>
                  <CardTitle className="text-base">Instructions</CardTitle>
                  <CardDescription>
                    <MathJax>{cylinderData.exercises.instructions}</MathJax>
                  </CardDescription>
                </CardHeader>
              </Card>

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
                  topicTitle={cylinderData.topic}
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
                      {item.svg && (
                        <div className="flex justify-center my-4">
                          <div dangerouslySetInnerHTML={{ __html: item.svg }} />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        <MathJax>{item.prompt}</MathJax>
                      </p>
                    </CardHeader>
                    {showAnswers[item.id] && (
                      <CardContent>
                        <div className="bg-chart-1/10 rounded-lg p-4 overflow-x-auto">
                          <p className="text-sm font-semibold mb-2">Answer:</p>
                          <div className="text-sm">
                            {typeof item.answer === 'string' ? (
                              <MathJax>{item.answer}</MathJax>
                            ) : (
                              <div className="space-y-2">
                                {Object.entries(item.answer).map(([key, value]) => (
                                  <p key={key}>
                                    <MathJax>
                                      <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong> {value}
                                    </MathJax>
                                  </p>
                                ))}
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
              <Link href="/math/geometry">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Geometry Chapter
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
