"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { saveBookmark } from '@/lib/bookmark'

// Pages that should be bookmarked (practice/lesson pages)
const BOOKMARKABLE_PATHS = [
  '/math/fractions',
  '/math/decimals',
  '/math/integers',
  '/math/percentage',
  '/math/ratios',
  '/math/geometry',
  '/math/statistics',
  '/math/equations',
  '/math/expressions',
  '/math/exponents',
  '/math/factoring',
  '/math/simplifying-ratios',
  '/math/proportional-ratios',
  '/math/create-proportion',
  '/math/similarity-ratios',
  '/math/exponents/scientific-notation',
  '/math/exponents/square-roots',
  '/math/expressions/simplifying',
  '/math/expressions/polynomial',
  '/math/expressions/translating',
  '/math/expressions/distributive',
  '/math/equations/one-step',
  '/math/equations/multi-step',
]

// Generate page title from path
function getPageTitle(path: string): string {
  const segments = path.split('/').filter(Boolean)

  if (segments.length === 0) return 'Home'

  const lastSegment = segments[segments.length - 1]

  // Convert kebab-case to Title Case
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Check if current path should be bookmarked
    const shouldBookmark = BOOKMARKABLE_PATHS.some(path =>
      pathname.startsWith(path)
    )

    if (shouldBookmark) {
      const title = getPageTitle(pathname)
      // Call async function without awaiting (fire and forget)
      saveBookmark(pathname, title).catch(error => {
        console.error('Failed to save bookmark:', error)
      })
    }
  }, [pathname])

  return <>{children}</>
}
