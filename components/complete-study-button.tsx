"use client"

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { CheckCircle2, Calendar, X } from 'lucide-react'
import { markLessonComplete, getLessonCompletion, formatReviewDate, uncompletLesson, addStudySession } from '@/lib/study-history'
import { usePathname } from 'next/navigation'

interface CompleteStudyButtonProps {
  topicTitle: string
  centered?: boolean
  size?: 'default' | 'lg'
  customPath?: string // Optional custom path for unique identification (e.g., for vocabulary words)
  category?: string // Optional category for study tracking (e.g., 'math', 'vocabulary')
}

export function CompleteStudyButton({ topicTitle, centered = false, size = 'default', customPath, category }: CompleteStudyButtonProps) {
  const pathname = usePathname()
  const topicPath = customPath || pathname
  const [completion, setCompletion] = useState<ReturnType<typeof getLessonCompletion>>(null)
  const [justCompleted, setJustCompleted] = useState(false)
  const [justUncompleted, setJustUncompleted] = useState(false)

  useEffect(() => {
    // Load completion status
    const current = getLessonCompletion(topicPath)
    setCompletion(current)
  }, [topicPath])

  const handleComplete = () => {
    markLessonComplete(topicPath, topicTitle)

    // Also add a study session if category is provided
    if (category) {
      addStudySession({
        topicPath,
        topicTitle,
        category,
        timestamp: Date.now(),
        duration: 0, // Duration not tracked for completion button
        problemsViewed: 0
      })
    }

    const updated = getLessonCompletion(topicPath)
    setCompletion(updated)
    setJustCompleted(true)

    // Reset the "just completed" state after 3 seconds
    setTimeout(() => setJustCompleted(false), 3000)
  }

  const handleUncomplete = () => {
    uncompletLesson(topicPath)
    setCompletion(null)
    setJustUncompleted(true)

    // Reset the "just uncompleted" state after 3 seconds
    setTimeout(() => setJustUncompleted(false), 3000)
  }

  if (justCompleted) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg border border-green-500/20 ${centered ? 'justify-center' : ''}`}>
        <CheckCircle2 className={size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} />
        <span className={`font-medium ${size === 'lg' ? 'text-lg' : ''}`}>
          {completion?.reviewCount === 1 ? 'Review recorded!' : 'Lesson completed!'}
        </span>
      </div>
    )
  }

  if (justUncompleted) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg border ${centered ? 'justify-center' : ''}`}>
        <X className={size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} />
        <span className={`font-medium ${size === 'lg' ? 'text-lg' : ''}`}>Completion removed</span>
      </div>
    )
  }

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 ${centered ? 'sm:justify-center' : ''}`}>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          onClick={handleComplete}
          variant={completion ? "outline" : "default"}
          size={size}
          className="flex-1 sm:flex-none sm:w-auto"
        >
          <CheckCircle2 className={size === 'lg' ? 'h-5 w-5 mr-2' : 'h-4 w-4 mr-2'} />
          <span className="hidden sm:inline">
            {completion ? (completion.reviewCount > 0 ? 'Mark as Reviewed' : 'Mark as Reviewed Again') : 'Mark as Completed'}
          </span>
          <span className="sm:hidden">
            {completion ? 'Review' : 'Complete'}
          </span>
        </Button>

        {completion && (
          <Button
            onClick={handleUncomplete}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive flex-shrink-0"
            title="Remove completion (in case of accidental click)"
          >
            <X className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Uncomplete</span>
          </Button>
        )}
      </div>

      {completion && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground w-full sm:w-auto">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span className="flex flex-wrap items-center gap-x-1">
            <span className="hidden sm:inline">Next review:</span>
            <span className="sm:hidden">Review:</span>
            <span className="font-medium">{formatReviewDate(completion.nextReviewDate)}</span>
            {completion.reviewCount > 0 && (
              <span className="text-xs whitespace-nowrap">
                (#{completion.reviewCount})
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
