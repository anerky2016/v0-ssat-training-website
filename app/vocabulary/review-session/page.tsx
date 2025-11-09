"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { getDueReviewWords, syncDifficultiesToReviewSchedule } from "@/lib/vocabulary-review-schedule"
import { loadVocabularyWords } from "@/lib/vocabulary-levels"

export default function ReviewSessionPage() {
  const router = useRouter()
  const [dueWords, setDueWords] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReviewWords() {
      setLoading(true)
      try {
        // Sync any missing review schedules
        await syncDifficultiesToReviewSchedule()

        // Get words due for review
        const words = await getDueReviewWords()
        setDueWords(words)
      } catch (error) {
        console.error('Failed to load review words:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReviewWords()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <RefreshCcw className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
              <p className="text-lg text-muted-foreground">Loading your review session...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (dueWords.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <RefreshCcw className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h1 className="text-2xl font-bold mb-2">No Words Due for Review</h1>
            <p className="text-muted-foreground mb-6">
              You're all caught up! Check back later or mark more words with difficulty levels.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/vocabulary/word-lists">
                <Button>Browse Vocabulary</Button>
              </Link>
              <Link href="/progress">
                <Button variant="outline">Back to Progress</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Encode words as comma-separated list for flashcards
  const wordsParam = dueWords.join(',')

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <Link
                href="/progress#review-difficult-words"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Progress
              </Link>

              <div className="mb-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <RefreshCcw className="h-6 w-6" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                  Review Session
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {dueWords.length} word{dueWords.length !== 1 ? 's' : ''} ready for review
                </p>

                <div className="grid gap-4 sm:grid-cols-2 mb-8">
                  {/* Word List View */}
                  <Link
                    href={`/vocabulary/word-lists?reviewWords=${encodeURIComponent(wordsParam)}`}
                    className="block"
                  >
                    <Button
                      size="lg"
                      className="w-full h-auto py-6 flex flex-col items-start gap-2"
                      variant="outline"
                    >
                      <div className="text-lg font-semibold">Word List View</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        Browse all review words with definitions and examples
                      </div>
                    </Button>
                  </Link>

                  {/* Flashcard Mode */}
                  <Link
                    href={`/vocabulary/flashcards?words=${encodeURIComponent(wordsParam)}&from=review-session`}
                    className="block"
                  >
                    <Button
                      size="lg"
                      className="w-full h-auto py-6 flex flex-col items-start gap-2 bg-purple-500 hover:bg-purple-600"
                    >
                      <div className="text-lg font-semibold">Flashcard Mode</div>
                      <div className="text-sm font-normal opacity-90">
                        Quick review with flip cards and swipe navigation
                      </div>
                    </Button>
                  </Link>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="mb-2"><strong>Tip:</strong> After reviewing, mark words as:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• <strong>Easy</strong> - You know this well (reviewed again in 3 days)</li>
                    <li>• <strong>Medium</strong> - You're getting there (reviewed again in 1 day)</li>
                    <li>• <strong>Hard</strong> - Needs more practice (reviewed again in 4 hours)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
