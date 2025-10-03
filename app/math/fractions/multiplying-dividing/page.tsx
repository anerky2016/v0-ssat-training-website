"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Lightbulb, Target, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import fractionsData from "@/data/fractions-multiplying-dividing.json"
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

export default function MultiplyingDividingFractionsPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy")
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleAnswer = (id: string) => {
    setShowAnswers(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const practiceByDifficulty = {
    easy: fractionsData.practice.filter(p => p.difficulty === "easy"),
    medium: fractionsData.practice.filter(p => p.difficulty === "medium"),
    challenge: fractionsData.practice.filter(p => p.difficulty === "challenge"),
    extreme: fractionsData.practice.filter(p => p.difficulty === "extreme"),
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-chart-1/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <Link href="/math/fractions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Fractions
              </Link>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                {fractionsData.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                <strong>Audience:</strong> {fractionsData.audience}
              </p>
              <p className="text-base text-muted-foreground">
                {fractionsData.summary}
              </p>
            </div>
          </div>
        </section>

        {/* Main Sections */}
        {fractionsData.sections.map((section, index) => (
          <section key={section.id} className={`py-12 sm:py-16 lg:py-20 ${index % 2 === 1 ? 'bg-muted/30' : ''}`}>
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {section.heading}
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {section.kid_friendly_explanation}
                </p>

                {/* Key Formulas */}
                {section.key_formulas_latex && section.key_formulas_latex.length > 0 && (
                  <Card className="mb-6 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Key Formulas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {section.key_formulas_latex.map((formula, idx) => (
                        <div key={idx} className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <BlockMath math={formula} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Example */}
                {section.example && (
                  <Card className="mb-6 border-chart-1/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Example</CardTitle>
                      <CardDescription>{section.example.story}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {section.example.work_latex && (
                        <div className="bg-muted/50 rounded-lg p-4 mb-3 overflow-x-auto">
                          <BlockMath math={section.example.work_latex} />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground italic">
                        {section.example.explanation}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Tips */}
                {section.tips && section.tips.length > 0 && (
                  <Card className="border-chart-5/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-chart-5" />
                        Pro Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* Worked Examples */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-chart-2" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Worked Examples</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {fractionsData.worked_examples.map((example) => (
                  <Card key={example.id} className="border-chart-2/20">
                    <CardHeader>
                      <CardTitle className="text-lg">{example.title}</CardTitle>
                      <div className="bg-muted/50 rounded-lg p-4 mt-2 overflow-x-auto">
                        <BlockMath math={example.problem_latex} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {example.solution_steps.map((step, idx) => (
                          <div key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="flex-shrink-0">{idx + 1}.</span>
                            {step.includes('\\') ? (
                              <div className="overflow-x-auto">
                                <InlineMath math={step} />
                              </div>
                            ) : (
                              <span>{step}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4 overflow-x-auto">
                        <p className="text-sm font-semibold mb-2">Answer:</p>
                        <BlockMath math={example.answer_latex} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Vocabulary */}
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
                {fractionsData.vocabulary.map((item) => (
                  <Card key={item.term}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-primary">{item.term}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.kid_friendly_definition}</p>
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

              {/* Difficulty Selector */}
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
                      <div className="bg-muted/50 rounded-lg p-4 mt-2 overflow-x-auto">
                        <BlockMath math={item.problem_latex} />
                      </div>
                    </CardHeader>
                    {showAnswers[item.id] && (
                      <CardContent>
                        <div className="bg-chart-1/10 rounded-lg p-4 overflow-x-auto">
                          <p className="text-sm font-semibold mb-2">Answer:</p>
                          <BlockMath math={item.answer_latex} />
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
