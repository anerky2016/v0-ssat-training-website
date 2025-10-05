import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, ArrowLeft, BookOpen, Target, Zap } from "lucide-react"
import Link from "next/link"

export default function FractionsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-chart-1/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-1/10 text-chart-1">
                <Calculator className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
                Chapter 1: Fractions & Mixed Numbers
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground text-pretty leading-relaxed">
                Master fraction operations, mixed numbers, and become a fraction wizard!
              </p>
            </div>
          </div>
        </section>

        {/* Sub-topics Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-foreground">
                What You'll Master
              </h2>
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: "Simplifying Fractions", href: "/math/fractions/simplifying" },
                  { title: "Adding/Subtracting Fractions", href: "/math/fractions/adding-subtracting" },
                  { title: "Multiplying/Dividing Fractions", href: "/math/fractions/multiplying-dividing" },
                  { title: "Adding Mixed Numbers", href: "/math/fractions/mixed-numbers-add-sub" },
                  { title: "Subtract Mixed Numbers", href: "/math/fractions/mixed-numbers-subtract" },
                  { title: "Multiplying Mixed Numbers", href: "/math/fractions/multiplying-mixed-numbers" },
                  { title: "Dividing Mixed Numbers", href: "/math/fractions/dividing-mixed-numbers" }
                ].map((topic, index) => (
                  topic.href ? (
                    <Link key={topic.title} href={topic.href}>
                      <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
                              <span className="text-chart-1 font-bold text-sm">{index + 1}</span>
                            </div>
                            <CardTitle className="text-lg text-card-foreground">
                              {topic.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">
                            Interactive lessons and practice problems
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ) : (
                    <Card key={topic.title} className="border-border bg-card opacity-60">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
                            <span className="text-chart-1 font-bold text-sm">{index + 1}</span>
                          </div>
                          <CardTitle className="text-lg text-card-foreground">
                            {topic.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">
                          Coming soon
                        </p>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Content Categories */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
              <Card className="border-border bg-card opacity-60 h-full">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-card-foreground">
                    Practice Exercises <span className="text-sm font-normal text-muted-foreground">(Coming Soon)</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Fun fraction problems with instant feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-1 flex-shrink-0" />
                      <span>Step-by-step solutions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-1 flex-shrink-0" />
                      <span>Multiple difficulty levels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-1 flex-shrink-0" />
                      <span>Detailed explanations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border bg-card opacity-60 h-full">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10 text-chart-2">
                    <Target className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-card-foreground">
                    Fraction Tactics <span className="text-sm font-normal text-muted-foreground">(Coming Soon)</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Super strategies for fraction mastery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                      <span>Finding common denominators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                      <span>Simplifying fractions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                      <span>Converting between forms</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border bg-card opacity-60 h-full">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-card-foreground">
                    Practice Tests <span className="text-sm font-normal text-muted-foreground">(Coming Soon)</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Test your fraction skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-3 flex-shrink-0" />
                      <span>Timed fraction challenges</span>
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
