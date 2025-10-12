"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Lightbulb, Target, Sparkles, Info } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import cubesData from "@/data/geometry-cubes.json"
import { MathJaxContext, MathJax } from 'better-react-mathjax'
import { PrintExercisesButton } from "@/components/print-exercises-button"

export default function CubesPage() {
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

  // Convert grouped practice problems to difficulty-based structure
  const practiceByDifficulty = {
    easy: cubesData.practice.find(p => p.group === "easy")?.items || [],
    medium: cubesData.practice.find(p => p.group === "medium")?.items || [],
    challenge: cubesData.practice.find(p => p.group === "challenge")?.items || [],
    extreme: cubesData.practice.find(p => p.group === "extreme")?.items || [],
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
                {cubesData.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                <strong>Audience:</strong> {cubesData.audience}
              </p>
              <div className="text-base text-muted-foreground">
                <MathJax>{cubesData.summary}</MathJax>
              </div>
            </div>
          </div>
        </section>

        {/* Main Sections */}
        {cubesData.sections.map((section, index) => (
          <section key={section.id} className={`py-12 sm:py-16 lg:py-20 ${index % 2 === 1 ? 'bg-muted/30' : ''}`}>
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {section.heading}
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {section.kid_friendly_explanation}
                </p>

                {/* Bullets */}
                {'bullets' in section && section.bullets && (
                  <Card className="mb-6 border-chart-10/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Key Facts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-10 flex-shrink-0" />
                            <div className="text-sm text-muted-foreground flex-1">
                              <MathJax>{bullet}</MathJax>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Key Formulas */}
                {'key_formulas_latex' in section && section.key_formulas_latex && section.key_formulas_latex.length > 0 && (
                  <Card className="mb-6 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Key Formulas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {section.key_formulas_latex.map((formula, idx) => (
                        <div key={idx} className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <MathJax>{"$$" + formula + "$$"}</MathJax>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Units Tip */}
                {'units_tip' in section && section.units_tip && (
                  <Card className="mb-6 border-chart-5/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-chart-5" />
                        Units Tip
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        <MathJax>{section.units_tip}</MathJax>
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Worked Examples */}
                {'example' in section && section.example && (
                  <Card className="border-chart-2/20 mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Example</CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">{section.example.story}</p>
                      {section.example.svg && (
                        <div className="flex justify-center my-4">
                          <div dangerouslySetInnerHTML={{ __html: section.example.svg }} />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {section.example.work_latex && Array.isArray(section.example.work_latex) ? (
                          section.example.work_latex.map((step, stepIdx) => (
                            <div key={stepIdx} className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                              <MathJax>{"$$" + step + "$$"}</MathJax>
                            </div>
                          ))
                        ) : null}
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4 overflow-x-auto">
                        <p className="text-sm font-semibold mb-2">Answer:</p>
                        <MathJax>{"$$" + section.example.answer_latex + "$$"}</MathJax>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* Vocabulary */}
        {cubesData.vocabulary && cubesData.vocabulary.length > 0 && (
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-chart-3" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Vocabulary</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {cubesData.vocabulary.map((item) => (
                    <Card key={item.term}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-primary">{item.term}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          <MathJax>{item.kid_friendly_definition}</MathJax>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

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
                {Object.keys(practiceByDifficulty).map((difficulty) => (
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
                  exercises={practiceByDifficulty[selectedDifficulty as keyof typeof practiceByDifficulty]}
                  topicTitle={cubesData.title}
                  difficulty={selectedDifficulty}
                />
              </div>

              {/* Practice Items */}
              <div className="space-y-4">
                {practiceByDifficulty[selectedDifficulty as keyof typeof practiceByDifficulty].map((item) => (
                  <Card key={item.id} className="border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Problem {item.id.toUpperCase()}</CardTitle>
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
                      <div className="bg-muted/50 rounded-lg p-4 mt-2 overflow-x-auto">
                        <MathJax>{"$$" + item.problem_latex + "$$"}</MathJax>
                      </div>
                    </CardHeader>
                    {showAnswers[item.id] && (
                      <CardContent>
                        <div className="bg-chart-1/10 rounded-lg p-4 overflow-x-auto">
                          <p className="text-sm font-semibold mb-2">Answer:</p>
                          <MathJax>{"$$" + item.answer_latex + "$$"}</MathJax>
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
