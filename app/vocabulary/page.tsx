import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, ListChecks, Sparkles, Award } from "lucide-react"
import Link from "next/link"
import { generateMetadata as genMeta, seoKeywords } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = genMeta({
  title: 'SSAT Vocabulary Builder - Word Lists & Flashcards',
  description: 'Build your SSAT vocabulary with curated word lists, interactive flashcards, and themed vocabulary exercises.',
  path: '/vocabulary',
  keywords: [...seoKeywords.general, ...seoKeywords.verbal, 'vocabulary builder', 'word lists', 'flashcards', 'vocabulary practice'],
})

export default function VocabularyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-chart-5/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-5/10 text-chart-5">
                <BookOpen className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
                Vocabulary Builder
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground text-pretty leading-relaxed">
                Expand your vocabulary with curated word lists, interactive flashcards, and targeted practice.
              </p>
            </div>
          </div>
        </section>

        {/* Content Categories */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
              <Link href="/vocabulary/word-lists">
                <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-5/10 text-chart-5">
                      <ListChecks className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">Word Lists</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Curated vocabulary lists organized by theme and difficulty
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-5 flex-shrink-0" />
                        <span>SSAT vocabulary words</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-5 flex-shrink-0" />
                        <span>Pronunciation guides</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-5 flex-shrink-0" />
                        <span>Etymology & usage notes</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/vocabulary/flashcards">
                <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-7/10 text-chart-7">
                      <Brain className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">Flashcards</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Interactive flashcards for active vocabulary learning
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-7 flex-shrink-0" />
                        <span>Flip-card interface</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-7 flex-shrink-0" />
                        <span>Track your progress</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-7 flex-shrink-0" />
                        <span>Spaced repetition</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/vocabulary/quiz">
                <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1">
                      <Award className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">Vocabulary Quiz</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Test your knowledge with interactive quizzes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-1 flex-shrink-0" />
                        <span>Synonyms & antonyms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-1 flex-shrink-0" />
                        <span>Word analogies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-1 flex-shrink-0" />
                        <span>Instant feedback</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/verbal/exercises">
                <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">Practice Tests</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Full-length SSAT verbal practice tests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                        <span>Timed practice</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                        <span>Test-like format</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                        <span>Detailed results</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-6">
                Build a Strong Vocabulary Foundation
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  A strong vocabulary is essential for success on the SSAT. Our vocabulary builder helps you systematically
                  learn and retain the words you need to excel on test day.
                </p>
                <div className="grid gap-6 sm:grid-cols-2 mt-6">
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Curated Word Lists</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                      Our word lists are carefully selected based on SSAT frequency and difficulty level. Each word includes
                      definition, part of speech, and example sentences to help you understand usage in context.
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Active Learning Methods</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                      Use flashcards for spaced repetition, practice with synonyms and analogies, and track your progress.
                      Active engagement with vocabulary ensures long-term retention and deep understanding.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
