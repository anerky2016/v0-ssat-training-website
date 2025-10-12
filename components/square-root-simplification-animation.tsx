"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, RotateCcw } from "lucide-react"
import { MathJax } from "better-react-mathjax"

export function SquareRootSimplificationAnimation() {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (isPlaying && step < 4) {
      const timer = setTimeout(() => {
        setStep(step + 1)
      }, 2000)
      return () => clearTimeout(timer)
    } else if (step >= 4) {
      setIsPlaying(false)
    }
  }, [isPlaying, step])

  const startAnimation = () => {
    setStep(0)
    setIsPlaying(true)
  }

  const resetAnimation = () => {
    setStep(0)
    setIsPlaying(false)
  }

  return (
    <Card className="border-chart-4/30 bg-gradient-to-br from-chart-4/5 to-background">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Interactive Simplification for Example 3</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={startAnimation}
                disabled={isPlaying}
              >
                <Play className="h-4 w-4 mr-1" />
                {step === 0 ? "Start" : "Play"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetAnimation}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Animation Area */}
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 p-6 bg-muted/30 rounded-lg">

            {/* Step 0: Original Problem */}
            <div className={`w-full transition-all duration-500 ${step >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className={`p-4 rounded-lg border-2 transition-all ${
                step === 0 ? 'border-chart-4 bg-chart-4/10' : 'border-muted bg-muted/50'
              }`}>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground mb-2">Original Problem:</p>
                  <MathJax>{"\\[\\sqrt{50}\\]"}</MathJax>
                </div>
              </div>
            </div>

            {/* Step 1: Factor 50 */}
            {step >= 1 && (
              <div className={`w-full transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  step === 1 ? 'border-chart-4 bg-chart-4/10' : 'border-muted bg-muted/50'
                }`}>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground mb-2">Step 1: Factor out perfect square</p>
                    <div className="flex items-center gap-4 justify-center">
                      <MathJax>{"\\[\\sqrt{50}\\]"}</MathJax>
                      <span className="text-2xl">→</span>
                      <MathJax>{"\\[\\sqrt{25 \\times 2}\\]"}</MathJax>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">50 = 25 × 2 (25 is a perfect square!)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Apply Product Rule */}
            {step >= 2 && (
              <div className={`w-full transition-all duration-500 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  step === 2 ? 'border-chart-4 bg-chart-4/10' : 'border-muted bg-muted/50'
                }`}>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground mb-2">Step 2: Split using product rule</p>
                    <div className="flex items-center gap-4 justify-center flex-wrap">
                      <MathJax>{"\\[\\sqrt{25 \\times 2}\\]"}</MathJax>
                      <span className="text-2xl">→</span>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-2 bg-chart-4/20 rounded-lg border-2 border-chart-4/40">
                          <MathJax>{"\\[\\sqrt{25}\\]"}</MathJax>
                        </div>
                        <span className="text-xl">×</span>
                        <div className="px-3 py-2 bg-chart-4/20 rounded-lg border-2 border-chart-4/40">
                          <MathJax>{"\\[\\sqrt{2}\\]"}</MathJax>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">√(a × b) = √a × √b</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Simplify √25 */}
            {step >= 3 && (
              <div className={`w-full transition-all duration-500 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  step === 3 ? 'border-chart-4 bg-chart-4/10' : 'border-muted bg-muted/50'
                }`}>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground mb-2">Step 3: Simplify perfect square</p>
                    <div className="flex items-center gap-4 justify-center flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-2 bg-chart-4/20 rounded-lg border-2 border-chart-4/40 relative">
                          <MathJax>{"\\[\\sqrt{25}\\]"}</MathJax>
                          <div className="absolute inset-0 bg-chart-4/30 rounded-lg animate-pulse"></div>
                        </div>
                        <span className="text-xl">×</span>
                        <div className="px-3 py-2 bg-chart-4/20 rounded-lg border-2 border-chart-4/40">
                          <MathJax>{"\\[\\sqrt{2}\\]"}</MathJax>
                        </div>
                      </div>
                      <span className="text-2xl">→</span>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-2 bg-green-500/20 rounded-lg border-2 border-green-500/40">
                          <MathJax>{"\\[5\\]"}</MathJax>
                        </div>
                        <span className="text-xl">×</span>
                        <div className="px-3 py-2 bg-chart-4/20 rounded-lg border-2 border-chart-4/40">
                          <MathJax>{"\\[\\sqrt{2}\\]"}</MathJax>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">√25 = 5 (because 5² = 25)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Final Answer */}
            {step >= 4 && (
              <div className={`w-full transition-all duration-500 ${step >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  step === 4 ? 'border-green-500 bg-green-500/10' : 'border-muted bg-muted/50'
                }`}>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground mb-2">Final Simplified Form:</p>
                    <div className="px-6 py-4 bg-green-500/20 rounded-xl border-2 border-green-500/40">
                      <MathJax>{"\\[5\\sqrt{2}\\]"}</MathJax>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">✓ No perfect square factors remain under the radical</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  step >= i ? 'bg-chart-4 scale-110' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
