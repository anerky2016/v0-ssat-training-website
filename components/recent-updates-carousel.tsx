"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Sparkles, ArrowRight, Calendar, BookOpen } from "lucide-react"
import Link from "next/link"
import updatesData from "@/data/recent-updates.json"
import Autoplay from "embla-carousel-autoplay"

export function RecentUpdatesCarousel() {
  const recentUpdates = updatesData.updates

  if (!recentUpdates || recentUpdates.length === 0) {
    return null
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Latest Updates
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            What's <span className="text-primary">New</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Check out our latest lesson enhancements and interactive features
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnInteraction: true,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {recentUpdates.map((update) => (
                <CarouselItem key={update.id} className="md:basis-1/2 lg:basis-1/2">
                  <Card className="h-full border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(update.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <CardTitle className="text-xl mb-1">
                            {update.lesson_title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            <span className="inline-flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {update.chapter}
                            </span>
                          </CardDescription>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                            update.update_type === "major_enhancement"
                              ? "bg-primary/10 text-primary"
                              : update.update_type === "new_lesson"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                          }`}
                        >
                          {update.update_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {update.summary}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                          Key Features:
                        </p>
                        <ul className="space-y-2">
                          {update.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span>{feature.title}</span>
                            </li>
                          ))}
                          {update.features.length > 3 && (
                            <li className="text-xs text-muted-foreground italic pl-3.5">
                              + {update.features.length - 3} more features
                            </li>
                          )}
                        </ul>
                      </div>
                      <div className="pt-3 border-t">
                        <Link href={update.lesson_path}>
                          <Button size="sm" className="w-full gap-2">
                            View Lesson
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  )
}
