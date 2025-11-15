"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LevelSelector } from "@/components/vocabulary/LevelSelector"
import { BookOpen, Sparkles, Copy, RefreshCw, Loader2, Check } from "lucide-react"
import { VocabularyLevel } from "@/lib/vocabulary-levels"
import { cn } from "@/lib/utils"
import { storyTypes, type StoryType, type StorySubtype } from "@/lib/story-types"

interface GeneratedStory {
  story: string
  words: { word: string; level: VocabularyLevel; meaning: string }[]
  metadata: {
    levels: VocabularyLevel[]
    wordsUsed: number
    generatedAt: string
  }
}

export function StoryGenerator() {
  const [selectedLevels, setSelectedLevels] = useState<VocabularyLevel[]>(["SSAT"])
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [wordsPerLevel, setWordsPerLevel] = useState(3)
  const [storyLength, setStoryLength] = useState<"short" | "medium" | "long">("medium")
  const [selectedStoryType, setSelectedStoryType] = useState<string | null>(null)
  const [selectedStorySubtype, setSelectedStorySubtype] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  const handleGenerate = async () => {
    if (selectedLevels.length === 0) {
      setError("Please select at least one difficulty level")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/vocabulary/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          levels: selectedLevels,
          letters: selectedLetters,
          wordsPerLevel,
          storyLength,
          storyType: selectedStoryType,
          storySubtype: selectedStorySubtype,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate story")
      }

      const data = await response.json()
      setGeneratedStory(data)
    } catch (err) {
      setError("Failed to generate story. Please try again.")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (generatedStory?.story) {
      // Remove markdown bold markers for plain text copy
      const plainText = generatedStory.story.replace(/\*\*/g, "")
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Story Generator Settings</CardTitle>
          </div>
          <CardDescription>
            Select difficulty levels and customize your vocabulary story
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level Selector */}
          <LevelSelector
            selectedLevels={selectedLevels}
            onLevelsChange={setSelectedLevels}
          />

          {/* Story Type Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Story Type (optional)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {storyTypes.map((type) => (
                <Button
                  key={type.id}
                  onClick={() => {
                    if (selectedStoryType === type.id) {
                      setSelectedStoryType(null)
                      setSelectedStorySubtype(null)
                    } else {
                      setSelectedStoryType(type.id)
                      setSelectedStorySubtype(null) // Reset subtype when changing type
                    }
                  }}
                  variant={selectedStoryType === type.id ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-auto py-2 px-3 text-left flex flex-col items-start gap-1",
                    selectedStoryType === type.id && "bg-chart-2 hover:bg-chart-2/90"
                  )}
                >
                  <span className="text-base">{type.icon}</span>
                  <span className="text-xs font-medium leading-tight">{type.label}</span>
                </Button>
              ))}
            </div>
            {selectedStoryType && (
              <p className="text-xs text-muted-foreground">
                {storyTypes.find(t => t.id === selectedStoryType)?.description}
              </p>
            )}
          </div>

          {/* Story Subtype Selector - Only show if type is selected */}
          {selectedStoryType && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">
                  Story Subtype
                </Label>
                {selectedStorySubtype && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStorySubtype(null)}
                    className="text-xs h-7"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <RadioGroup
                value={selectedStorySubtype || ""}
                onValueChange={setSelectedStorySubtype}
                className="grid grid-cols-1 gap-2"
              >
                {storyTypes
                  .find(t => t.id === selectedStoryType)
                  ?.subtypes.map((subtype) => (
                    <div
                      key={subtype.id}
                      className="flex items-start space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={subtype.id} id={subtype.id} className="mt-0.5" />
                      <Label htmlFor={subtype.id} className="font-normal cursor-pointer flex-1">
                        <span className="font-semibold text-sm block mb-0.5">{subtype.label}</span>
                        <span className="text-xs text-muted-foreground">{subtype.description}</span>
                      </Label>
                    </div>
                  ))}
              </RadioGroup>
            </div>
          )}

          {/* Alphabet Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">
                Filter by first letter (optional)
              </Label>
              {selectedLetters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLetters([])}
                  className="text-xs h-7"
                >
                  Clear ({selectedLetters.length})
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {alphabet.map((letter) => {
                const isSelected = selectedLetters.includes(letter)
                return (
                  <Button
                    key={letter}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedLetters(selectedLetters.filter(l => l !== letter))
                      } else {
                        setSelectedLetters([...selectedLetters, letter])
                      }
                    }}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 text-xs font-medium",
                      isSelected && "bg-chart-1 hover:bg-chart-1/90"
                    )}
                  >
                    {letter}
                  </Button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedLetters.length === 0
                ? "Select letters to only use words starting with those letters"
                : `Using words starting with: ${selectedLetters.sort().join(", ")}`}
            </p>
          </div>

          {/* Words Per Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Words per level: {wordsPerLevel}
            </Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="15"
                value={wordsPerLevel}
                onChange={(e) => setWordsPerLevel(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-sm font-medium min-w-[2rem] text-center">
                {wordsPerLevel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Total words: {selectedLevels.length * wordsPerLevel}
            </p>
          </div>

          {/* Story Length */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Story length
            </Label>
            <RadioGroup
              value={storyLength}
              onValueChange={(value) => setStoryLength(value as "short" | "medium" | "long")}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short" id="short" />
                <Label htmlFor="short" className="font-normal cursor-pointer">
                  Short (~500 words)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="font-normal cursor-pointer">
                  Medium (~1000 words)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="long" id="long" />
                <Label htmlFor="long" className="font-normal cursor-pointer">
                  Long (~2000 words) - Epic story with rich detail
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedLevels.length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Story...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Story
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Story Display */}
      {generatedStory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Your Story</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                >
                  <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                  Regenerate
                </Button>
              </div>
            </div>
            <CardDescription>
              Generated on {new Date(generatedStory.metadata.generatedAt).toLocaleDateString()} at{" "}
              {new Date(generatedStory.metadata.generatedAt).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Story Text */}
            <div
              className="prose prose-sm max-w-none leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{
                __html: generatedStory.story
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
                  .replace(/\n/g, "<br />"),
              }}
            />

            {/* Vocabulary Words Used */}
            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Vocabulary Words Used ({generatedStory.words.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {generatedStory.words.map((word, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm px-3 py-1"
                    title={word.meaning}
                  >
                    {word.word}
                    <span className="ml-1.5 text-xs opacity-70">
                      {word.level === "SSAT" ? "SSAT" : `L${word.level}`}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
