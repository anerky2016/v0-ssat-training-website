import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, ArrowLeft, Target, Clock, Brain, AlertCircle } from "lucide-react"
import Link from "next/link"

const tactics = [
  {
    icon: Target,
    title: "Process of Elimination",
    description: "How to narrow down answer choices effectively",
    tips: [
      "Cross out answers you know are wrong immediately",
      "Look for opposite meanings first - they're usually incorrect",
      "If stuck between two choices, consider word connotations",
      "Trust your first instinct if you've studied the vocabulary",
    ],
  },
  {
    icon: Clock,
    title: "Time Management",
    description: "Strategies to complete all questions in 30 minutes",
    tips: [
      "Spend no more than 30 seconds per question",
      "Skip difficult questions and return to them later",
      "Answer easier questions first to build confidence",
      "Leave 2-3 minutes at the end to review marked questions",
    ],
  },
  {
    icon: Brain,
    title: "Analogy Strategies",
    description: "Techniques for solving analogy questions",
    tips: [
      "Create a sentence showing the relationship between the first pair",
      "Apply that same sentence structure to the answer choices",
      "Common relationships: part-to-whole, worker-to-tool, cause-and-effect",
      "Watch for reversed relationships in answer choices",
    ],
  },
  {
    icon: AlertCircle,
    title: "Common Pitfalls",
    description: "Mistakes to avoid during the test",
    tips: [
      "Don't choose answers just because they 'sound good'",
      "Avoid selecting words that are related but not synonyms",
      "Don't spend too much time on one difficult question",
      "Remember: there's a penalty for wrong answers, so guess strategically",
    ],
  },
]

const vocabularyTips = [
  {
    title: "Root Words & Prefixes",
    content:
      "Learn common Latin and Greek roots. For example, 'bene-' means good (benevolent), 'mal-' means bad (malicious).",
  },
  {
    title: "Context Clues",
    content:
      "Even if you don't know a word, use the structure of the question to infer meaning. Look at word parts and related words you do know.",
  },
  {
    title: "Word Associations",
    content:
      "Create mental connections between new words and words you already know. Use mnemonics and visual imagery to remember definitions.",
  },
  {
    title: "Daily Practice",
    content:
      "Learn 10-15 new words every day. Use flashcards, read challenging books, and practice using new words in sentences.",
  },
]

export default function VerbalTacticsPage() {
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
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                  Verbal Test Tactics
                </h1>
                <p className="text-lg text-muted-foreground">
                  Master these strategies to maximize your score on the Verbal section.
                </p>
              </div>

              <div className="space-y-6 mb-12">
                {tactics.map((tactic) => (
                  <Card key={tactic.title} className="border-border bg-card">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3 flex-shrink-0">
                          <tactic.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-1">{tactic.title}</CardTitle>
                          <CardDescription>{tactic.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tactic.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-3 flex-shrink-0" />
                            <span className="leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
                  Vocabulary Building Strategies
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {vocabularyTips.map((tip) => (
                    <Card key={tip.title} className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="text-lg">{tip.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">{tip.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="border-chart-3 bg-chart-3/5">
                <CardHeader>
                  <CardTitle>Pro Tip: Guessing Strategy</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  <p className="mb-3">
                    The SSAT has a guessing penalty: you lose 1/4 point for each wrong answer. However, if you can
                    eliminate even one answer choice, it becomes statistically advantageous to guess.
                  </p>
                  <p>
                    <strong>Rule of thumb:</strong> If you can eliminate 1-2 answer choices, make an educated guess. If
                    you have no idea, it's better to leave it blank.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
