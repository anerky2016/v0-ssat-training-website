'use client'

import { useEffect, useState } from 'react'
import { getUserBadges, getBadgeStats, type Badge } from '@/lib/streaks'
import { Award, Trophy, Star, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function BadgesButton() {
  const [stats, setStats] = useState<{ total: number } | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const data = await getBadgeStats()
    setStats(data)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Award className="h-4 w-4 mr-2" />
          <span>Badges</span>
          {stats && stats.total > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {stats.total}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Achievements
          </DialogTitle>
          <DialogDescription>
            Badges you've earned through your study journey
          </DialogDescription>
        </DialogHeader>
        <BadgesGrid />
      </DialogContent>
    </Dialog>
  )
}

function BadgesGrid() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBadges()
  }, [])

  async function loadBadges() {
    setLoading(true)
    const data = await getUserBadges()
    setBadges(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-muted p-4">
            <div className="h-12 w-12 mx-auto rounded-full bg-muted-foreground/20" />
            <div className="mt-2 h-4 rounded bg-muted-foreground/20" />
          </div>
        ))}
      </div>
    )
  }

  if (badges.length === 0) {
    return (
      <div className="space-y-6">
        {/* How to Earn Badges Section */}
        <BadgeInstructions />

        <div className="py-12 text-center">
          <Star className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            No badges yet. Keep studying to earn your first badge!
          </p>
        </div>
      </div>
    )
  }

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    if (!acc[badge.badge_category]) {
      acc[badge.badge_category] = []
    }
    acc[badge.badge_category].push(badge)
    return acc
  }, {} as Record<string, Badge[]>)

  return (
    <div className="space-y-4">
      {/* How to Earn Badges Section */}
      <BadgeInstructions />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="words">Words</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          <TabsTrigger value="milestone">Milestone</TabsTrigger>
        </TabsList>

      <TabsContent value="all" className="mt-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </TabsContent>

      {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
        <TabsContent key={category} value={category} className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categoryBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>
      ))}
      </Tabs>
    </div>
  )
}

function BadgeInstructions() {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border bg-muted/50 p-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">How to Earn Badges</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          {open ? 'Hide' : 'Show'}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4 text-sm">
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-lg">🔥</span> Streak Badges
          </h4>
          <p className="text-muted-foreground mb-2">
            <strong>How to earn:</strong> Complete ANY study activity (math practice, vocabulary quiz, flashcards, reading, etc.) on consecutive days.
            You must study at least once per day to maintain your streak.
          </p>
          <p className="text-muted-foreground text-xs mb-2 italic">Activities that count: Math exercises, vocabulary quizzes, flashcard sessions, sentence completion, story reading</p>
          <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
            <li><strong>3 days in a row</strong> → Getting Started 🔥</li>
            <li><strong>7 days in a row</strong> → Week Warrior ⚡</li>
            <li><strong>14 days in a row</strong> → Two Week Champion 💪</li>
            <li><strong>30 days in a row</strong> → Monthly Master 🏆</li>
            <li><strong>50 days in a row</strong> → Dedication Expert 🌟</li>
            <li><strong>100 days in a row</strong> → Century Club 💯</li>
            <li><strong>365 days in a row</strong> → Year Legend 👑</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-lg">📚</span> Words Badges
          </h4>
          <p className="text-muted-foreground mb-2">
            <strong>How to earn:</strong> Review vocabulary words through any vocabulary activity. Total word reviews are cumulative (lifetime count).
          </p>
          <p className="text-muted-foreground text-xs mb-2 italic">Activities that count: Vocabulary flashcards, word lists, vocabulary quiz</p>
          <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
            <li><strong>Review 100 words total</strong> → Vocabulary Starter 📚</li>
            <li><strong>Review 500 words total</strong> → Word Collector 📖</li>
            <li><strong>Review 1,000 words total</strong> → Vocabulary Master 🎓</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-lg">⏰</span> Time Badges
          </h4>
          <p className="text-muted-foreground mb-2">
            <strong>How to earn:</strong> Accumulate total study time across all activities. Time is tracked automatically when you complete exercises, read stories, or practice.
          </p>
          <p className="text-muted-foreground text-xs mb-2 italic">Activities that count: All study activities - math practice, vocabulary sessions, reading, quizzes</p>
          <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
            <li><strong>Study for 10 hours total</strong> → Time Investor ⏰</li>
            <li><strong>Study for 50 hours total</strong> → Dedicated Learner ⏳</li>
            <li><strong>Study for 100 hours total</strong> → Study Marathon 🏅</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-lg">🌱</span> Milestone Badges
          </h4>
          <p className="text-muted-foreground mb-2">
            <strong>How to earn:</strong> Special achievements triggered by specific accomplishments:
          </p>
          <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
            <li>
              <strong>First Steps 🌱</strong> → Complete any study activity for the first time (math, vocabulary, etc.)
            </li>
            <li>
              <strong>Comeback Kid 🔄</strong> → Break a 3+ day streak, then start studying again (automatic when you return)
            </li>
            <li>
              <strong>Perfect Week ✨</strong> → Meet ALL daily goals (words, time, questions) for 7 consecutive days
              <div className="text-xs mt-1 ml-4">Default daily goals: 10 words reviewed, 15 minutes studied, 5 questions answered</div>
            </li>
          </ul>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>💡 Quick Start Guide:</strong>
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4 mt-2">
            <li>• Start any math or vocabulary activity to begin your streak</li>
            <li>• Practice vocabulary flashcards or quizzes to earn Words badges</li>
            <li>• Keep studying daily to earn Time badges and build your streak</li>
            <li>• All progress is tracked automatically - just keep learning!</li>
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  const earnedDate = badge.earned_at ? new Date(badge.earned_at) : new Date()
  const formattedDate = earnedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const categoryColors = {
    streak: 'from-orange-500 to-red-500',
    words: 'from-blue-500 to-cyan-500',
    time: 'from-purple-500 to-pink-500',
    accuracy: 'from-green-500 to-emerald-500',
    milestone: 'from-yellow-500 to-amber-500',
  }

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-lg hover:scale-105',
      'cursor-pointer'
    )}>
      {/* Background gradient */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br',
        categoryColors[badge.badge_category]
      )} />

      {/* Badge content */}
      <div className="relative z-10">
        <div className="flex items-center justify-center h-12 w-12 mx-auto text-4xl mb-2">
          {badge.badge_icon}
        </div>
        <h4 className="text-sm font-semibold text-center mb-1">
          {badge.badge_name}
        </h4>
        <p className="text-xs text-muted-foreground text-center mb-2">
          {badge.badge_description}
        </p>
        <p className="text-[10px] text-muted-foreground text-center">
          Earned {formattedDate}
        </p>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      </div>
    </div>
  )
}

export function RecentBadges() {
  const [stats, setStats] = useState<{ recentBadges: Badge[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const data = await getBadgeStats()
    setStats(data)
    setLoading(false)
  }

  if (loading || !stats || stats.recentBadges.length === 0) return null

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Badges</h3>
      <div className="space-y-2">
        {stats.recentBadges.map((badge) => (
          <div key={badge.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
            <span className="text-2xl">{badge.badge_icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{badge.badge_name}</p>
              <p className="text-xs text-muted-foreground truncate">{badge.badge_description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
