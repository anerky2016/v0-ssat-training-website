import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-12 sm:py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-primary" />
            <span>Trusted by 10,000+ students</span>
          </div>

          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-foreground text-balance animate-pulse">
            Master SSAT Math with ELECTRIC Energy!
          </h1>

          <p className="mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto px-4 sm:px-0">
            SUPER FUN math practice, AMAZING tricks, and EPIC strategies to help you DOMINATE the SSAT!
            Turn math into your ULTIMATE SUPERPOWER!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Link href="/math/exercises" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-sm sm:text-base bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all duration-300 transform hover:scale-105 shadow-lg">
                START THE ADVENTURE!
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 animate-bounce" />
              </Button>
            </Link>
            <Link href="/math" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-sm sm:text-base bg-transparent border-2 hover:bg-accent/10 transition-all duration-300 transform hover:scale-105">
                EXPLORE THE MAGIC!
              </Button>
            </Link>
          </div>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
            <div className="flex items-center gap-2 animate-pulse">
              <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
              <span>TOTALLY FREE!</span>
            </div>
            <div className="flex items-center gap-2 animate-pulse">
              <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
              <span>FRESH FOR 2025!</span>
            </div>
            <div className="flex items-center gap-2 animate-pulse">
              <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
              <span>GENIUS-LEVEL CONTENT!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
