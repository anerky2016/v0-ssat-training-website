"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Bell,
  Printer,
  Calendar,
  ArrowRight,
  Target,
  Users,
  Home,
  ListChecks,
  Settings,
  RefreshCcw,
  Lightbulb
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HowToPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                How to Use SSAT Prep
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Your complete guide to mastering SSAT math with our study tools
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Quick Start Guide</h2>
                  <p className="text-muted-foreground">Get up and running in 3 simple steps</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3 mb-8">
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">1</span>
                      </div>
                      <Home className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">Browse Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click "Test Sections" on the homepage to explore Fractions, Decimals, Geometry, and more
                    </p>
                    <Link href="/#sections">
                      <Button variant="outline" size="sm" className="w-full">
                        View Sections
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">2</span>
                      </div>
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">Study Lessons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn concepts with interactive explanations, worked examples, and practice problems
                    </p>
                    <Link href="/math/fractions">
                      <Button variant="outline" size="sm" className="w-full">
                        Try a Lesson
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">3</span>
                      </div>
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">Track Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Monitor your study time, completed lessons, and review schedule
                    </p>
                    <Link href="/progress">
                      <Button variant="outline" size="sm" className="w-full">
                        View Progress
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Guides */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Detailed Guides</h2>

              {/* Navigation Guide */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                      <Home className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <CardTitle>Finding Lessons</CardTitle>
                      <CardDescription>How to navigate and find the right topics</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">From the Homepage:</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground pl-4">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">1.</span>
                        <span>Click <strong>"Test Sections"</strong> in the navigation menu or scroll to the sections area</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">2.</span>
                        <span>Choose a chapter: <strong>Fractions, Decimals, Geometry, Expressions,</strong> or <strong>Exponents</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">3.</span>
                        <span>Browse the topic list and click any lesson to start learning</span>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Resume Where You Left Off:</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the <strong>"Resume"</strong> button in the header to jump back to your most recent lesson automatically.
                    </p>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">💡 Tip:</strong> Use the "Back to [Chapter]" link at the top of each lesson to explore related topics.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Using Lessons */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <CardTitle>Using Lessons</CardTitle>
                      <CardDescription>How to get the most out of each lesson</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Lesson Structure:</h4>
                    <ol className="space-y-3 text-sm text-muted-foreground pl-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3 mt-0.5 flex-shrink-0" />
                        <span><strong>Understanding Section:</strong> Kid-friendly explanations of the concept</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3 mt-0.5 flex-shrink-0" />
                        <span><strong>Core Rules:</strong> Key formulas and properties you need to know</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3 mt-0.5 flex-shrink-0" />
                        <span><strong>Worked Examples:</strong> Step-by-step solutions showing exactly how to solve problems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3 mt-0.5 flex-shrink-0" />
                        <span><strong>Pro Tips:</strong> Teaching notes and common pitfalls to avoid</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-3 mt-0.5 flex-shrink-0" />
                        <span><strong>Practice Problems:</strong> Multiple difficulty levels (Easy, Medium, Challenge, Extreme)</span>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Working Through Practice Problems:</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground pl-4">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">1.</span>
                        <span>Select a difficulty level (start with <strong>Easy</strong>)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">2.</span>
                        <span>Try solving each problem on paper before revealing the answer</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">3.</span>
                        <span>Click <strong>"Show Answer"</strong> to check your work</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">4.</span>
                        <span>Read the explanation if you got it wrong to understand the correct approach</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">5.</span>
                        <span>Move to harder difficulty levels as you improve</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-chart-3/5 border border-chart-3/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">📖 Study Tip:</strong> Don't just read the solutions - work through problems yourself first. Active problem-solving builds real understanding.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Completing Lessons */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <CardTitle>Completing Lessons</CardTitle>
                      <CardDescription>Mark lessons as complete to enable spaced repetition</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">How to Mark a Lesson Complete:</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground pl-4">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">1.</span>
                        <span>After studying the lesson and working through practice problems, find the <strong>"Mark as Completed"</strong> button</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">2.</span>
                        <span>Click it to record your completion and set your first review date</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">3.</span>
                        <span>Your next review date will appear (typically 1 day later for the first review)</span>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Accidental Click?</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      No problem! Click the <strong>"Uncomplete"</strong> button (X icon) to undo.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Button Locations:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground pl-4">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span><strong>Top of lesson:</strong> Right after the title for quick access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span><strong>Bottom of lesson:</strong> After you've finished all the content</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-chart-4/5 border border-chart-4/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">⏰ When to Mark Complete:</strong> Mark a lesson complete when you understand the concepts and can solve most practice problems correctly.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Spaced Repetition */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
                      <RefreshCcw className="h-5 w-5 text-chart-5" />
                    </div>
                    <div>
                      <CardTitle>Spaced Repetition System</CardTitle>
                      <CardDescription>Review at optimal intervals to maximize retention</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">What is Spaced Repetition?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Spaced repetition is a proven learning technique where you review material at increasing intervals. This helps move information from short-term to long-term memory.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Review Schedule:</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                        <span className="font-mono font-semibold text-primary">Review #1:</span>
                        <span>1 day after completion</span>
                      </div>
                      <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                        <span className="font-mono font-semibold text-primary">Review #2:</span>
                        <span>3 days after Review #1</span>
                      </div>
                      <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                        <span className="font-mono font-semibold text-primary">Review #3:</span>
                        <span>7 days after Review #2</span>
                      </div>
                      <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                        <span className="font-mono font-semibold text-primary">Review #4:</span>
                        <span>14 days after Review #3</span>
                      </div>
                      <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                        <span className="font-mono font-semibold text-primary">Review #5+:</span>
                        <span>30, 60, 90 days...</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">How to Review:</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground pl-4">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">1.</span>
                        <span>When a lesson is due for review, you'll see it on your <Link href="/progress" className="text-primary hover:underline">Progress page</Link></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">2.</span>
                        <span>Click the lesson link to revisit the material</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">3.</span>
                        <span>Try the practice problems again (focus on Medium/Challenge difficulty)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">4.</span>
                        <span>Click <strong>"Mark as Reviewed Again"</strong> when done - this sets your next review date</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-chart-5/5 border border-chart-5/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">🧠 Why This Works:</strong> Reviewing right before you're about to forget strengthens memory connections. The increasing intervals mean you review less often but remember longer!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Tracking */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-chart-6/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-chart-6" />
                    </div>
                    <div>
                      <CardTitle>Tracking Your Progress</CardTitle>
                      <CardDescription>Monitor study time, streaks, and review schedules</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Progress Page Features:</h4>
                    <ul className="space-y-3 text-sm text-muted-foreground pl-4">
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-chart-6 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Study Stats:</strong> Total study time, topics studied, problems viewed, and day streak
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <ListChecks className="h-4 w-4 text-chart-6 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Most Studied Topics:</strong> See which topics you've focused on most
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <RefreshCcw className="h-4 w-4 text-chart-6 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Review Schedule:</strong> Lessons due for review today and upcoming reviews
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-chart-6 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Recent Activity:</strong> Last 7 days of study sessions with timestamps
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Building a Study Streak:</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Study for at least a few minutes each day to maintain your streak. Consistent daily practice is more effective than long cramming sessions!
                    </p>
                  </div>

                  <div className="bg-chart-6/5 border border-chart-6/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">📊 Track Progress:</strong> Visit the <Link href="/progress" className="text-primary hover:underline">Progress page</Link> regularly to stay motivated and see your improvement over time.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-chart-7/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-chart-7" />
                    </div>
                    <div>
                      <CardTitle>Study Reminders & Notifications</CardTitle>
                      <CardDescription>Never miss a review with browser and email notifications</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Browser Notifications (Recommended):</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground pl-4">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">1.</span>
                        <span>Go to your <Link href="/progress" className="text-primary hover:underline">Progress page</Link></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">2.</span>
                        <span>Scroll to <strong>"Notification Settings"</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">3.</span>
                        <span>Toggle <strong>"Enable Browser Notifications"</strong> on</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">4.</span>
                        <span>Click <strong>"Allow"</strong> when your browser asks for permission</span>
                      </li>
                    </ol>
                    <p className="text-sm text-muted-foreground mt-3">
                      When lessons are due for review, you'll see a notification when you visit the site. The bell icon in the header will also show a red badge with the count.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Email Notifications:</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Get daily email reminders at 9 AM when lessons are due for review. This requires a simple setup - see the instructions on the <Link href="/progress" className="text-primary hover:underline">Progress page</Link>.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Study Reminders on Homepage:</h4>
                    <p className="text-sm text-muted-foreground">
                      The homepage shows a "Study Reminders" section with lessons due today and upcoming reviews. Check it regularly!
                    </p>
                  </div>

                  <div className="bg-chart-7/5 border border-chart-7/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">🔔 Stay on Track:</strong> Enable browser notifications for the easiest way to remember your reviews. You'll only get one notification per day to avoid spam.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Printing */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                      <Printer className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                      <CardTitle>Printing Exercises</CardTitle>
                      <CardDescription>Print practice problems for offline study</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">How to Print:</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground pl-4">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">1.</span>
                        <span>On any lesson page, scroll to the <strong>"Practice Problems"</strong> section</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">2.</span>
                        <span>Select your desired difficulty level (Easy, Medium, Challenge, or Extreme)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">3.</span>
                        <span>Click the <strong>"Print Exercises"</strong> button next to the difficulty buttons</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">4.</span>
                        <span>Choose whether to include answers or not</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-primary mt-0.5">5.</span>
                        <span>Print or save as PDF</span>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Best Practices:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground pl-4">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Print <strong>without answers</strong> first to practice independently</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Print <strong>with answers</strong> to check your work or for answer keys</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Print multiple difficulty levels for comprehensive practice</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-chart-1/5 border border-chart-1/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">🖨️ Offline Study:</strong> Print exercises to practice away from screens, great for timed practice tests or homework assignments.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tips for Parents & Students */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Tips for Success</h2>
                  <p className="text-muted-foreground">For students, parents, and tutors</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* For Students */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      For Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Study 15-30 minutes daily rather than long sessions once a week</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Always try problems yourself before checking answers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Don't skip the "Understanding" and "Pro Tips" sections</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Complete your reviews on time for best results</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Start with Easy problems and work up to Challenge</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Enable browser notifications so you never miss a review</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* For Parents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      For Parents & Tutors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Check the Progress page together weekly to celebrate improvements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Encourage consistent daily practice over cramming</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Review the "Pro Tips" sections to better help your student</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Print exercises for offline practice and timed tests</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Set up email notifications to get daily review reminders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Focus on understanding, not just getting the right answer</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How often should I study?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Aim for 15-30 minutes daily. Consistent daily practice is much more effective than studying for hours once a week. The spaced repetition system is designed around regular, shorter study sessions.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What if I miss a review date?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      No problem! The lesson will stay in your "Lessons Due for Review" until you complete it. Just review it as soon as you can, and the next review interval will be calculated from that date.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Do I need to create an account?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      No! Your progress is automatically saved in your browser. You can sign in with Google for cloud sync and additional features like email notifications, but it's completely optional.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How do I know which difficulty level to choose?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Start with Easy and work your way up. If you can solve 80%+ of problems correctly, move to the next level. Challenge and Extreme problems are designed to push advanced students.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I use this on my phone or tablet?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Yes! The website is fully responsive and works great on all devices. Your progress syncs across devices automatically when using the same browser.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Get Started CTA */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-muted-foreground mb-8">
                Choose a topic and begin your SSAT prep journey today
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/#sections">
                  <Button size="lg">
                    Browse Topics
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/progress">
                  <Button size="lg" variant="outline">
                    View Progress
                    <TrendingUp className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
