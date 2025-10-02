import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-12 sm:py-20 lg:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 text-balance">
            Ready to Start Your SSAT Journey?
          </h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 text-primary-foreground/90 text-pretty leading-relaxed px-4 sm:px-0">
            Join thousands of students who have improved their scores and gained admission to top private schools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-sm sm:text-base">
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-sm sm:text-base bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
