"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, BookOpen, Link2, ArrowRight, GraduationCap } from "lucide-react"
import Link from "next/link"
import test8Data from "@/data/ssat-test8-questions.json"

export default function SsatPracticePage() {
  const synonymCount = test8Data.questions.filter(q => q.questionType === 'SYNONYM').length
  const analogyCount = test8Data.questions.filter(q => q.questionType === 'ANALOGY').length

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-5xl">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
                  SSAT Practice
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Practice with real SSAT Middle Level Test 8 questions. Master synonyms and analogies to boost your verbal score.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500 mb-1">
                        {synonymCount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Synonym Questions
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-500 mb-1">
                        {analogyCount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Analogy Questions
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-500 mb-1">
                        {test8Data.totalQuestions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Questions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Practice Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Synonym Practice */}
                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">Synonym Practice</CardTitle>
                    <CardDescription className="text-base">
                      Test your vocabulary knowledge by identifying synonyms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                          <strong>What you'll practice:</strong>
                        </p>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                          <li>Identifying word meanings</li>
                          <li>Recognizing similar words</li>
                          <li>Building vocabulary knowledge</li>
                        </ul>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{synonymCount} questions available</span>
                        <span>• Test 8</span>
                      </div>
                      <Link href="/ssat/synonyms">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600" size="lg">
                          Start Synonym Practice
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Analogy Practice */}
                <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                      <Link2 className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">Analogy Practice</CardTitle>
                    <CardDescription className="text-base">
                      Master word relationships and reasoning skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <p className="text-sm text-purple-900 dark:text-purple-100 mb-2">
                          <strong>What you'll practice:</strong>
                        </p>
                        <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 list-disc list-inside">
                          <li>Understanding word relationships</li>
                          <li>Logical reasoning skills</li>
                          <li>Pattern recognition</li>
                        </ul>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{analogyCount} questions available</span>
                        <span>• Test 8</span>
                      </div>
                      <Link href="/ssat/analogies">
                        <Button className="w-full bg-purple-500 hover:bg-purple-600" size="lg">
                          Start Analogy Practice
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* About SSAT */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    About SSAT Verbal Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">
                    The SSAT (Secondary School Admission Test) Verbal section tests your vocabulary and reasoning skills through two question types:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Synonyms</h4>
                      <p className="text-xs text-muted-foreground">
                        Choose the word that means the same or nearly the same as the given word.
                      </p>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-1">Analogies</h4>
                      <p className="text-xs text-muted-foreground">
                        Complete the analogy by identifying the relationship between word pairs.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Our practice questions are from official SSAT Middle Level Test 8, giving you authentic test preparation experience.
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
