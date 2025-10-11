"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react"
import { MathJax } from "better-react-mathjax"

interface DecimalMultiplicationVisualizationProps {
  num1?: number
  num2?: number
}

type AnimationStep =
  | "intro"
  | "grid"
  | "cell-2x1"
  | "cell-2x0.4"
  | "cell-0.3x1"
  | "cell-0.3x0.4"
  | "combine-start"
  | "combine-2"
  | "combine-2.8"
  | "combine-3.1"
  | "combine-3.22"
  | "decimal-check"
  | "complete"

export function DecimalMultiplicationVisualization({
  num1 = 2.3,
  num2 = 1.4
}: DecimalMultiplicationVisualizationProps) {
  const [currentStep, setCurrentStep] = useState<AnimationStep>("intro")
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState([1])
  const [runningSum, setRunningSum] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const liveRegionRef = useRef<HTMLDivElement>(null)

  // Parse numbers into parts
  const whole1 = Math.floor(num1)
  const decimal1 = Math.round((num1 - whole1) * 10) / 10
  const whole2 = Math.floor(num2)
  const decimal2 = Math.round((num2 - whole2) * 10) / 10

  // Calculate products
  const product_2x1 = whole1 * whole2
  const product_2x04 = whole1 * decimal2
  const product_03x1 = decimal1 * whole2
  const product_03x04 = decimal1 * decimal2

  const steps: AnimationStep[] = [
    "intro",
    "grid",
    "cell-2x1",
    "cell-2x0.4",
    "cell-0.3x1",
    "cell-0.3x0.4",
    "combine-start",
    "combine-2",
    "combine-2.8",
    "combine-3.1",
    "combine-3.22",
    "decimal-check",
    "complete"
  ]

  const stepDurations: Record<AnimationStep, number> = {
    "intro": 1200,
    "grid": 800,
    "cell-2x1": 1000,
    "cell-2x0.4": 1000,
    "cell-0.3x1": 1000,
    "cell-0.3x0.4": 1200,
    "combine-start": 600,
    "combine-2": 600,
    "combine-2.8": 600,
    "combine-3.1": 600,
    "combine-3.22": 800,
    "decimal-check": 1500,
    "complete": 0
  }

  const announcements: Record<AnimationStep, string> = {
    "intro": `Breaking down ${num1} equals ${whole1} plus ${decimal1}, and ${num2} equals ${whole2} plus ${decimal2}`,
    "grid": "Creating area model grid",
    "cell-2x1": `Multiplying ${whole1} times ${whole2} equals ${product_2x1}`,
    "cell-2x0.4": `Multiplying ${whole1} times ${decimal2} equals ${product_2x04}`,
    "cell-0.3x1": `Multiplying ${decimal1} times ${whole2} equals ${product_03x1}`,
    "cell-0.3x0.4": `Multiplying ${decimal1} times ${decimal2} equals ${product_03x04}. Tenths times tenths equals hundredths`,
    "combine-start": "Now combining all partial products",
    "combine-2": `Starting with ${product_2x1}`,
    "combine-2.8": `Adding ${product_2x04} to get ${product_2x1 + product_2x04}`,
    "combine-3.1": `Adding ${product_03x1} to get ${product_2x1 + product_2x04 + product_03x1}`,
    "combine-3.22": `Adding ${product_03x04} to get final answer ${num1 * num2}`,
    "decimal-check": "Checking decimal places: 1 decimal place times 1 decimal place gives 2 decimal places",
    "complete": `Final answer: ${num1} times ${num2} equals ${num1 * num2}`
  }

  useEffect(() => {
    if (liveRegionRef.current && announcements[currentStep]) {
      liveRegionRef.current.textContent = announcements[currentStep]
    }
  }, [currentStep, announcements])

  useEffect(() => {
    if (isPlaying && currentStep !== "complete") {
      const currentIndex = steps.indexOf(currentStep)
      const duration = stepDurations[currentStep] / speed[0]

      timeoutRef.current = setTimeout(() => {
        if (currentIndex < steps.length - 1) {
          setCurrentStep(steps[currentIndex + 1])
        } else {
          setIsPlaying(false)
        }
      }, duration)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isPlaying, currentStep, speed, steps, stepDurations])

  const reset = () => {
    setCurrentStep("intro")
    setIsPlaying(false)
    setRunningSum(0)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const stepForward = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
      setIsPlaying(false)
    }
  }

  const stepIndex = steps.indexOf(currentStep)
  const showGrid = stepIndex >= 1
  const showCell_2x1 = stepIndex >= 2
  const fillCell_2x1 = stepIndex >= 2
  const showCell_2x04 = stepIndex >= 3
  const fillCell_2x04 = stepIndex >= 3
  const showCell_03x1 = stepIndex >= 4
  const fillCell_03x1 = stepIndex >= 4
  const showCell_03x04 = stepIndex >= 5
  const fillCell_03x04 = stepIndex >= 5
  const showCombine = stepIndex >= 6

  return (
    <Card className="border-2 border-primary/30 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 pb-4">
        <CardTitle className="text-base sm:text-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-purple-600 dark:text-purple-400 font-bold">
                Area Model: Decimal Multiplication
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={togglePlay}
                disabled={currentStep === "complete"}
                className="gap-2 shadow-md"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={stepForward}
                disabled={currentStep === "complete"}
                className="gap-2 shadow-md"
              >
                <SkipForward className="h-4 w-4" />
                Step
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={reset}
                className="shadow-md"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Speed:</span>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              min={0.5}
              max={2}
              step={0.5}
              className="w-32"
            />
            <span className="text-sm font-mono">{speed[0]}×</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Live region for screen readers */}
        <div
          ref={liveRegionRef}
          role="status"
          aria-live="polite"
          className="sr-only"
        />

        {/* Intro: Number decomposition */}
        <div className="mb-6">
          <div className={`flex flex-wrap gap-4 items-center justify-center transition-all duration-500 ${
            stepIndex >= 0 ? "opacity-100" : "opacity-0"
          }`}>
            <div className="text-center">
              <MathJax>{`\\[${num1} = ${whole1} + ${decimal1}\\]`}</MathJax>
              {stepIndex >= 0 && (
                <div className="flex gap-2 mt-2 justify-center">
                  <div className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold shadow-lg transition-all duration-500 animate-in slide-in-from-top">
                    {whole1}
                  </div>
                  <div className="px-4 py-2 bg-blue-400 text-white rounded-lg font-bold shadow-lg transition-all duration-500 animate-in slide-in-from-top delay-200">
                    {decimal1}
                  </div>
                </div>
              )}
            </div>
            <span className="text-2xl font-bold text-muted-foreground">×</span>
            <div className="text-center">
              <MathJax>{`\\[${num2} = ${whole2} + ${decimal2}\\]`}</MathJax>
              {stepIndex >= 0 && (
                <div className="flex gap-2 mt-2 justify-center">
                  <div className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold shadow-lg transition-all duration-500 animate-in slide-in-from-left">
                    {whole2}
                  </div>
                  <div className="px-4 py-2 bg-green-400 text-white rounded-lg font-bold shadow-lg transition-all duration-500 animate-in slide-in-from-left delay-200">
                    {decimal2}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid Area Model */}
        {showGrid && (
          <div className={`mb-6 transition-all duration-800 ${showGrid ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
            <div className="inline-block border-4 border-gray-400 rounded-lg overflow-hidden shadow-xl">
              {/* Column headers */}
              <div className="grid grid-cols-[auto_1fr_1fr] gap-0">
                <div className="w-20"></div>
                <div className="h-16 bg-blue-500 text-white flex items-center justify-center font-bold text-xl border-r-2 border-white">
                  {whole1}
                </div>
                <div className="h-16 bg-blue-400 text-white flex items-center justify-center font-bold text-xl">
                  {decimal1}
                </div>

                {/* Row 1: whole2 */}
                <div className="w-20 h-24 bg-green-500 text-white flex items-center justify-center font-bold text-xl border-b-2 border-white">
                  {whole2}
                </div>
                <div className={`h-24 border-r-2 border-b-2 border-white relative overflow-hidden ${
                  fillCell_2x1 ? "bg-gradient-to-br from-blue-300 to-green-300" : "bg-gray-100"
                }`}>
                  {fillCell_2x1 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-green-400/50 animate-in slide-in-from-left duration-700" />
                  )}
                  {showCell_2x1 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-3xl font-bold text-gray-800 animate-in fade-in duration-300 delay-500">
                        {product_2x1}
                      </div>
                    </div>
                  )}
                </div>
                <div className={`h-24 border-b-2 border-white relative overflow-hidden ${
                  fillCell_2x04 ? "bg-gradient-to-br from-blue-200 to-green-300" : "bg-gray-100"
                }`}>
                  {fillCell_2x04 && (
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-400/50 to-green-400/50 animate-in slide-in-from-top duration-700" />
                  )}
                  {showCell_2x04 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-3xl font-bold text-gray-800 animate-in fade-in duration-300 delay-500">
                        {product_2x04}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 2: decimal2 */}
                <div className="w-20 h-24 bg-green-400 text-white flex items-center justify-center font-bold text-xl">
                  {decimal2}
                </div>
                <div className={`h-24 border-r-2 border-white relative overflow-hidden ${
                  fillCell_03x1 ? "bg-gradient-to-br from-blue-300 to-green-200" : "bg-gray-100"
                }`}>
                  {fillCell_03x1 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-green-400/50 animate-in slide-in-from-left duration-700" />
                  )}
                  {showCell_03x1 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-3xl font-bold text-gray-800 animate-in fade-in duration-300 delay-500">
                        {product_03x1}
                      </div>
                    </div>
                  )}
                </div>
                <div className={`h-24 relative overflow-hidden ${
                  fillCell_03x04 ? "bg-gradient-to-br from-blue-200 to-green-200" : "bg-gray-100"
                }`}>
                  {fillCell_03x04 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 via-purple-400/40 to-green-400/40 animate-in zoom-in duration-700" />
                  )}
                  {showCell_03x04 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-gray-800 animate-in fade-in duration-300 delay-500">
                        {product_03x04}
                      </div>
                      {stepIndex === 5 && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full mt-2 bg-purple-600 text-white text-xs px-3 py-1 rounded-lg shadow-lg whitespace-nowrap animate-in slide-in-from-top duration-500 delay-700 z-10">
                          tenths × tenths = hundredths
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Combining partials */}
        {showCombine && (
          <div className={`mt-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 transition-all duration-500 ${
            showCombine ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}>
            <h3 className="text-lg font-bold mb-4 text-purple-700 dark:text-purple-400">Combining Partial Products:</h3>
            <div className="space-y-3">
              <div className={`flex items-center gap-3 transition-all duration-400 ${
                stepIndex >= 7 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}>
                <div className="w-32 text-right font-mono text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {product_2x1}
                </div>
                <div className="text-sm text-muted-foreground">Start</div>
              </div>

              <div className={`flex items-center gap-3 transition-all duration-400 ${
                stepIndex >= 8 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}>
                <div className="w-32 text-right font-mono text-xl text-purple-600 dark:text-purple-400">
                  + {product_2x04}
                </div>
                <div className="text-sm text-muted-foreground">
                  → <span className="font-bold text-lg">{(product_2x1 + product_2x04).toFixed(1)}</span>
                </div>
              </div>

              <div className={`flex items-center gap-3 transition-all duration-400 ${
                stepIndex >= 9 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}>
                <div className="w-32 text-right font-mono text-xl text-purple-600 dark:text-purple-400">
                  + {product_03x1}
                </div>
                <div className="text-sm text-muted-foreground">
                  → <span className="font-bold text-lg">{(product_2x1 + product_2x04 + product_03x1).toFixed(1)}</span>
                </div>
              </div>

              <div className={`flex items-center gap-3 transition-all duration-400 ${
                stepIndex >= 10 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}>
                <div className="w-32 text-right font-mono text-xl text-purple-600 dark:text-purple-400">
                  + {product_03x04}
                </div>
                <div className="text-sm text-muted-foreground">
                  → <span className="font-bold text-lg">{(num1 * num2).toFixed(2)}</span>
                </div>
              </div>

              {stepIndex >= 10 && (
                <div className="pt-4 border-t-2 border-purple-300 dark:border-purple-700 mt-4 animate-in slide-in-from-bottom duration-500">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl font-bold text-purple-700 dark:text-purple-300">Final Answer:</span>
                    <div className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg text-2xl font-bold animate-in zoom-in duration-500">
                      <MathJax inline>{`\\(${num1} \\times ${num2} = ${(num1 * num2).toFixed(2)}\\)`}</MathJax>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Decimal sense check */}
        {stepIndex >= 11 && (
          <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border-2 border-amber-300 dark:border-amber-700 animate-in slide-in-from-bottom duration-700">
            <h3 className="text-lg font-bold mb-3 text-amber-700 dark:text-amber-400">✓ Decimal Place Check</h3>
            <div className="flex flex-wrap items-center justify-center gap-4 text-base">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold">{num1}</span>
                <div className="px-2 py-1 bg-amber-200 dark:bg-amber-900 rounded text-sm font-semibold">
                  1 decimal place
                </div>
              </div>
              <span className="text-2xl font-bold">×</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold">{num2}</span>
                <div className="px-2 py-1 bg-amber-200 dark:bg-amber-900 rounded text-sm font-semibold">
                  1 decimal place
                </div>
              </div>
              <span className="text-2xl font-bold">→</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold">{(num1 * num2).toFixed(2)}</span>
                <div className="px-2 py-1 bg-green-200 dark:bg-green-900 rounded text-sm font-semibold">
                  2 decimal places
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
