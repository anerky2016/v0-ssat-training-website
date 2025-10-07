"use client"

import { BookCheck, Sparkles, Library, Target } from "lucide-react"

export function TrustedContent() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Library className="h-4 w-4" />
            Comprehensive Curriculum
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Industry-Standard
            <br />
            <span className="text-primary">SSAT Prep Curriculum</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our curriculum is designed to align with industry-leading SSAT preparation standards,
            covering all essential topics and strategies for test success.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 bg-background rounded-lg border">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <BookCheck className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Complete Coverage</h3>
            <p className="text-sm text-muted-foreground">
              All SSAT Middle Level topics organized in a clear, structured curriculum
            </p>
          </div>

          <div className="text-center p-6 bg-background rounded-lg border">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Proven Methods</h3>
            <p className="text-sm text-muted-foreground">
              Effective test-taking strategies and problem-solving techniques
            </p>
          </div>

          <div className="text-center p-6 bg-background rounded-lg border">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Exam-Aligned</h3>
            <p className="text-sm text-muted-foreground">
              Content and practice questions match current SSAT format and difficulty
            </p>
          </div>

          <div className="text-center p-6 bg-background rounded-lg border">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <Library className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Regularly Refined</h3>
            <p className="text-sm text-muted-foreground">
              Continuously updated based on SSAT changes and student feedback
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
