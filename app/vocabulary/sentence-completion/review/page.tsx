"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Trash2, Calendar, TrendingDown, Filter } from "lucide-react"
import Link from "next/link"
import {
  getAllMistakes,
  getMistakeStats,
  getDailyMistakeCounts,
  clearAllMistakes,
  isUserLoggedIn,
  type SentenceCompletionMistake,
} from "@/lib/sentence-completion-mistakes"
import { SentenceCompletionQuestion } from "@/components/vocabulary/questions/SentenceCompletionQuestion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ActivityCalendar } from "@/components/ActivityCalendar"

type DateFilter = "all" | "7days" | "30days" | "90days" | "custom"

export default function SentenceCompletionReviewPage() {
  const [mistakes, setMistakes] = useState<SentenceCompletionMistake[]>([])
  const [stats, setStats] = useState({
    total: 0,
    lastWeek: 0,
    lastMonth: 0,
    mostCommonMistakes: [] as Array<{ question: string; count: number }>,
  })
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    loadMistakes()
  }, [dateFilter, selectedCalendarDate])

  useEffect(() => {
    loadDailyCounts()
  }, [])

  const loadDailyCounts = async () => {
    if (!isUserLoggedIn()) return

    try {
      const counts = await getDailyMistakeCounts()
      setDailyCounts(counts)
    } catch (error) {
      console.error('Failed to load daily counts:', error)
    }
  }

  const getDateRange = (): { startDate?: Date; endDate?: Date } => {
    // If a calendar date is selected, use that specific date
    if (selectedCalendarDate && dateFilter === "custom") {
      const startOfDay = new Date(selectedCalendarDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedCalendarDate)
      endOfDay.setHours(23, 59, 59, 999)
      return { startDate: startOfDay, endDate: endOfDay }
    }

    const now = new Date()
    const endDate = now

    switch (dateFilter) {
      case "7days":
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return { startDate: sevenDaysAgo, endDate }
      case "30days":
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return { startDate: thirtyDaysAgo, endDate }
      case "90days":
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        return { startDate: ninetyDaysAgo, endDate }
      case "all":
      default:
        return {}
    }
  }

  const handleCalendarDateSelect = (date: Date | null) => {
    setSelectedCalendarDate(date)
    if (date) {
      setDateFilter("custom")
    } else {
      setDateFilter("all")
    }
  }

  const loadMistakes = async () => {
    setLoading(true)
    setIsLoggedIn(isUserLoggedIn())

    if (!isUserLoggedIn()) {
      setLoading(false)
      return
    }

    try {
      const { startDate, endDate } = getDateRange()
      const [mistakesData, statsData] = await Promise.all([
        getAllMistakes(startDate, endDate),
        getMistakeStats(startDate, endDate),
      ])

      setMistakes(mistakesData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load mistakes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all your mistake records? This cannot be undone.')) {
      return
    }

    const success = await clearAllMistakes()
    if (success) {
      setMistakes([])
      setStats({
        total: 0,
        lastWeek: 0,
        lastMonth: 0,
        mostCommonMistakes: [],
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-3xl">
                <Link
                  href="/vocabulary/sentence-completion"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Quiz
                </Link>

                <Card>
                  <CardContent className="pt-12 pb-8 text-center">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                      <BookOpen className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
                    <p className="text-muted-foreground mb-6">
                      You need to be signed in to track and review your mistakes.
                    </p>
                    <Link href="/vocabulary/sentence-completion">
                      <Button className="bg-teal-500 hover:bg-teal-600">
                        Back to Quiz
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-muted-foreground">Loading your mistakes...</p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <Link
                href="/vocabulary/sentence-completion"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Quiz
              </Link>

              <div className="mb-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                  Mistake Review
                </h1>
                <p className="text-lg text-muted-foreground">
                  Review your incorrect answers to improve your vocabulary
                </p>
              </div>

              {/* Date Filter */}
              <div className="mb-6 flex items-center gap-3">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <Select value={dateFilter === "custom" ? "all" : dateFilter} onValueChange={(value) => {
                  setDateFilter(value as DateFilter)
                  setSelectedCalendarDate(null) // Clear calendar selection
                }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Calendar */}
              <div className="mb-8">
                <ActivityCalendar
                  dailyCounts={dailyCounts}
                  onDateSelect={handleCalendarDateSelect}
                  selectedDate={selectedCalendarDate}
                  title="Mistake Activity"
                />
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-500 mb-1">{stats.total}</div>
                      <div className="text-sm text-muted-foreground">Total Mistakes</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-500 mb-1">{stats.lastWeek}</div>
                      <div className="text-sm text-muted-foreground">Last 7 Days</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500 mb-1">{stats.lastMonth}</div>
                      <div className="text-sm text-muted-foreground">Last 30 Days</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {mistakes.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-8 text-center">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                      <BookOpen className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">No Mistakes Yet!</h2>
                    <p className="text-muted-foreground mb-6">
                      You haven't made any mistakes, or you're just getting started. Take some quizzes to see your progress!
                    </p>
                    <Link href="/vocabulary/sentence-completion">
                      <Button className="bg-teal-500 hover:bg-teal-600">
                        Take a Quiz
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Actions */}
                  <div className="mb-6 flex justify-end">
                    <Button
                      onClick={handleClearAll}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Mistakes
                    </Button>
                  </div>

                  {/* Mistakes List */}
                  <div className="space-y-6">
                    {mistakes.map((mistake, index) => (
                      <div key={mistake.id || index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-muted-foreground">
                            Mistake #{mistakes.length - index}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(mistake.created_at)}
                          </div>
                        </div>
                        <SentenceCompletionQuestion
                          question={{
                            id: mistake.question_id,
                            question: mistake.question,
                            options: [mistake.correct_answer, mistake.user_answer],
                            answer: mistake.correct_answer,
                            explanation: mistake.explanation,
                          }}
                          selectedAnswer={mistake.user_answer}
                          submitted={true}
                          showFeedback={true}
                          initialAiExplanation={mistake.explanation}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
