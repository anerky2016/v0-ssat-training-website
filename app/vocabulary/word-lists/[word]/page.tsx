"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import vocabularyData from "@/data/vocabulary-words.json"
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

export default function SingleWordPage() {
  const params = useParams()
  const wordParam = params.word as string

  // Decode the URL parameter and find the matching word
  const decodedWord = decodeURIComponent(wordParam).toLowerCase()
  const word = vocabularyData.words.find(
    w => w.word.toLowerCase() === decodedWord ||
         w.word.toLowerCase().replace(/\s+/g, '-') === decodedWord
  )

  if (!word) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-2xl">
              <Link
                href="/vocabulary/word-lists"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Word Lists
              </Link>

              <Card className="border-orange-500/20 bg-orange-500/5">
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                  <h1 className="text-2xl font-bold mb-2">Word Not Found</h1>
                  <p className="text-muted-foreground mb-6">
                    The word "{wordParam}" was not found in our vocabulary list.
                  </p>
                  <Link href="/vocabulary/word-lists">
                    <Button>Browse All Words</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/vocabulary/word-lists"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Word Lists
            </Link>

            <VocabularyWordCard word={word} />

            <div className="mt-8 flex justify-center">
              <Link href="/vocabulary/word-lists">
                <Button variant="outline">
                  Browse More Words
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
