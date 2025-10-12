"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Clock,
  BookOpen,
  Target,
  Calendar,
  TrendingUp,
  Download,
  Flame,
  BarChart3
} from "lucide-react"
import { useEffect, useState } from "react"
import {
  getStudyStats,
  getStudyHistory,
  getMostStudiedTopics,
  getSessionsByDay,
  formatDuration,
  exportStudyHistory,
  type StudySession,
  type StudyStats
} from "@/lib/study-history"
import Link from "next/link"

export default function ProgressPage() {
  const [stats, setStats] = useState<StudyStats | null>(null)
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([])
  const [topTopics, setTopTopics] = useState<Array<{ topicPath: string; topicTitle: string; count: number; totalTime: number }>>([])
  const [sessionsByDay, setSessionsByDay] = useState<Map<string, StudySession[]>>(new Map())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load all data
    const studyStats = getStudyStats()
    const history = getStudyHistory()
    const topics = getMostStudiedTopics(5)
    const byDay = getSessionsByDay(7)

    setStats(studyStats)
    setRecentSessions(history.slice(0, 10)) // Last 10 sessions
    setTopTopics(topics)
    setSessionsByDay(byDay)
  }, [])

  const handleExport = () => {
    const data = exportStudyHistory()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ssat-study-history-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!mounted || !stats) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">Loading your progress...</div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-chart-1/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-1/10 text-chart-1">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                Your Study Progress
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Track your learning journey and celebrate your achievements
              </p>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-6xl">
              {stats.totalSessions === 0 ? (
                <Card className="border-border bg-card text-center py-12">
                  <CardContent>
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Study History Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start practicing to see your progress here!
                    </p>
                    <Link href="/math">
                      <Button>Browse Topics</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Key Stats Grid */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
                    <Card className="border-chart-1/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-chart-1" />
                          </div>
                          <div>
                            <CardDescription>Total Study Time</CardDescription>
                            <CardTitle className="text-2xl">{formatDuration(stats.totalTimeSpent)}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    <Card className="border-chart-2/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-chart-2" />
                          </div>
                          <div>
                            <CardDescription>Topics Studied</CardDescription>
                            <CardTitle className="text-2xl">{stats.topicsStudied}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    <Card className="border-chart-3/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                            <Target className="h-5 w-5 text-chart-3" />
                          </div>
                          <div>
                            <CardDescription>Problems Viewed</CardDescription>
                            <CardTitle className="text-2xl">{stats.problemsViewed}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    <Card className="border-chart-4/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                            <Flame className="h-5 w-5 text-chart-4" />
                          </div>
                          <div>
                            <CardDescription>Day Streak</CardDescription>
                            <CardTitle className="text-2xl">{stats.streakDays}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Most Studied Topics */}
                  {topTopics.length > 0 && (
                    <Card className="mb-12">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-chart-5/10 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-chart-5" />
                          </div>
                          <div>
                            <CardTitle>Most Studied Topics</CardTitle>
                            <CardDescription>Your top focus areas</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {topTopics.map((topic, index) => (
                            <div key={topic.topicPath} className="flex items-center gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                                {index + 1}
                              </div>
                              <Link
                                href={topic.topicPath}
                                className="flex-1 hover:underline text-foreground"
                              >
                                {topic.topicTitle}
                              </Link>
                              <div className="text-right">
                                <div className="text-sm font-semibold">{topic.count} sessions</div>
                                <div className="text-xs text-muted-foreground">{formatDuration(topic.totalTime)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Last 7 Days Activity */}
                  <Card className="mb-12">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-chart-6/10 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-chart-6" />
                          </div>
                          <div>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Last 7 days</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {sessionsByDay.size === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No activity in the last 7 days</p>
                      ) : (
                        <div className="space-y-4">
                          {Array.from(sessionsByDay.entries())
                            .sort((a, b) => b[0].localeCompare(a[0]))
                            .map(([date, sessions]) => {
                              const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0)
                              const dateObj = new Date(date)
                              const formattedDate = dateObj.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })

                              return (
                                <div key={date} className="border-l-2 border-chart-6 pl-4 py-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">{formattedDate}</h4>
                                    <span className="text-sm text-muted-foreground">
                                      {sessions.length} session{sessions.length !== 1 ? 's' : ''} • {formatDuration(totalTime)}
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {sessions.map((session, idx) => (
                                      <Link
                                        key={idx}
                                        href={session.topicPath}
                                        className="block text-sm text-muted-foreground hover:text-foreground hover:underline"
                                      >
                                        {session.topicTitle} ({formatDuration(session.duration)})
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Export Button */}
                  <div className="text-center">
                    <Button onClick={handleExport} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Study History
                    </Button>
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
