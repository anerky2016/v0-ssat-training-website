"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Calendar, TrendingUp, History as HistoryIcon } from "lucide-react"
import Link from "next/link"
import {
  getCompletedQuestionsWithTimestamps,
  getProgressStats,
  isUserLoggedIn,
  type CompletedQuestionRecord,
} from "@/lib/sentence-completion-progress"
import chapter2Questions from "@/data/vocabulary-chapter2-questions.json"

export default function SentenceCompletionHistoryPage() {
  const [completedRecords, setCompletedRecords] = useState<CompletedQuestionRecord[]>([])
  const [stats, setStats] = useState({
    totalCompleted: 0,
    completedToday: 0,
    completedThisWeek: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    setIsLoggedIn(isUserLoggedIn())

    if (!isUserLoggedIn()) {
      setLoading(false)
      return
    }

    try {
      const [records, statsData] = await Promise.all([
        getCompletedQuestionsWithTimestamps(),
        getProgressStats(),
      ])

      setCompletedRecords(records)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
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

  const getQuestionText = (questionId: string): string => {
    const question = chapter2Questions.questions.find(q => q.id === questionId)
    return question?.question || questionId
  }

  const getQuestionAnswer = (questionId: string): string => {
    const question = chapter2Questions.questions.find(q => q.id === questionId)
    return question?.answer || '?'
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
                <p className="text-muted-foreground mb-6">
                  You need to be logged in to view your completion history.
                </p>
                <Link href="/vocabulary/sentence-completion">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Quiz
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

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <Link
                href="/vocabulary/sentence-completion"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Quiz
              </Link>

              <div className="mb-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                      <HistoryIcon className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                      Completion History
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      View all questions you've completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-teal-100 dark:bg-teal-900/30 p-2">
                        <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalCompleted}</p>
                        <p className="text-sm text-muted-foreground">Total Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                        <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.completedToday}</p>
                        <p className="text-sm text-muted-foreground">Completed Today</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.completedThisWeek}</p>
                        <p className="text-sm text-muted-foreground">This Week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Completed Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Completed Questions ({completedRecords.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading history...</p>
                    </div>
                  ) : completedRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-2">No completed questions yet</p>
                      <p className="text-sm text-muted-foreground">
                        Start a quiz to begin tracking your progress
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {completedRecords.map((record, index) => (
                        <div
                          key={`${record.questionId}-${index}`}
                          className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                                {getQuestionAnswer(record.questionId)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mb-1">
                              {getQuestionText(record.questionId)}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(record.completedAt)}</span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground ml-4 flex-shrink-0">
                            #{record.questionId.replace('chapter2-q', '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
