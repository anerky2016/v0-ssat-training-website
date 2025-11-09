"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb
} from "lucide-react"
import Link from "next/link"
import { getDueReviews, getReviewStats, type ReviewSchedule } from "@/lib/vocabulary-review-schedule"
import { getDifficultyLabel, getDifficultyColor } from "@/lib/vocabulary-difficulty"

export function VocabularyWordReviews() {
  const [dueWords, setDueWords] = useState<ReviewSchedule[]>([])
  const [stats, setStats] = useState<{
    totalScheduled: number
    dueNow: number
    dueToday: number
    reviewedToday: number
    reviewedThisWeek: number
    averageRecall: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReviews() {
      setLoading(true)
      try {
        const [due, reviewStats] = await Promise.all([
          getDueReviews(),
          getReviewStats()
        ])
        setDueWords(due)
        setStats(reviewStats)
      } catch (error) {
        console.error('Failed to load word reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <CardTitle>Vocabulary Word Reviews</CardTitle>
              <CardDescription>Loading review schedule...</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (!stats || (stats.totalScheduled === 0 && dueWords.length === 0)) {
    return null
  }

  // Group words by difficulty
  const groupedByDifficulty = dueWords.reduce((acc, word) => {
    const difficulty = word.difficulty
    if (!acc[difficulty]) acc[difficulty] = []
    acc[difficulty].push(word)
    return acc
  }, {} as Record<number, ReviewSchedule[]>)

  // Calculate estimated time (30 seconds per word)
  const estimatedMinutes = Math.ceil((dueWords.length * 30) / 60)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <CardTitle>Vocabulary Word Reviews</CardTitle>
            <CardDescription>Spaced repetition for individual words</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-foreground">{dueWords.length}</div>
            <div className="text-sm text-muted-foreground">Due Now</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-foreground">{stats.dueToday}</div>
            <div className="text-sm text-muted-foreground">Due Today</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-foreground">{stats.reviewedToday}</div>
            <div className="text-sm text-muted-foreground">Reviewed Today</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-foreground">
              {stats.averageRecall > 0 ? `${Math.round(stats.averageRecall * 100)}%` : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Recall Rate</div>
          </div>
        </div>

        {/* Due Words */}
        {dueWords.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-foreground">
                  Ready to Review ({dueWords.length} words)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>~{estimatedMinutes} min</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Group by difficulty */}
              {[3, 2, 0, 1].map(difficulty => {
                const words = groupedByDifficulty[difficulty]
                if (!words || words.length === 0) return null

                const label = getDifficultyLabel(difficulty as any)
                const color = getDifficultyColor(difficulty as any)

                return (
                  <div key={difficulty} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${color.replace('text-', 'bg-')}`} />
                      <h4 className={`font-medium text-sm ${color}`}>
                        {label} ({words.length} word{words.length !== 1 ? 's' : ''})
                      </h4>
                    </div>
                    <div className="pl-4 border-l-2 border-border space-y-2">
                      {words.slice(0, 5).map((word) => (
                        <div
                          key={word.word}
                          className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground capitalize">{word.word}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Review #{word.review_count + 1}
                                {word.last_reviewed_at && (
                                  <span className="ml-2">
                                    · Last reviewed {formatTimeAgo(word.last_reviewed_at)}
                                  </span>
                                )}
                              </p>
                            </div>
                            <Badge variant="outline" className={color}>
                              {label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {words.length > 5 && (
                        <p className="text-sm text-muted-foreground pl-3">
                          + {words.length - 5} more {label.toLowerCase()} words
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/vocabulary/word-lists" className="flex-1">
                <Button className="w-full" size="lg">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Start Review Session
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Weekly Progress */}
        {stats.reviewedThisWeek > 0 && (
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-foreground">This Week's Progress</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  {stats.reviewedThisWeek} words reviewed
                </span>
              </div>
              {stats.averageRecall > 0 && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {Math.round(stats.averageRecall * 100)}% recall rate
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'just now'
}
