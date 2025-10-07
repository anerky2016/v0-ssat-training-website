"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, RotateCcw, CheckCircle2 } from "lucide-react"
import { MathJax } from "better-react-mathjax"

interface BucketVisualizationProps {
  numeratorExponent: number
  denominatorExponent: number
  base?: string
}

export function BucketVisualization({
  numeratorExponent,
  denominatorExponent,
  base = "x"
}: BucketVisualizationProps) {
  const [canceledPairs, setCanceledPairs] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const maxPairs = Math.min(numeratorExponent, denominatorExponent)

  const reset = () => {
    setCanceledPairs(0)
    setIsAnimating(false)
  }

  const animate = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCanceledPairs(0)

    let count = 0
    const interval = setInterval(() => {
      count++
      setCanceledPairs(count)

      if (count >= maxPairs) {
        clearInterval(interval)
        setIsAnimating(false)
      }
    }, 700)
  }

  const remainingTop = numeratorExponent - canceledPairs
  const remainingBottom = denominatorExponent - canceledPairs

  // Determine result
  let resultText = ""
  let resultLatex = ""
  if (canceledPairs === maxPairs) {
    if (numeratorExponent === denominatorExponent) {
      resultText = "All buckets canceled!"
      resultLatex = "1"
    } else if (numeratorExponent > denominatorExponent) {
      resultText = `${numeratorExponent - denominatorExponent} bucket${numeratorExponent - denominatorExponent > 1 ? 's' : ''} left on top`
      resultLatex = base + "^{" + (numeratorExponent - denominatorExponent) + "}"
    } else {
      resultText = `${denominatorExponent - numeratorExponent} bucket${denominatorExponent - numeratorExponent > 1 ? 's' : ''} left on bottom`
      resultLatex = "\\frac{1}{" + base + "^{" + (denominatorExponent - numeratorExponent) + "}}"
    }
  }

  return (
    <Card className="border-2 border-primary/30 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <CardTitle className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <MathJax>{"\\[" + base + "^{" + numeratorExponent + "} \\div " + base + "^{" + denominatorExponent + "}\\]"}</MathJax>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={animate}
              disabled={isAnimating || canceledPairs >= maxPairs}
              className="gap-2 shadow-md"
            >
              <Play className="h-4 w-4" />
              {canceledPairs === 0 ? "Start" : "Continue"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              disabled={canceledPairs === 0}
              className="shadow-md"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Numerator (top) */}
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
                  i < canceledPairs
                    ? "opacity-20 scale-75 blur-[1px]"
                    : "opacity-100 scale-100"
                }`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-blue-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <span className="relative z-10">{base}</span>
                </div>
                {i < canceledPairs && (
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

        {/* Denominator (bottom) */}
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
                  i < canceledPairs
                    ? "opacity-20 scale-75 blur-[1px]"
                    : "opacity-100 scale-100"
                }`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-green-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <span className="relative z-10">{base}</span>
                </div>
                {i < canceledPairs && (
                  <div className="absolute inset-0 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="w-16 h-1 bg-red-600 rounded-full rotate-45 absolute shadow-lg"></div>
                    <div className="w-16 h-1 bg-red-600 rounded-full -rotate-45 absolute shadow-lg"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 p-5 bg-gradient-to-br from-muted/50 to-muted rounded-xl border-2 border-border space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Cancellation Progress:</span>
            <span className="text-primary font-bold">{canceledPairs} / {maxPairs} pairs</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-xs text-muted-foreground mb-1">Top remaining</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{remainingTop}</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-xs text-muted-foreground mb-1">Bottom remaining</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{remainingBottom}</div>
            </div>
          </div>

          {resultText && (
            <div className="pt-3 border-t-2 border-border mt-3 animate-in slide-in-from-bottom duration-500">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">{resultText}</div>
                  <div className="text-lg font-bold text-primary bg-primary/10 px-3 py-2 rounded-lg inline-block">
                    <MathJax inline>{"\\(" + resultLatex + "\\)"}</MathJax>
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
