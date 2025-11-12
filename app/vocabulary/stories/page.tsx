"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StoryGenerator } from "@/components/vocabulary/StoryGenerator"
import { BookOpen } from "lucide-react"

export default function StoriesPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Vocabulary Story Generator
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create engaging stories using words from different difficulty levels
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Select your difficulty levels and watch as AI creates a unique story incorporating vocabulary words.
                  Each story is crafted to be fun, educational, and age-appropriate for middle school students.
                </p>
              </div>

              {/* Story Generator Component */}
              <StoryGenerator />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
