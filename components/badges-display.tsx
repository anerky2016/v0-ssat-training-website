'use client'

import { useEffect, useState } from 'react'
import { getUserBadges, getBadgeStats, type Badge } from '@/lib/streaks'
import { Award, Trophy, Star } from 'lucide-react'
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
      <div className="py-12 text-center">
        <Star className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          No badges yet. Keep studying to earn your first badge!
        </p>
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
