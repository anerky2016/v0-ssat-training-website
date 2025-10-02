import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Percent, ArrowLeft, BookOpen, Target, Zap } from "lucide-react"
import Link from "next/link"

export default function RatiosPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-chart-5/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-5/10 text-chart-5">
                <Percent className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
                Chapter 5: Ratios
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground text-pretty leading-relaxed">
                Understand proportional relationships
              </p>
            </div>
          </div>
        </section>

        {/* Sub-topics Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-foreground">
                🎯 What You'll Master
              </h2>
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  "Simplifying Ratios",
                  "Proportional Ratios",
                  "Creating Proportions",
                  "Similarity & Ratios",
                  "Simple Interest"
                ].map((topic, index) => (
                  <Card key={topic} className="border-border bg-card hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-chart-5/10 flex items-center justify-center">
                          <span className="text-chart-5 font-bold text-sm">{index + 1}</span>
                        </div>
                        <CardTitle className="text-lg text-card-foreground">
                          {topic}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        Practice problems and step-by-step solutions
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Content Categories */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
              <Link href="/math/ratios/exercises">
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer h-full">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-5/10 text-chart-5">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">🎯 Practice Exercises</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Fun ratios problems with instant feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-5 flex-shrink-0" />
                        <span>Step-by-step solutions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-5 flex-shrink-0" />
                        <span>Multiple difficulty levels</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-5 flex-shrink-0" />
                        <span>Detailed explanations</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/math/ratios/tactics">
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer h-full">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10 text-chart-2">
                      <Target className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">⚡ Ratios Tactics</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Super strategies for ratios mastery
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                        <span>Proven problem-solving methods</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                        <span>Time-saving shortcuts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                        <span>Common mistake avoiders</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/math/ratios/tests">
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer h-full">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
                      <Zap className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">🚀 Practice Tests</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Test your ratios skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-3 flex-shrink-0" />
                        <span>Timed challenges</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-3 flex-shrink-0" />
                        <span>Mixed difficulty levels</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-3 flex-shrink-0" />
                        <span>Detailed score reports</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Back to Math */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex justify-center">
              <Link href="/math">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Math Topics
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