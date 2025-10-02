import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

const tests = [
  {
    id: 1,
    title: "Practice Test 1",
    questions: 25,
    duration: 30,
    difficulty: "Mixed",
    description: "Comprehensive test covering all math topics",
  },
  {
    id: 2,
    title: "Practice Test 2",
    questions: 25,
    duration: 30,
    difficulty: "Mixed",
    description: "Full-length practice with varied difficulty",
  },
  {
    id: 3,
    title: "Arithmetic Focus Test",
    questions: 20,
    duration: 25,
    difficulty: "Easy to Medium",
    description: "Focused on fractions, decimals, and percentages",
  },
  {
    id: 4,
    title: "Algebra & Geometry Test",
    questions: 20,
    duration: 25,
    difficulty: "Medium to Hard",
    description: "Advanced problems in algebra and geometry",
  },
  {
    id: 5,
    title: "Challenge Test",
    questions: 30,
    duration: 35,
    difficulty: "Hard",
    description: "Difficult problems for advanced students",
  },
]

export default function TestsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <Link
            href="/math"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Math
          </Link>

          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 text-balance">
              Practice Tests
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed">
              Full-length timed tests that simulate the actual SSAT Quantitative section.
            </p>
          </div>

          <div className="space-y-4">
            {tests.map((test) => (
              <Card key={test.id} className="border-border bg-card">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{test.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{test.description}</CardDescription>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full whitespace-nowrap self-start ${
                        test.difficulty === "Easy to Medium"
                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                          : test.difficulty === "Medium to Hard"
                            ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                            : test.difficulty === "Hard"
                              ? "bg-red-500/10 text-red-700 dark:text-red-400"
                              : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {test.difficulty}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{test.questions} questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{test.duration} minutes</span>
                      </div>
                    </div>
                    <Button className="w-full sm:w-auto">
                      Start Test
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Test-Taking Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="leading-relaxed">Find a quiet place free from distractions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="leading-relaxed">Use a timer to simulate real test conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="leading-relaxed">Have scratch paper and pencils ready</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="leading-relaxed">Review your answers if time permits</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
