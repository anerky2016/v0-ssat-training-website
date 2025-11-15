"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getUpcomingReviews, getLessonsDueForReview, formatReviewDate } from '@/lib/study-history'
import { checkAndNotifyDueLessons } from '@/lib/notifications'

interface StudyReminderProps {
  showHeader?: boolean
  compact?: boolean
}

export function StudyReminder({ showHeader = true, compact = false }: StudyReminderProps) {
  const [upcomingReviews, setUpcomingReviews] = useState<Awaited<ReturnType<typeof getUpcomingReviews>>>([])
  const [lessonsDue, setLessonsDue] = useState<Awaited<ReturnType<typeof getLessonsDueForReview>>>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getUpcomingReviews().then(reviews => setUpcomingReviews(reviews))
    getLessonsDueForReview().then(lessons => setLessonsDue(lessons))

    // Check and show browser notification if enabled
    checkAndNotifyDueLessons()
  }, [])

  if (!mounted) {
    return null
  }

  // Count lessons due now and upcoming in next 7 days
  const dueCount = lessonsDue.length
  const upcomingCount = upcomingReviews.length

  // If no reminders and compact mode, don't render anything
  if (compact && dueCount === 0 && upcomingCount === 0) {
    return null
  }

  // Compact version for header badge
  if (compact) {
    return (
      <Link href="/progress">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {dueCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
              {dueCount}
            </span>
          )}
        </Button>
      </Link>
    )
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
            <Bell className="h-6 w-6 text-chart-1" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Study Reminders</h2>
            <p className="text-sm text-muted-foreground">Stay on track with spaced repetition reviews</p>
          </div>
        </div>
      )}

      {/* Lessons Due for Review */}
      {dueCount > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg">
                  {dueCount} {dueCount === 1 ? 'Lesson' : 'Lessons'} Due for Review
                </CardTitle>
              </div>
              <Link href="/progress">
                <Button size="sm" variant="destructive">
                  Review Now
                </Button>
              </Link>
            </div>
            <CardDescription>
              These lessons are ready for review to strengthen your long-term memory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lessonsDue.slice(0, 3).map((lesson) => (
                <Link
                  key={lesson.topicPath}
                  href={lesson.topicPath}
                  className="block p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{lesson.topicTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        Review #{lesson.reviewCount + 1} • Due {formatReviewDate(lesson.nextReviewDate)}
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Link>
              ))}
              {dueCount > 3 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  And {dueCount - 3} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reviews */}
      {upcomingCount > 0 && (
        <Card className="border-chart-1/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-chart-1" />
              <CardTitle className="text-lg">
                {upcomingCount} Upcoming {upcomingCount === 1 ? 'Review' : 'Reviews'} (Next 7 Days)
              </CardTitle>
            </div>
            <CardDescription>
              Plan ahead for these upcoming review sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingReviews.slice(0, 5).map((lesson) => (
                <Link
                  key={lesson.topicPath}
                  href={lesson.topicPath}
                  className="block p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{lesson.topicTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        Review #{lesson.reviewCount + 1} • Due {formatReviewDate(lesson.nextReviewDate)}
                      </p>
                    </div>
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Link>
              ))}
              {upcomingCount > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  And {upcomingCount - 5} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No reminders */}
      {dueCount === 0 && upcomingCount === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium text-foreground mb-1">All Caught Up!</p>
              <p className="text-sm text-muted-foreground">
                No reviews due right now. Keep learning new lessons!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
