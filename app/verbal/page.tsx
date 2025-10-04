import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookText, Target, FileCheck, Lightbulb } from "lucide-react"
import Link from "next/link"
import { generateMetadata as genMeta, seoKeywords } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = genMeta({
  title: 'SSAT Verbal Training - Synonyms & Analogies Practice',
  description: 'Master SSAT verbal reasoning with practice exercises for synonyms and analogies, full-length timed tests, and proven test-taking strategies.',
  path: '/verbal',
  keywords: [...seoKeywords.general, ...seoKeywords.verbal],
})

export default function VerbalPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-chart-1/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-1/10 text-chart-1">
                <BookText className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
                Verbal Section
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground text-pretty leading-relaxed">
                Master synonyms, analogies, and vocabulary to excel in the SSAT Verbal section.
              </p>
            </div>
          </div>
        </section>

        {/* Content Categories */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
              <Link href="/verbal/exercises">
                <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1">
                      <Target className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">Practice Exercises</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Targeted practice questions for synonyms and analogies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-1 flex-shrink-0" />
                        <span>60 synonym questions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-1 flex-shrink-0" />
                        <span>30 analogy questions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-1 flex-shrink-0" />
                        <span>Instant feedback</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/verbal/tests">
                <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10 text-chart-2">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">Practice Tests</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Full-length timed practice tests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                        <span>5 complete practice tests</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                        <span>30-minute timed sections</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                        <span>Detailed score reports</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/verbal/tactics">
                <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
                      <Lightbulb className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">Test Tactics</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Strategies and tips to maximize your score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-3 flex-shrink-0" />
                        <span>Elimination techniques</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-3 flex-shrink-0" />
                        <span>Time management tips</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-3 flex-shrink-0" />
                        <span>Common pitfalls to avoid</span>
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
                About the Verbal Section
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The SSAT Verbal section consists of 60 questions that test your vocabulary and verbal reasoning
                  skills. You'll have 30 minutes to complete this section, which includes two types of questions:
                </p>
                <div className="grid gap-6 sm:grid-cols-2 mt-6">
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Synonyms (30 questions)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                      Choose the word that is closest in meaning to the given word. These questions test your vocabulary
                      knowledge and ability to understand word relationships.
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Analogies (30 questions)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                      Identify the relationship between two words and find another pair with the same relationship.
                      These test logical thinking and vocabulary.
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
