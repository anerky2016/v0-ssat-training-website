import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, BookOpen, FileCheck, Lightbulb, ArrowRight } from "lucide-react"
import Link from "next/link"
import { generateMetadata as genMeta, seoKeywords } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = genMeta({
  title: 'SSAT Math Training - Quantitative Section Practice',
  description: 'Master the SSAT Quantitative section with comprehensive math exercises, full-length practice tests, and proven test-taking strategies for middle level students.',
  path: '/math',
  keywords: [...seoKeywords.general, ...seoKeywords.math],
})

export default function MathPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-2/10">
                <Calculator className="h-8 w-8 text-chart-2" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
                SSAT Math Training
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed">
                Master the Quantitative section with comprehensive exercises, practice tests, and proven tactics.
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/10">
                    <BookOpen className="h-6 w-6 text-chart-1" />
                  </div>
                  <CardTitle className="text-xl">Exercises</CardTitle>
                  <CardDescription>Practice problems by topic</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Hundreds of practice problems organized by difficulty level with detailed explanations.
                  </p>
                  <Link href="/math/exercises">
                    <Button className="w-full">
                      Start Practicing
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10">
                    <FileCheck className="h-6 w-6 text-chart-2" />
                  </div>
                  <CardTitle className="text-xl">Tests</CardTitle>
                  <CardDescription>Full-length practice tests</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Timed practice tests that simulate the actual SSAT Quantitative section experience.
                  </p>
                  <Link href="/math/tests">
                    <Button className="w-full">
                      Take a Test
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10">
                    <Lightbulb className="h-6 w-6 text-chart-3" />
                  </div>
                  <CardTitle className="text-xl">Tactics</CardTitle>
                  <CardDescription>Test-taking strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Learn proven strategies and shortcuts to maximize your score and save time.
                  </p>
                  <Link href="/math/tactics">
                    <Button className="w-full">
                      Learn Tactics
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
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
