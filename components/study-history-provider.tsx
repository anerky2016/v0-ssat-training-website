"use client"

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { addStudySession } from '@/lib/study-history'

// Pages that should be tracked for study history
const TRACKABLE_PATHS = [
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
  '/math/comparing-decimals',
  '/math/multiplying-dividing-decimals',
  '/math/adding-subtracting-decimals',
  '/math/rounding-decimals',
  '/math/adding-subtracting-integers',
  '/math/multiplying-dividing-integers',
  '/math/ordering-integers-numbers',
  '/math/order-of-operations',
  '/math/integers-absolute-value',
  '/math/factoring-numbers',
  '/math/greatest-common-factor',
  '/math/least-common-multiple',
  '/math/exponents/scientific-notation',
  '/math/exponents/square-roots',
  '/math/expressions/simplifying',
  '/math/expressions/polynomial',
  '/math/expressions/translating',
  '/math/expressions/distributive',
  '/math/expressions/evaluating',
  '/math/expressions/evaluating-two',
  '/math/expressions/combining-like-terms',
  '/verbal',
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

// Get category from path
function getCategory(path: string): string {
  if (path.startsWith('/math')) return 'math'
  if (path.startsWith('/verbal')) return 'verbal'
  return 'other'
}

export function StudyHistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const startTimeRef = useRef<number>(0)
  const problemsViewedRef = useRef<number>(0)

  useEffect(() => {
    // Check if current path should be tracked
    const shouldTrack = TRACKABLE_PATHS.some(path =>
      pathname.startsWith(path)
    )

    if (shouldTrack) {
      // Record start time when entering a trackable page
      startTimeRef.current = Date.now()
      problemsViewedRef.current = 0

      // Listen for answer reveal events (we'll track this via custom events)
      const handleAnswerRevealed = () => {
        problemsViewedRef.current++
      }

      window.addEventListener('answer-revealed', handleAnswerRevealed)

      // Save session when leaving the page
      return () => {
        window.removeEventListener('answer-revealed', handleAnswerRevealed)

        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000) // Convert to seconds

        // Only record if user spent at least 10 seconds on the page
        if (duration >= 10) {
          addStudySession({
            topicPath: pathname,
            topicTitle: getPageTitle(pathname),
            category: getCategory(pathname),
            timestamp: Date.now(),
            duration,
            problemsViewed: problemsViewedRef.current,
          })
        }
      }
    }
  }, [pathname])

  return <>{children}</>
}
