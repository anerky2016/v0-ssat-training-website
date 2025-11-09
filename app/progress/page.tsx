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
  BarChart3,
  RefreshCcw,
  AlertCircle,
  Calculator
} from "lucide-react"
import { useEffect, useState } from "react"
import {
  getStudyStats,
  getStudyStatsByCategory,
  getStudyHistory,
  getMostStudiedTopics,
  getMostStudiedTopicsByCategory,
  getSessionsByDay,
  formatDuration,
  exportStudyHistory,
  getLessonsDueForReview,
  getUpcomingReviews,
  formatReviewDate,
  type StudySession,
  type StudyStats,
  type LessonCompletion
} from "@/lib/study-history"
import { useAuth } from "@/contexts/firebase-auth-context"
import { NotificationSettings } from "@/components/notification-settings"
import { VocabularyWordReviews } from "@/components/VocabularyWordReviews"
import Link from "next/link"

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<StudyStats | null>(null)
  const [mathStats, setMathStats] = useState<StudyStats | null>(null)
  const [vocabularyStats, setVocabularyStats] = useState<StudyStats | null>(null)
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([])
  const [topTopics, setTopTopics] = useState<Array<{ topicPath: string; topicTitle: string; count: number; totalTime: number }>>([])
  const [mathTopics, setMathTopics] = useState<Array<{ topicPath: string; topicTitle: string; count: number; totalTime: number }>>([])
  const [vocabularyTopics, setVocabularyTopics] = useState<Array<{ topicPath: string; topicTitle: string; count: number; totalTime: number }>>([])
  const [sessionsByDay, setSessionsByDay] = useState<Map<string, StudySession[]>>(new Map())
  const [lessonsDue, setLessonsDue] = useState<LessonCompletion[]>([])
  const [upcomingLessons, setUpcomingLessons] = useState<LessonCompletion[]>([])
  const [mathLessonsDue, setMathLessonsDue] = useState<LessonCompletion[]>([])
  const [mathUpcomingLessons, setMathUpcomingLessons] = useState<LessonCompletion[]>([])
  // Vocabulary reviews now use difficulty-based system (VocabularyWordReviews component)
  // instead of lesson completion status
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Wait for auth to finish loading before fetching data
    if (authLoading) {
      return
    }

    // Load all data asynchronously
    async function loadData() {
      const studyStats = await getStudyStats()
      const mathStudyStats = await getStudyStatsByCategory('math')
      const vocabularyStudyStats = await getStudyStatsByCategory('vocabulary')
      const history = await getStudyHistory()
      const topics = await getMostStudiedTopics(5)
      const mathTopicsData = await getMostStudiedTopicsByCategory('math', 5)
      const vocabularyTopicsData = await getMostStudiedTopicsByCategory('vocabulary', 5)
      const byDay = await getSessionsByDay(7)
      const allDue = await getLessonsDueForReview()
      const allUpcoming = await getUpcomingReviews(10)

      // Separate math lessons (vocabulary uses difficulty-based system now)
      const mathDue = allDue.filter(lesson => lesson.topicPath.startsWith('/math'))
      const mathUpcoming = allUpcoming.filter(lesson => lesson.topicPath.startsWith('/math'))

      setStats(studyStats)
      setMathStats(mathStudyStats)
      setVocabularyStats(vocabularyStudyStats)
      setRecentSessions(history.slice(0, 10)) // Last 10 sessions
      setTopTopics(topics)
      setMathTopics(mathTopicsData)
      setVocabularyTopics(vocabularyTopicsData)
      setSessionsByDay(byDay)
      setLessonsDue(allDue)
      setUpcomingLessons(allUpcoming)
      setMathLessonsDue(mathDue)
      setMathUpcomingLessons(mathUpcoming)
    }

    loadData()
  }, [authLoading])

  const handleExport = async () => {
    const data = await exportStudyHistory()
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

                  {/* Subject-Specific Progress */}
                  <div className="grid gap-8 lg:grid-cols-2 mb-12">
                    {/* Math Progress */}
                    {mathStats && mathStats.totalSessions > 0 && (
                      <Card className="border-chart-1/20">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
                              <Calculator className="h-6 w-6 text-chart-1" />
                            </div>
                            <div>
                              <CardTitle>Math Progress</CardTitle>
                              <CardDescription>Your mathematics journey</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Study Time</span>
                              <span className="text-sm font-semibold">{formatDuration(mathStats.totalTimeSpent)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Topics Studied</span>
                              <span className="text-sm font-semibold">{mathStats.topicsStudied}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Sessions</span>
                              <span className="text-sm font-semibold">{mathStats.totalSessions}</span>
                            </div>
                          </div>

                          {mathTopics.length > 0 && (
                            <>
                              <h4 className="font-semibold text-sm mb-3">Top Topics</h4>
                              <div className="space-y-2">
                                {mathTopics.slice(0, 3).map((topic, index) => (
                                  <Link
                                    key={topic.topicPath}
                                    href={topic.topicPath}
                                    className="block text-sm text-muted-foreground hover:text-foreground hover:underline"
                                  >
                                    {index + 1}. {topic.topicTitle} ({topic.count} sessions)
                                  </Link>
                                ))}
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Vocabulary Progress */}
                    {vocabularyStats && vocabularyStats.totalSessions > 0 && (
                      <Card className="border-chart-5/20">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-chart-5/10 flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-chart-5" />
                            </div>
                            <div>
                              <CardTitle>Vocabulary Progress</CardTitle>
                              <CardDescription>Your vocabulary mastery</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Study Time</span>
                              <span className="text-sm font-semibold">{formatDuration(vocabularyStats.totalTimeSpent)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Topics Studied</span>
                              <span className="text-sm font-semibold">{vocabularyStats.topicsStudied}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Sessions</span>
                              <span className="text-sm font-semibold">{vocabularyStats.totalSessions}</span>
                            </div>
                          </div>

                          {vocabularyTopics.length > 0 && (
                            <>
                              <h4 className="font-semibold text-sm mb-3">Top Topics</h4>
                              <div className="space-y-2">
                                {vocabularyTopics.slice(0, 3).map((topic, index) => (
                                  <Link
                                    key={topic.topicPath}
                                    href={topic.topicPath}
                                    className="block text-sm text-muted-foreground hover:text-foreground hover:underline"
                                  >
                                    {index + 1}. {topic.topicTitle} ({topic.count} sessions)
                                  </Link>
                                ))}
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Most Studied Topics (Overall) */}
                  {topTopics.length > 0 && (
                    <Card className="mb-12">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-chart-7/10 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-chart-7" />
                          </div>
                          <div>
                            <CardTitle>All Topics Combined</CardTitle>
                            <CardDescription>Your overall top focus areas</CardDescription>
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

                  {/* Math Spaced Repetition Review */}
                  {(mathLessonsDue.length > 0 || mathUpcomingLessons.length > 0) && (
                    <Card className="mb-12">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
                            <RefreshCcw className="h-6 w-6 text-chart-1" />
                          </div>
                          <div>
                            <CardTitle>Math Spaced Repetition Review</CardTitle>
                            <CardDescription>Optimize your math learning with strategic review</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {mathLessonsDue.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                              <AlertCircle className="h-5 w-5 text-orange-500" />
                              <h3 className="font-semibold text-foreground">Ready to Review ({mathLessonsDue.length})</h3>
                            </div>
                            <div className="space-y-3">
                              {mathLessonsDue.map((lesson) => (
                                <Link
                                  key={lesson.topicPath}
                                  href={lesson.topicPath}
                                  className="block p-4 rounded-lg border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-foreground hover:underline">{lesson.topicTitle}</h4>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {lesson.reviewCount === 0 ? 'First review' : `Review #${lesson.reviewCount + 1}`} •
                                        <span className="text-orange-600 dark:text-orange-400 font-medium ml-1">
                                          {formatReviewDate(lesson.nextReviewDate)}
                                        </span>
                                      </p>
                                    </div>
                                    <Button variant="outline" size="sm" className="border-orange-500/20">
                                      Review Now
                                    </Button>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {mathUpcomingLessons.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-foreground mb-4">Upcoming Reviews</h3>
                            <div className="space-y-2">
                              {mathUpcomingLessons.map((lesson) => (
                                <Link
                                  key={lesson.topicPath}
                                  href={lesson.topicPath}
                                  className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-foreground hover:underline">{lesson.topicTitle}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {lesson.reviewCount === 0 ? 'First review' : `Review #${lesson.reviewCount + 1}`}
                                      </p>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {formatReviewDate(lesson.nextReviewDate)}
                                    </span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {mathLessonsDue.length === 0 && mathUpcomingLessons.length === 0 && (
                          <div className="text-center py-8">
                            <RefreshCcw className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">
                              Complete math lessons and mark them as done to start using spaced repetition!
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Vocabulary Spaced Repetition Review */}
                  {/* Uses difficulty-based review system instead of lesson completion status */}
                  <div className="mb-12">
                    <VocabularyWordReviews />
                  </div>

                  {/* Notification Settings */}
                  <div className="mb-12">
                    <NotificationSettings />
                  </div>

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
                                    {sessions.map((session, idx) => {
                                      const sessionTime = new Date(session.timestamp).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                      })

                                      return (
                                        <Link
                                          key={idx}
                                          href={session.topicPath}
                                          className="block text-sm text-muted-foreground hover:text-foreground hover:underline"
                                        >
                                          <span className="font-medium">{sessionTime}</span> - {session.topicTitle} ({formatDuration(session.duration)})
                                        </Link>
                                      )
                                    })}
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
