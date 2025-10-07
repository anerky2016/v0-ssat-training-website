"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2 } from "lucide-react"
import { MathJax } from "better-react-mathjax"

interface DecimalMultiplicationAnimationProps {
  num1?: number
  num2?: number
}

type AnimationScene =
  | "setup"
  | "remove-decimals"
  | "multiply-step1"
  | "multiply-step2"
  | "multiply-step3"
  | "count-decimals"
  | "move-decimal-1"
  | "move-decimal-2"
  | "final"

export function DecimalMultiplicationAnimation({
  num1 = 2.3,
  num2 = 1.4
}: DecimalMultiplicationAnimationProps) {
  const [currentScene, setCurrentScene] = useState<AnimationScene>("setup")
  const [isPlaying, setIsPlaying] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const liveRegionRef = useRef<HTMLDivElement>(null)

  // Calculate values
  const whole1 = Math.floor(num1)
  const decimal1 = Math.round((num1 - whole1) * 10) / 10
  const decimalPlaces1 = decimal1 > 0 ? 1 : 0

  const whole2 = Math.floor(num2)
  const decimal2 = Math.round((num2 - whole2) * 10) / 10
  const decimalPlaces2 = decimal2 > 0 ? 1 : 0

  const totalDecimalPlaces = decimalPlaces1 + decimalPlaces2

  const wholeNum1 = Math.round(num1 * 10)
  const wholeNum2 = Math.round(num2 * 10)

  const product = wholeNum1 * wholeNum2
  const step1Result = wholeNum1 * (wholeNum2 % 10)
  const step2Result = wholeNum1 * Math.floor(wholeNum2 / 10) * 10

  const finalAnswer = num1 * num2

  const scenes: AnimationScene[] = [
    "setup",
    "remove-decimals",
    "multiply-step1",
    "multiply-step2",
    "multiply-step3",
    "count-decimals",
    "move-decimal-1",
    "move-decimal-2",
    "final"
  ]

  const sceneDurations: Record<AnimationScene, number> = {
    "setup": 3000,
    "remove-decimals": 3000,
    "multiply-step1": 2500,
    "multiply-step2": 2500,
    "multiply-step3": 2500,
    "count-decimals": 3000,
    "move-decimal-1": 2000,
    "move-decimal-2": 2000,
    "final": 0
  }

  const announcements: Record<AnimationScene, string> = {
    "setup": `Let's multiply ${num1} times ${num2}`,
    "remove-decimals": "Step 1: Ignore the decimals",
    "multiply-step1": `Multiply ${wholeNum2 % 10} times ${wholeNum1} equals ${step1Result}`,
    "multiply-step2": `Multiply ${Math.floor(wholeNum2 / 10)} times ${wholeNum1} equals ${step2Result}`,
    "multiply-step3": `Add them together to get ${product}`,
    "count-decimals": `Count decimal places: ${decimalPlaces1} plus ${decimalPlaces2} equals ${totalDecimalPlaces}`,
    "move-decimal-1": "Moving decimal point left, first step",
    "move-decimal-2": "Moving decimal point left, second step",
    "final": `Final answer: ${num1} times ${num2} equals ${finalAnswer}`
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
  const showDecimals = sceneIndex === 0
  const decimalsRemoved = sceneIndex >= 1
  const showMultiplication = sceneIndex >= 2
  const showStep1 = sceneIndex >= 2
  const showStep2 = sceneIndex >= 3
  const showStep3 = sceneIndex >= 4
  const showDecimalCount = sceneIndex >= 5
  const decimalPos = sceneIndex >= 6 ? (sceneIndex === 6 ? 1 : 2) : 0
  const showFinal = sceneIndex >= 8

  return (
    <Card className="border-2 border-border shadow-lg overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-base sm:text-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-foreground font-bold">
              Multiplying Decimals Animation
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
              Let's multiply {num1} × {num2}
            </h2>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="relative">
                <div className="text-6xl font-bold text-foreground">
                  {num1}
                </div>
                {sceneIndex === 0 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary/60 rounded-full animate-ping"></div>
                )}
              </div>
              <div className="text-4xl font-bold text-muted-foreground">×</div>
              <div className="relative">
                <div className="text-6xl font-bold text-foreground">
                  {num2}
                </div>
                {sceneIndex === 0 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary/60 rounded-full animate-ping" style={{ animationDelay: "150ms" }}></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scene 2: Remove Decimals */}
        {sceneIndex >= 1 && (
          <div className="animate-in fade-in duration-500 border-t pt-6">
            <p className="text-xl font-semibold mb-4 text-primary">
              Step 1: Ignore the decimals
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-6 justify-center">
                <div className="text-4xl font-bold text-muted-foreground opacity-50 line-through">
                  {num1}
                </div>
                <div className="text-3xl text-muted-foreground">→</div>
                <div className="text-4xl font-bold text-foreground">
                  {wholeNum1}
                </div>
              </div>
              <div className="flex items-center gap-6 justify-center">
                <div className="text-4xl font-bold text-muted-foreground opacity-50 line-through">
                  {num2}
                </div>
                <div className="text-3xl text-muted-foreground">→</div>
                <div className="text-4xl font-bold text-foreground">
                  {wholeNum2}
                </div>
              </div>
            </div>
            <p className="text-lg mt-4 text-center text-muted-foreground">
              Now multiply {wholeNum1} × {wholeNum2}
            </p>
          </div>
        )}

        {/* Scene 3-5: Do the Multiplication */}
        {sceneIndex >= 2 && (
          <div className="animate-in fade-in duration-500 border-t pt-6">
            <p className="text-xl font-semibold mb-6 text-primary">
              Step 2: Multiply like whole numbers
            </p>
            <div className="bg-muted/30 rounded-lg p-8 font-mono text-2xl space-y-2 max-w-md mx-auto">
              <div className="text-right mb-4">
                <div>{wholeNum1}</div>
                <div className="border-b-2 border-foreground pb-2">× {wholeNum2}</div>
              </div>

              {/* For single-digit multiplication (like 6 × 5), show result directly */}
              {wholeNum2 < 10 ? (
                showStep1 && (
                  <div className="text-right pt-2 mt-2">
                    <div className="text-3xl font-bold text-primary animate-in zoom-in duration-500">
                      {product}
                    </div>
                  </div>
                )
              ) : (
                // For multi-step multiplication (like 23 × 14)
                <>
                  {showStep1 && (
                    <div className={`text-right ${sceneIndex === 2 ? 'text-primary animate-in slide-in-from-right duration-500' : ''}`}>
                      {step1Result}
                    </div>
                  )}

                  {showStep2 && (
                    <div className={`text-right ${sceneIndex === 3 ? 'text-primary animate-in slide-in-from-right duration-500' : ''}`}>
                      + {step2Result}
                    </div>
                  )}

                  {showStep3 && (
                    <div className="text-right pt-2 mt-2">
                      <div className="text-3xl font-bold text-primary animate-in zoom-in duration-500 border-t-2 border-foreground pt-2">
                        {product}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {showStep3 && (
              <p className="text-lg mt-4 text-center text-muted-foreground">
                {wholeNum1} × {wholeNum2} = {product}
              </p>
            )}
          </div>
        )}

        {/* Scene 6: Count Decimal Places */}
        {sceneIndex >= 5 && (
          <div className="animate-in fade-in duration-500 border-t pt-6">
            <p className="text-xl font-semibold mb-6 text-primary">
              Step 3: Count the decimal places
            </p>
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-4 text-xl justify-center">
                <div className="text-foreground font-bold">{num1}</div>
                <div className="text-sm text-muted-foreground">has</div>
                <div className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg">
                  {decimalPlaces1}
                </div>
                <div className="text-sm text-muted-foreground">decimal place</div>
              </div>

              <div className="flex items-center gap-4 text-xl justify-center">
                <div className="text-foreground font-bold">{num2}</div>
                <div className="text-sm text-muted-foreground">has</div>
                <div className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg">
                  {decimalPlaces2}
                </div>
                <div className="text-sm text-muted-foreground">decimal place</div>
              </div>

              <div className="flex items-center justify-center gap-4 text-2xl pt-4 border-t-2 border-border">
                <div className="font-bold">{decimalPlaces1} + {decimalPlaces2} =</div>
                <div className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg">
                  {totalDecimalPlaces}
                </div>
                <div className="text-sm text-muted-foreground">places</div>
              </div>
            </div>
          </div>
        )}

        {/* Scene 7-8: Move the Decimal */}
        {sceneIndex >= 6 && (
          <div className="animate-in fade-in duration-500 border-t pt-6">
            <p className="text-xl font-semibold mb-6 text-primary text-center">
              Step 4: Move the decimal {totalDecimalPlaces} places left
            </p>
            <div className="relative text-7xl font-bold font-mono text-center">
              {(() => {
                const productStr = product.toString()
                const productLen = productStr.length

                if (decimalPos === 0) {
                  // Start position: decimal at the right (e.g., "30.")
                  return (
                    <div className="flex items-center gap-0 justify-center">
                      <span>{product}</span>
                      <span className="text-primary animate-pulse text-8xl">.</span>
                    </div>
                  )
                } else if (decimalPos === 1) {
                  // First hop left
                  if (totalDecimalPlaces >= productLen) {
                    // Case where we need leading zero eventually (e.g., 30 -> 3.0)
                    const decimalIndex = productLen - 1
                    return (
                      <div className="flex items-center gap-0 justify-center animate-in slide-in-from-right duration-700">
                        <span>{productStr.substring(0, decimalIndex)}</span>
                        <span className="text-primary animate-bounce text-8xl">.</span>
                        <span>{productStr.substring(decimalIndex)}</span>
                      </div>
                    )
                  } else {
                    // Normal case
                    const decimalIndex = productLen - 1
                    return (
                      <div className="flex items-center gap-0 justify-center animate-in slide-in-from-right duration-700">
                        <span>{productStr.substring(0, decimalIndex)}</span>
                        <span className="text-primary animate-bounce text-8xl">.</span>
                        <span>{productStr.substring(decimalIndex)}</span>
                      </div>
                    )
                  }
                } else if (decimalPos === 2) {
                  // Second hop left
                  if (totalDecimalPlaces >= productLen) {
                    // Need to add leading zero (e.g., 3.0 -> 0.30)
                    return (
                      <div className="flex items-center gap-0 justify-center animate-in slide-in-from-right duration-700">
                        <span>0</span>
                        <span className="text-primary animate-bounce text-8xl">.</span>
                        <span>{productStr}</span>
                      </div>
                    )
                  } else {
                    // Normal case
                    const decimalIndex = productLen - 2
                    return (
                      <div className="flex items-center gap-0 justify-center animate-in slide-in-from-right duration-700">
                        <span>{productStr.substring(0, decimalIndex)}</span>
                        <span className="text-primary animate-bounce text-8xl">.</span>
                        <span>{productStr.substring(decimalIndex)}</span>
                      </div>
                    )
                  }
                } else {
                  // Additional hops if needed
                  if (totalDecimalPlaces >= productLen) {
                    const zerosNeeded = decimalPos - productLen
                    return (
                      <div className="flex items-center gap-0 justify-center animate-in slide-in-from-right duration-700">
                        <span>{"0".repeat(zerosNeeded)}0</span>
                        <span className="text-primary animate-bounce text-8xl">.</span>
                        <span>{productStr}</span>
                      </div>
                    )
                  } else {
                    const decimalIndex = productLen - decimalPos
                    return (
                      <div className="flex items-center gap-0 justify-center animate-in slide-in-from-right duration-700">
                        <span>{productStr.substring(0, decimalIndex)}</span>
                        <span className="text-primary animate-bounce text-8xl">.</span>
                        <span>{productStr.substring(decimalIndex)}</span>
                      </div>
                    )
                  }
                }
              })()}
            </div>
            <div className="mt-6 flex items-center gap-3 justify-center">
              {Array.from({ length: totalDecimalPlaces }, (_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full ${decimalPos >= i + 1 ? 'bg-primary' : 'bg-muted'} transition-colors duration-300`}></div>
              ))}
            </div>
          </div>
        )}

        {/* Scene 9: Final Answer */}
        {sceneIndex >= 8 && (
          <div className="animate-in fade-in zoom-in duration-700 border-t pt-6">
            <div className="mb-6 text-center">
              <div className="text-5xl font-bold mb-4">
                <MathJax>{`\\[${num1} \\times ${num2} = ${finalAnswer.toFixed(2)}\\]`}</MathJax>
              </div>
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-2xl shadow-xl">
                <CheckCircle2 className="h-8 w-8" />
                <span className="text-2xl font-bold">Perfect!</span>
              </div>
            </div>
            <div className="max-w-md mx-auto text-center p-6 bg-muted/50 rounded-xl">
              <p className="text-lg font-semibold text-muted-foreground">
                "Easy! Multiply first, then slide the decimal back."
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
