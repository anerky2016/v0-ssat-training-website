"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Bookmark } from 'lucide-react'
import { getBookmark, clearBookmark } from '@/lib/bookmark'

export function ResumeButton() {
  const [bookmark, setBookmark] = useState<{ path: string; title: string } | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const stored = getBookmark()
    if (stored && stored.path !== pathname) {
      setBookmark({ path: stored.path, title: stored.title })
    } else {
      setBookmark(null)
    }
  }, [pathname])

  const handleResume = () => {
    if (bookmark) {
      router.push(bookmark.path)
    }
  }

  if (!bookmark) return null

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleResume}
      className="inline-flex gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md"
    >
      <Bookmark className="h-4 w-4 fill-current" />
      <span className="hidden md:inline">Resume: {bookmark.title}</span>
      <span className="md:hidden">Resume</span>
    </Button>
  )
}
