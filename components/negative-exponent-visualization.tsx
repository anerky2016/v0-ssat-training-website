"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, RotateCcw, ArrowDown, CheckCircle2 } from "lucide-react"
import { MathJax } from "better-react-mathjax"

interface NegativeExponentVisualizationProps {
  numeratorExponent: number
  denominatorExponent: number
  base?: string
}

export function NegativeExponentVisualization({
  numeratorExponent,
  denominatorExponent,
  base = "x"
}: NegativeExponentVisualizationProps) {
  const [step, setStep] = useState(0) // 0: initial, 1: canceling, 2: result with negative, 3: flip to denominator
  const [isAnimating, setIsAnimating] = useState(false)

  const maxPairs = Math.min(numeratorExponent, denominatorExponent)
  const leftoverBottom = denominatorExponent - numeratorExponent

  const reset = () => {
    setStep(0)
    setIsAnimating(false)
  }

  const nextStep = () => {
    if (isAnimating) return
    setIsAnimating(true)

    if (step < 3) {
      setTimeout(() => {
        setStep(step + 1)
        setIsAnimating(false)
      }, 800)
    }
  }

  const autoPlay = () => {
    if (isAnimating || step > 0) return
    setIsAnimating(true)
    setStep(0)

    const steps = [1, 2, 3]
    let currentStep = 0

    const interval = setInterval(() => {
      setStep(steps[currentStep])
      currentStep++

      if (currentStep >= steps.length) {
        clearInterval(interval)
        setIsAnimating(false)
      }
    }, 2000)
  }

  return (
    <Card className="border-2 border-orange-300 dark:border-orange-700 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 pb-4">
        <CardTitle className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <MathJax>{"\\[" + base + "^{" + numeratorExponent + "} \\div " + base + "^{" + denominatorExponent + "}\\]"}</MathJax>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={autoPlay}
              disabled={isAnimating || step > 0}
              className="gap-2 shadow-md"
            >
              <Play className="h-4 w-4" />
              Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              disabled={step === 0}
              className="shadow-md"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Step 0 & 1: Show buckets and cancellation */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
              Numerator
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MathJax inline>{"\\(" + base + "^{" + numeratorExponent + "}\\)"}</MathJax>
              <span>= {numeratorExponent} bucket{numeratorExponent !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 min-h-[70px] p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            {Array.from({ length: numeratorExponent }).map((_, i) => (
              <div
                key={i}
                className={`relative transition-all duration-500 ${
                  step >= 1 ? "opacity-20 scale-75 blur-[1px]" : "opacity-100 scale-100"
                }`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-blue-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <span className="relative z-10">{base}</span>
                </div>
                {step >= 1 && (
                  <div className="absolute inset-0 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="w-16 h-1 bg-red-600 rounded-full rotate-45 absolute shadow-lg"></div>
                    <div className="w-16 h-1 bg-red-600 rounded-full -rotate-45 absolute shadow-lg"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dividing Line */}
        <div className="relative my-6">
          <div className="border-t-4 border-dashed border-foreground/30"></div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-background px-3 py-1 rounded-full border-2 border-foreground/20">
            <span className="text-lg font-bold text-foreground">÷</span>
          </div>
        </div>

        {/* Denominator */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs font-bold uppercase tracking-wide text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded">
              Denominator
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MathJax inline>{"\\(" + base + "^{" + denominatorExponent + "}\\)"}</MathJax>
              <span>= {denominatorExponent} bucket{denominatorExponent !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 min-h-[70px] p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
            {Array.from({ length: denominatorExponent }).map((_, i) => (
              <div
                key={i}
                className={`relative transition-all duration-500 ${
                  step >= 1 && i < maxPairs ? "opacity-20 scale-75 blur-[1px]" : "opacity-100 scale-100"
                }`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-green-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <span className="relative z-10">{base}</span>
                </div>
                {step >= 1 && i < maxPairs && (
                  <div className="absolute inset-0 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="w-16 h-1 bg-red-600 rounded-full rotate-45 absolute shadow-lg"></div>
                    <div className="w-16 h-1 bg-red-600 rounded-full -rotate-45 absolute shadow-lg"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step explanations */}
        <div className="space-y-4">
          {step >= 1 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg animate-in slide-in-from-bottom duration-500">
              <div className="flex items-start gap-2">
                <div className="text-2xl">1️⃣</div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Cancel matching pairs</div>
                  <div className="text-sm text-muted-foreground">
                    All {maxPairs} bucket{maxPairs !== 1 ? 's' : ''} from the top cancel with {maxPairs} from the bottom.
                  </div>
                </div>
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg animate-in slide-in-from-bottom duration-500">
              <div className="flex items-start gap-2">
                <div className="text-2xl">2️⃣</div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Leftover buckets on bottom</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {leftoverBottom} bucket{leftoverBottom !== 1 ? 's' : ''} remain on the bottom → This gives us a <strong>negative exponent</strong>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 px-3 py-2 rounded inline-block">
                    <MathJax inline>{"\\(" + base + "^{" + (numeratorExponent - denominatorExponent) + "}\\)"}</MathJax>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step >= 3 && (
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-400 dark:border-green-700 rounded-lg animate-in slide-in-from-bottom duration-500">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-foreground mb-1">3️⃣ Negative exponent = Flip to denominator!</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    A negative exponent means "move the base to the bottom with a positive exponent"
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-lg border-2 border-green-300 dark:border-green-700">
                      <MathJax inline>{"\\(" + base + "^{" + (numeratorExponent - denominatorExponent) + "}\\)"}</MathJax>
                    </div>
                    <ArrowDown className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-lg border-2 border-green-300 dark:border-green-700">
                      <MathJax inline>{"\\(\\frac{1}{" + base + "^{" + leftoverBottom + "}}\\)"}</MathJax>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
