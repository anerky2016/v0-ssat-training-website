'use client'

import { useEffect, useState } from 'react'
import { getStreakStats, type StreakStats } from '@/lib/streaks'
import { Flame, TrendingUp, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StreakDisplay({ className }: { className?: string }) {
  const [stats, setStats] = useState<StreakStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    const data = await getStreakStats()
    setStats(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
        <span className="animate-pulse">Loading...</span>
      </div>
    )
  }

  if (!stats) return null

  const { currentStreak, longestStreak, isActive, needsActivity } = stats

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Current Streak */}
      <div className="flex items-center gap-1.5">
        <div className={cn(
          'relative flex items-center justify-center',
          isActive && 'animate-pulse'
        )}>
          <Flame
            className={cn(
              'h-5 w-5',
              currentStreak > 0 && isActive
                ? 'text-orange-500 dark:text-orange-400'
                : 'text-muted-foreground'
            )}
          />
          {currentStreak > 0 && isActive && (
            <span className="absolute inset-0 animate-ping">
              <Flame className="h-5 w-5 text-orange-500/50" />
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className={cn(
            'text-sm font-bold leading-none',
            currentStreak > 0 && isActive
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-muted-foreground'
          )}>
            {currentStreak}
          </span>
          <span className="text-[10px] text-muted-foreground leading-none">
            {currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Longest Streak */}
      {longestStreak > 0 && longestStreak > currentStreak && (
        <div className="flex items-center gap-1.5 border-l pl-3 dark:border-gray-700">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground leading-none">
              {longestStreak}
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">
              best
            </span>
          </div>
        </div>
      )}

      {/* Status indicator */}
      {needsActivity && currentStreak > 0 && (
        <div className="flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5">
          <Calendar className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
          <span className="text-[10px] font-medium text-yellow-700 dark:text-yellow-300">
            Study today!
          </span>
        </div>
      )}
    </div>
  )
}

export function StreakCard() {
  const [stats, setStats] = useState<StreakStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    const data = await getStreakStats()
    setStats(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-12 w-16 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!stats) return null

  const { currentStreak, longestStreak, totalStudyDays, isActive, needsActivity, daysUntilBreak } = stats

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">Study Streak</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{currentStreak}</span>
            <span className="text-lg text-muted-foreground">{currentStreak === 1 ? 'day' : 'days'}</span>
          </div>
        </div>
        <div className={cn(
          'rounded-full p-3',
          isActive
            ? 'bg-orange-100 dark:bg-orange-900/30'
            : 'bg-muted'
        )}>
          <Flame
            className={cn(
              'h-6 w-6',
              isActive
                ? 'text-orange-500 dark:text-orange-400'
                : 'text-muted-foreground'
            )}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 dark:border-gray-700">
        <div>
          <p className="text-xs text-muted-foreground">Longest Streak</p>
          <p className="text-lg font-semibold">{longestStreak} days</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Study Days</p>
          <p className="text-lg font-semibold">{totalStudyDays}</p>
        </div>
      </div>

      {needsActivity && currentStreak > 0 && (
        <div className="mt-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3">
          <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
            {daysUntilBreak === 0 ? (
              <>
                <strong>Study today</strong> to keep your {currentStreak}-day streak!
              </>
            ) : (
              <>You're safe for today. Come back tomorrow!</>
            )}
          </p>
        </div>
      )}

      {!isActive && currentStreak === 0 && (
        <div className="mt-4 rounded-md bg-blue-50 dark:bg-blue-900/20 p-3">
          <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
            Start your streak today! Study for just a few minutes.
          </p>
        </div>
      )}
    </div>
  )
}
