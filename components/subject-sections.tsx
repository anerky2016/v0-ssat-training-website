import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, BookOpen, Brain } from "lucide-react"
import Link from "next/link"

const subjects = [
  {
    icon: Calculator,
    title: "Math",
    description: "Master all 11 chapters with comprehensive practice",
    features: [
      "500+ practice questions",
      "Step-by-step solutions",
      "Interactive exercises",
      "Full-length practice tests",
    ],
    color: "bg-chart-1/10 text-chart-1",
    href: "#math-chapters",
  },
  {
    icon: BookOpen,
    title: "Verbal",
    description: "Excel in synonyms and analogies with targeted practice",
    features: [
      "60 synonym questions",
      "30 analogy questions",
      "Test-taking strategies",
      "Timed practice tests",
    ],
    color: "bg-chart-3/10 text-chart-3",
    href: "/verbal",
  },
  {
    icon: Brain,
    title: "Vocabulary",
    description: "Build a strong vocabulary foundation with curated word lists",
    features: [
      "500+ essential words",
      "Interactive flashcards",
      "Organized by themes",
      "Spaced repetition",
    ],
    color: "bg-chart-5/10 text-chart-5",
    href: "/vocabulary",
  },
]

export function SubjectSections() {
  return (
    <section id="sections" className="py-12 sm:py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3 sm:mb-4 text-balance">
            Complete SSAT Test Preparation
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed px-4 sm:px-0">
            Everything you need to excel in all sections of the SSAT exam
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto mb-8">
          {subjects.map((subject) => (
            <Card key={subject.title} className="border-border bg-card flex flex-col">
              <CardHeader className="pb-4">
                <div
                  className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${subject.color}`}
                >
                  <subject.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl text-card-foreground">{subject.title}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">{subject.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {subject.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={subject.href}>
                  <Button className="w-full text-sm">
                    Start Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
