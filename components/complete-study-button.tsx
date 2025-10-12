"use client"

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { CheckCircle2, Calendar } from 'lucide-react'
import { markLessonComplete, getLessonCompletion, formatReviewDate } from '@/lib/study-history'
import { usePathname } from 'next/navigation'

interface CompleteStudyButtonProps {
  topicTitle: string
}

export function CompleteStudyButton({ topicTitle }: CompleteStudyButtonProps) {
  const pathname = usePathname()
  const [completion, setCompletion] = useState<ReturnType<typeof getLessonCompletion>>(null)
  const [justCompleted, setJustCompleted] = useState(false)

  useEffect(() => {
    // Load completion status
    const current = getLessonCompletion(pathname)
    setCompletion(current)
  }, [pathname])

  const handleComplete = () => {
    markLessonComplete(pathname, topicTitle)
    const updated = getLessonCompletion(pathname)
    setCompletion(updated)
    setJustCompleted(true)

    // Reset the "just completed" state after 3 seconds
    setTimeout(() => setJustCompleted(false), 3000)
  }

  if (justCompleted) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg border border-green-500/20">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">
          {completion?.reviewCount === 1 ? 'Review recorded!' : 'Lesson completed!'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <Button
        onClick={handleComplete}
        variant={completion ? "outline" : "default"}
        className="w-full sm:w-auto"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        {completion ? (completion.reviewCount > 0 ? 'Mark as Reviewed' : 'Mark as Reviewed Again') : 'Mark as Completed'}
      </Button>

      {completion && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Next review: <span className="font-medium">{formatReviewDate(completion.nextReviewDate)}</span>
            {completion.reviewCount > 0 && (
              <span className="ml-2 text-xs">
                (Review #{completion.reviewCount})
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
