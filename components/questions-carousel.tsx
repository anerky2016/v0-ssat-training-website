"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Brain, Target } from "lucide-react"
import Link from "next/link"
import exercisesData from "@/data/math-practice-exercises.json"
import Autoplay from "embla-carousel-autoplay"

export function QuestionsCarousel() {
  // Show first 5 questions as a preview
  const previewQuestions = exercisesData.exercises.slice(0, 5)

  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            Try Sample Questions
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Test Your
            <br />
            <span className="text-primary">SSAT Knowledge</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Practice with real SSAT-style questions covering all math topics. Get instant feedback and detailed explanations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              // @ts-expect-error - embla-carousel version conflict between direct and react deps
              Autoplay({
                delay: 5000,
                stopOnInteraction: true,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {previewQuestions.map((question) => (
                <CarouselItem key={question.id} className="md:basis-1/2 lg:basis-1/2">
                  <Card className="h-full border-2 hover:border-primary/50 transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {question.topic}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            question.difficulty === "Easy"
                              ? "bg-green-500/10 text-green-700 dark:text-green-400"
                              : question.difficulty === "Medium"
                                ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                : "bg-red-500/10 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {question.difficulty}
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-snug">
                        {question.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 rounded-md bg-muted/50 text-sm text-muted-foreground"
                          >
                            {String.fromCharCode(65 + idx)}. {option}
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          <strong>Answer:</strong> {String.fromCharCode(65 + question.correct)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="text-center mt-8">
            <Link href="/math/exercises">
              <Button size="lg" className="gap-2">
                <Target className="h-5 w-5" />
                Practice All {exercisesData.exercises.length} Questions
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-3">
              Interactive practice with instant feedback
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
