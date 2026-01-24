'use client'

import { useEffect, useState } from 'react'
import { getDailyGoalProgress, type DailyGoalProgress } from '@/lib/streaks'
import { BookOpen, Clock, CheckCircle2, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export function DailyGoalsCard() {
  const [progress, setProgress] = useState<DailyGoalProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
    // Refresh every 30 seconds
    const interval = setInterval(loadProgress, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadProgress() {
    const data = await getDailyGoalProgress()
    setProgress(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="space-y-3">
            <div className="h-8 rounded bg-muted" />
            <div className="h-8 rounded bg-muted" />
            <div className="h-8 rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!progress) return null

  const { wordsReviewed, minutesStudied, questionsAnswered, overallProgress, isComplete } = progress

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Today's Goals</h3>
        {isComplete ? (
          <div className="flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1">
            <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">Complete!</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">{overallProgress}%</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Words Reviewed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Words Reviewed</span>
            </div>
            <span className={cn(
              'font-bold',
              wordsReviewed.actual >= wordsReviewed.goal
                ? 'text-green-600 dark:text-green-400'
                : 'text-muted-foreground'
            )}>
              {wordsReviewed.actual} / {wordsReviewed.goal}
            </span>
          </div>
          <Progress value={wordsReviewed.percentage} className="h-2" />
        </div>

        {/* Minutes Studied */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Minutes Studied</span>
            </div>
            <span className={cn(
              'font-bold',
              minutesStudied.actual >= minutesStudied.goal
                ? 'text-green-600 dark:text-green-400'
                : 'text-muted-foreground'
            )}>
              {minutesStudied.actual} / {minutesStudied.goal}
            </span>
          </div>
          <Progress value={minutesStudied.percentage} className="h-2" />
        </div>

        {/* Questions Answered */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="font-medium">Questions Answered</span>
            </div>
            <span className={cn(
              'font-bold',
              questionsAnswered.actual >= questionsAnswered.goal
                ? 'text-green-600 dark:text-green-400'
                : 'text-muted-foreground'
            )}>
              {questionsAnswered.actual} / {questionsAnswered.goal}
            </span>
          </div>
          <Progress value={questionsAnswered.percentage} className="h-2" />
        </div>
      </div>

      {/* Overall Progress Ring */}
      <div className="mt-6 flex items-center justify-center">
        <div className="relative">
          <svg className="h-32 w-32 -rotate-90 transform">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallProgress / 100)}`}
              className={cn(
                'transition-all duration-500',
                isComplete
                  ? 'text-green-500'
                  : overallProgress >= 70
                  ? 'text-blue-500'
                  : overallProgress >= 40
                  ? 'text-yellow-500'
                  : 'text-orange-500'
              )}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{overallProgress}%</span>
            <span className="text-xs text-muted-foreground">Complete</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DailyGoalsMini() {
  const [progress, setProgress] = useState<DailyGoalProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [])

  async function loadProgress() {
    const data = await getDailyGoalProgress()
    setProgress(data)
    setLoading(false)
  }

  if (loading || !progress) return null

  const { overallProgress, isComplete } = progress

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-8 w-8">
        <svg className="h-full w-full -rotate-90 transform">
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - overallProgress / 100)}`}
            className={cn(
              'transition-all duration-500',
              isComplete ? 'text-green-500' : 'text-blue-500'
            )}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <span className="text-[10px] font-bold">{overallProgress}</span>
          )}
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {isComplete ? 'Goals complete!' : 'Daily goals'}
      </span>
    </div>
  )
}
