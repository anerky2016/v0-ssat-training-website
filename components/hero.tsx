import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-12 sm:py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-primary" />
            <span>Trusted by 10,000+ students</span>
          </div>

          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
            Master SSAT Math with Confidence
          </h1>

          <p className="mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto px-4 sm:px-0">
            Comprehensive math training materials, practice problems, and proven test-taking tactics to help you excel
            in the SSAT Quantitative section.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base">
              Start Learning Free
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base bg-transparent">
              View Sample Materials
            </Button>
          </div>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Updated for 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Expert-created content</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
