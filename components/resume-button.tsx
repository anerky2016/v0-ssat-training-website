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
      variant="outline"
      size="sm"
      onClick={handleResume}
      className="hidden sm:inline-flex gap-2"
    >
      <Bookmark className="h-4 w-4" />
      <span className="hidden md:inline">Resume: {bookmark.title}</span>
      <span className="md:hidden">Resume</span>
    </Button>
  )
}
