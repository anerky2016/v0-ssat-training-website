"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, TrendingUp, TrendingDown } from "lucide-react"
import { getWordDifficultyHistory } from "@/lib/vocabulary-difficulty"
import { getDifficultyLabel, getDifficultyColor, type DifficultyLevel } from "@/lib/vocabulary-difficulty"
import type { VocabularyDifficultyHistoryData } from "@/lib/supabase"

interface DifficultyHistoryTimelineProps {
  word: string
  className?: string
}

export function DifficultyHistoryTimeline({ word, className = "" }: DifficultyHistoryTimelineProps) {
  const [history, setHistory] = useState<VocabularyDifficultyHistoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)
      const data = await getWordDifficultyHistory(word)
      setHistory(data)
      setLoading(false)
    }

    loadHistory()
  }, [word])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getChangeIcon = (oldDiff: DifficultyLevel | null, newDiff: DifficultyLevel) => {
    if (oldDiff === null) return null
    if (newDiff > oldDiff) {
      return <TrendingUp className="w-3 h-3 text-red-500" />
    }
    if (newDiff < oldDiff) {
      return <TrendingDown className="w-3 h-3 text-green-500" />
    }
    return null
  }

  if (loading) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        Loading history...
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" />
          <span>No difficulty changes yet</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <History className="w-4 h-4" />
        <span>Difficulty History ({history.length} changes)</span>
      </div>

      <div className="space-y-2">
        {history.map((entry, index) => (
          <div
            key={entry.id || index}
            className="flex items-center gap-3 text-sm border-l-2 border-border pl-3 py-1"
          >
            <span className="text-xs text-muted-foreground min-w-[70px]">
              {formatDate(entry.changed_at)}
            </span>

            <div className="flex items-center gap-2 flex-1">
              {entry.old_difficulty !== null && (
                <>
                  <Badge
                    variant="outline"
                    className={getDifficultyColor(entry.old_difficulty)}
                  >
                    {getDifficultyLabel(entry.old_difficulty)}
                  </Badge>
                  <span className="text-muted-foreground">→</span>
                </>
              )}

              <Badge
                variant="outline"
                className={getDifficultyColor(entry.new_difficulty)}
              >
                {getDifficultyLabel(entry.new_difficulty)}
              </Badge>

              {getChangeIcon(entry.old_difficulty, entry.new_difficulty)}

              {entry.old_difficulty === null && (
                <span className="text-xs text-muted-foreground">(initial)</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
