"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2 } from "lucide-react"
import { MathJax } from "better-react-mathjax"

interface DecimalDivisionAnimationProps {
  dividend?: number
  divisor?: number
}

type AnimationScene =
  | "setup"
  | "shift-both"
  | "long-division-setup"
  | "divide-step1"
  | "divide-step2"
  | "divide-step3"
  | "final"

export function DecimalDivisionAnimation({
  dividend = 4.2,
  divisor = 0.7
}: DecimalDivisionAnimationProps) {
  const [currentScene, setCurrentScene] = useState<AnimationScene>("setup")
  const [isPlaying, setIsPlaying] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const liveRegionRef = useRef<HTMLDivElement>(null)

  // Calculate decimal places and shifted values
  const divisorDecimalPlaces = divisor.toString().split('.')[1]?.length || 0
  const multiplier = Math.pow(10, divisorDecimalPlaces)
  const shiftedDivisor = Math.round(divisor * multiplier)
  const shiftedDividend = Math.round(dividend * multiplier * 10) / 10 // Keep one decimal for display
  const rawQuotient = dividend / divisor
  const quotient = Math.round(rawQuotient * 100) / 100

  const scenes: AnimationScene[] = [
    "setup",
    "shift-both",
    "long-division-setup",
    "divide-step1",
    "divide-step2",
    "divide-step3",
    "final"
  ]

  const sceneDurations: Record<AnimationScene, number> = {
    "setup": 4000,
    "shift-both": 4000,
    "long-division-setup": 4000,
    "divide-step1": 4000,
    "divide-step2": 4000,
    "divide-step3": 4000,
    "final": 0
  }

  const announcements: Record<AnimationScene, string> = {
    "setup": `Let's divide ${dividend} by ${divisor}. The divisor is not a whole number.`,
    "shift-both": `Multiply both by ${multiplier} to make the divisor whole`,
    "long-division-setup": `Set up long division with ${shiftedDividend} divided by ${shiftedDivisor}`,
    "divide-step1": `Step A: ${shiftedDivisor} into 4 equals 0`,
    "divide-step2": `Step B: ${shiftedDivisor} into 42 equals 6`,
    "divide-step3": `Step C: Bring down 0, complete the division`,
    "final": `Final answer: ${dividend} divided by ${divisor} equals ${quotient}`
  }

  useEffect(() => {
    if (liveRegionRef.current && announcements[currentScene]) {
      liveRegionRef.current.textContent = announcements[currentScene]
    }
  }, [currentScene, announcements])

  useEffect(() => {
    if (isPlaying && currentScene !== "final") {
      const currentIndex = scenes.indexOf(currentScene)
      const duration = sceneDurations[currentScene]

      timeoutRef.current = setTimeout(() => {
        if (currentIndex < scenes.length - 1) {
          setCurrentScene(scenes[currentIndex + 1])
        } else {
          setIsPlaying(false)
        }
      }, duration)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isPlaying, currentScene, scenes, sceneDurations])

  const reset = () => {
    setCurrentScene("setup")
    setIsPlaying(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const stepForward = () => {
    const currentIndex = scenes.indexOf(currentScene)
    if (currentIndex < scenes.length - 1) {
      setCurrentScene(scenes[currentIndex + 1])
      setIsPlaying(false)
    }
  }

  const sceneIndex = scenes.indexOf(currentScene)

  return (
    <Card className="border-2 border-border shadow-lg overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-base sm:text-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-foreground font-bold">
              Dividing Decimals Animation
            </span>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={togglePlay}
                disabled={currentScene === "final"}
                className="gap-2 shadow-md"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={stepForward}
                disabled={currentScene === "final"}
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
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Live region for screen readers */}
        <div
          ref={liveRegionRef}
          role="status"
          aria-live="polite"
          className="sr-only"
        />

        {/* Scene 1: Problem Setup */}
        {sceneIndex >= 0 && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-4 text-center text-foreground">
              Let's divide {dividend} ÷ {divisor}
            </h2>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="relative">
                <div className="text-6xl font-bold text-foreground">
                  {dividend}
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                  Dividend
                </div>
              </div>
              <div className="text-4xl font-bold text-muted-foreground">÷</div>
              <div className="relative">
                <div className="text-6xl font-bold text-foreground">
                  {divisor}
                </div>
                {sceneIndex === 0 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary/60 rounded-full animate-ping"></div>
                )}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                  Divisor
                </div>
              </div>
            </div>
            <p className="text-center text-lg text-muted-foreground mt-8">
              If the divisor isn't a whole number, make it one.
            </p>
          </div>
        )}

        {/* Scene 2: Shift Both Numbers */}
        {sceneIndex >= 1 && (
          <div className="animate-in fade-in duration-500 border-t pt-6">
            <p className="text-xl font-semibold mb-4 text-primary">
              Step 1: Shift to make divisor whole (×{multiplier})
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4 justify-center">
                <div className="text-sm font-bold text-primary px-2 py-1 bg-primary/10 rounded">×{multiplier}</div>
                <div className="text-4xl font-bold text-muted-foreground opacity-50 line-through">
                  {divisor}
                </div>
                <div className="text-3xl text-muted-foreground">→</div>
                <div className="text-4xl font-bold text-foreground">
                  {shiftedDivisor}
                </div>
                <div className="text-sm text-muted-foreground">(whole!)</div>
              </div>
              <div className="flex items-center gap-4 justify-center">
                <div className="text-sm font-bold text-primary px-2 py-1 bg-primary/10 rounded">×{multiplier}</div>
                <div className="text-4xl font-bold text-muted-foreground opacity-50 line-through">
                  {dividend}
                </div>
                <div className="text-3xl text-muted-foreground">→</div>
                <div className="text-4xl font-bold text-foreground flex items-baseline gap-0">
                  <span>42</span>
                  <span className="text-primary">.</span>
                  <span className="opacity-40">0</span>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-2xl font-bold text-foreground">
                {shiftedDividend} ÷ {shiftedDivisor}
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg max-w-xl mx-auto">
              <p className="text-sm text-center text-muted-foreground">
                We multiply both by {multiplier}; the value of the division stays the same.
              </p>
            </div>
          </div>
        )}

        {/* Scene 3: Long Division Setup */}
        {sceneIndex >= 2 && (
          <div className="animate-in fade-in duration-500 border-t pt-6">
            <p className="text-xl font-semibold mb-6 text-primary">
              Step 2: Set up long division
            </p>
            <div className="bg-muted/30 rounded-lg p-8 font-mono max-w-lg mx-auto relative">
              {/* Vertical dashed guide */}
              <div className="absolute left-[60%] top-0 bottom-0 w-px border-l-2 border-dashed border-primary/30"></div>

              <div className="flex items-start gap-2">
                {/* Quotient area with ghost decimal */}
                <div className="flex-1 text-right pr-4 border-b-2 border-foreground pb-2">
                  <div className="text-3xl font-bold flex items-baseline justify-end gap-1">
                    <span className="opacity-30">_</span>
                    <span className="text-primary/40 text-4xl animate-pulse">.</span>
                    <span className="opacity-30">_</span>
                  </div>
                </div>
                {/* Division bracket */}
                <div className="space-y-1">
                  <div className="text-xl">{shiftedDivisor} )</div>
                  <div className="text-3xl font-bold flex items-baseline gap-1">
                    <span>42</span>
                    <span className="text-primary text-4xl animate-pulse">.</span>
                    <span className="opacity-40">0</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              A dashed guide shows where to place the decimal in the quotient (directly above)
            </p>
          </div>
        )}

        {/* Scene 4: Division Step A - 7 into 4 */}
        {sceneIndex >= 3 && (
          <div className="animate-in fade-in duration-500 border-t pt-6">
            <p className="text-xl font-semibold mb-6 text-primary">
              Step A: 7 into 4
            </p>
            <div className="bg-muted/30 rounded-lg p-8 font-mono max-w-lg mx-auto space-y-4">
              <div className="flex items-start gap-2">
                <div className="flex-1 text-right pr-4 border-b-2 border-foreground pb-2">
                  <div className="text-3xl font-bold flex items-baseline justify-end gap-1">
                    <span className="text-primary opacity-50">0</span>
                    <span className="opacity-30">_</span>
                    <span className="text-primary/30 text-4xl">.</span>
                    <span className="opacity-30">_</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xl">{shiftedDivisor} )</div>
                  <div className="text-3xl font-bold flex items-baseline gap-1">
                    <span className="bg-primary/10 px-1">4</span>
                    <span>2</span>
                    <span className="text-primary text-4xl">.</span>
                    <span className="opacity-40">0</span>
                  </div>
                </div>
              </div>
              <div className="text-right pr-16">
                <div className="text-lg text-muted-foreground">7 into 4 = 0 (7 is bigger than 4)</div>
                <div className="text-base text-muted-foreground italic">Continue to next digit...</div>
              </div>
            </div>
          </div>
        )}

        {/* Scene 5: Division Step B - 7 into 42 */}
        {sceneIndex >= 4 && (
          <div className="animate-in fade-in duration-500 border-t pt-6">
            <p className="text-xl font-semibold mb-6 text-primary">
              Step B: 7 into 42
            </p>
            <div className="bg-muted/30 rounded-lg p-8 font-mono max-w-lg mx-auto space-y-4">
              <div className="flex items-start gap-2">
                <div className="flex-1 text-right pr-4 border-b-2 border-foreground pb-2">
                  <div className="text-3xl font-bold flex items-baseline justify-end gap-1">
                    <span className="text-primary">6</span>
                    <span className="text-primary/30 text-4xl">.</span>
                    <span className="opacity-30">_</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xl">{shiftedDivisor} )</div>
                  <div className="text-3xl font-bold flex items-baseline gap-1">
                    <span className="bg-primary/10 px-1">42</span>
                    <span className="text-primary text-4xl">.</span>
                    <span className="opacity-40">0</span>
                  </div>
                </div>
              </div>
              <div className="text-right pr-16 space-y-2">
                <div className="text-lg text-muted-foreground">7 into 42 = 6</div>
                <div className="text-xl">6 × 7 = <span className="underline">42</span></div>
                <div className="text-xl mt-1">42 - 42 = 0</div>
              </div>
            </div>
          </div>
        )}

        {/* Scene 6: Division Step C - Bring down 0 */}
        {sceneIndex >= 5 && (
          <div className="animate-in fade-in duration-500 border-t pt-6">
            <p className="text-xl font-semibold mb-6 text-primary">
              Step C: Bring down the 0
            </p>
            <div className="bg-muted/30 rounded-lg p-8 font-mono max-w-lg mx-auto space-y-4">
              <div className="flex items-start gap-2">
                <div className="flex-1 text-right pr-4 border-b-2 border-foreground pb-2">
                  <div className="text-3xl font-bold flex items-baseline justify-end gap-1">
                    <span>6</span>
                    <span className="text-primary text-4xl">.</span>
                    <span className="text-primary opacity-40">0</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xl">{shiftedDivisor} )</div>
                  <div className="text-3xl font-bold flex items-baseline gap-1">
                    <span>42</span>
                    <span className="text-primary text-4xl">.</span>
                    <span className="bg-primary/10 px-1 opacity-40">0</span>
                  </div>
                </div>
              </div>
              <div className="text-right pr-16 space-y-2">
                <div className="text-lg text-muted-foreground">7 into 0 = 0</div>
                <div className="text-base text-muted-foreground italic">Division complete!</div>
              </div>
            </div>
            <p className="text-center text-lg font-bold text-primary mt-4">
              42 ÷ 7 = 6
            </p>
          </div>
        )}

        {/* Scene 7: Final Answer */}
        {sceneIndex >= 6 && (
          <div className="animate-in fade-in zoom-in duration-700 border-t pt-6">
            <div className="mb-6 text-center">
              <div className="text-5xl font-bold mb-4">
                <MathJax>{`\\[${dividend} \\div ${divisor} = ${quotient}\\]`}</MathJax>
              </div>
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-2xl shadow-xl">
                <CheckCircle2 className="h-8 w-8" />
                <span className="text-2xl font-bold">Perfect!</span>
              </div>
            </div>
            <div className="max-w-md mx-auto text-center p-6 bg-muted/50 rounded-xl">
              <p className="text-lg font-semibold text-muted-foreground">
                "Shift both numbers (×{multiplier}), divide like whole numbers, put the decimal above the dividend's decimal."
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
