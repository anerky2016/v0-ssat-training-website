import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCheck, Clock, ArrowLeft, Play } from "lucide-react"
import Link from "next/link"

const practiceTests = [
  {
    id: 1,
    title: "Practice Test 1",
    questions: 60,
    timeLimit: 30,
    difficulty: "Medium",
    description: "A comprehensive practice test covering all verbal question types.",
  },
  {
    id: 2,
    title: "Practice Test 2",
    questions: 60,
    timeLimit: 30,
    difficulty: "Medium",
    description: "Focus on advanced vocabulary and complex analogies.",
  },
  {
    id: 3,
    title: "Practice Test 3",
    questions: 60,
    timeLimit: 30,
    difficulty: "Hard",
    description: "Challenge yourself with difficult synonyms and tricky analogies.",
  },
  {
    id: 4,
    title: "Practice Test 4",
    questions: 60,
    timeLimit: 30,
    difficulty: "Medium",
    description: "Mixed difficulty level to simulate actual test conditions.",
  },
  {
    id: 5,
    title: "Practice Test 5",
    questions: 60,
    timeLimit: 30,
    difficulty: "Hard",
    description: "Final practice test with the most challenging questions.",
  },
]

export default function VerbalTestsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <Link
                href="/verbal"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Verbal
              </Link>

              <div className="mb-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10 text-chart-2">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                  Verbal Practice Tests
                </h1>
                <p className="text-lg text-muted-foreground">
                  Take full-length timed practice tests to prepare for the actual SSAT.
                </p>
              </div>

              <Card className="mb-8 border-chart-2 bg-chart-2/5">
                <CardHeader>
                  <CardTitle>Test Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                      <span>60 questions total (30 synonyms + 30 analogies)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                      <span>30 minutes time limit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                      <span>Detailed score report with explanations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {practiceTests.map((test) => (
                  <Card key={test.id} className="border-border bg-card hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2">{test.title}</CardTitle>
                          <CardDescription>{test.description}</CardDescription>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            test.difficulty === "Hard" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {test.difficulty}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4" />
                          <span>{test.questions} questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{test.timeLimit} minutes</span>
                        </div>
                      </div>
                      <Button className="bg-chart-2 hover:bg-chart-2/90">
                        <Play className="h-4 w-4 mr-2" />
                        Start Test
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
