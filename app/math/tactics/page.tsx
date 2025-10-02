import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Target, Zap, Brain, CheckCircle2, Calculator } from "lucide-react"
import Link from "next/link"

const tactics = [
  {
    icon: Clock,
    title: "Time Management",
    strategies: [
      "Spend about 1 minute per question on average",
      "Skip difficult questions and return to them later",
      "Mark questions you're unsure about for review",
      "Save 2-3 minutes at the end to check your work",
    ],
  },
  {
    icon: Target,
    title: "Answer Elimination",
    strategies: [
      "Cross out obviously wrong answers first",
      "Look for answers that are too extreme",
      "Eliminate answers that don't match units or format",
      "If stuck, make an educated guess from remaining options",
    ],
  },
  {
    icon: Zap,
    title: "Quick Calculation Tips",
    strategies: [
      "Round numbers to estimate answers quickly",
      "Use mental math shortcuts for common operations",
      "Check if answer choices are far apart (estimation works)",
      "Plug in answer choices when solving is difficult",
    ],
  },
  {
    icon: Brain,
    title: "Problem-Solving Strategies",
    strategies: [
      "Draw diagrams for geometry and word problems",
      "Write down what you know and what you need to find",
      "Break complex problems into smaller steps",
      "Check if your answer makes logical sense",
    ],
  },
  {
    icon: CheckCircle2,
    title: "Avoiding Common Mistakes",
    strategies: [
      "Read questions carefully - watch for 'NOT' or 'EXCEPT'",
      "Double-check your arithmetic",
      "Make sure you answered what was asked",
      "Watch for unit conversions (inches to feet, etc.)",
    ],
  },
  {
    icon: Calculator,
    title: "Topic-Specific Tips",
    strategies: [
      "Fractions: Find common denominators before adding/subtracting",
      "Percentages: Convert to decimals or fractions",
      "Algebra: Isolate the variable step by step",
      "Geometry: Memorize key formulas (area, perimeter, volume)",
    ],
  },
]

export default function TacticsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <Link
            href="/math"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Math
          </Link>

          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 text-balance">
              Test-Taking Tactics
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed">
              Proven strategies and shortcuts to maximize your score on the SSAT Quantitative section.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {tactics.map((tactic) => (
              <Card key={tactic.title} className="border-border bg-card">
                <CardHeader>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <tactic.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{tactic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tactic.strategies.map((strategy, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="leading-relaxed">{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Remember</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                These tactics are most effective when combined with solid math knowledge. Practice regularly, learn from
                your mistakes, and stay confident during the test.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The SSAT rewards both accuracy and speed, so finding the right balance is key to achieving your best
                score.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
