"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, Info, Volume2 } from "lucide-react"
import Link from "next/link"
import vocabularyData from "@/data/vocabulary-words.json"

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredWords, setMasteredWords] = useState<Set<number>>(new Set())
  const [showDetails, setShowDetails] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const words = vocabularyData.words

  const pronounceWord = (word: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      setIsPlaying(true)
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.rate = 0.8 // Slightly slower for clarity
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onend = () => {
        setIsPlaying(false)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      alert('Sorry, your browser does not support text-to-speech.')
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowDetails(false)
      setIsPlaying(false)
      window.speechSynthesis?.cancel()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setShowDetails(false)
      setIsPlaying(false)
      window.speechSynthesis?.cancel()
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleMarkMastered = () => {
    setMasteredWords(new Set(masteredWords).add(currentIndex))
    if (currentIndex < words.length - 1) {
      handleNext()
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowDetails(false)
    setMasteredWords(new Set())
  }

  const progress = words.length > 0 ? Math.round((masteredWords.size / words.length) * 100) : 0
  const currentWord = words[currentIndex]

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <Link
                href="/vocabulary"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Vocabulary
              </Link>

              <div className="mb-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-7/10 text-chart-7">
                  <Brain className="h-6 w-6" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                  Vocabulary Flashcards
                </h1>
                <p className="text-lg text-muted-foreground">
                  Practice and master SSAT vocabulary words with interactive flashcards.
                </p>
              </div>

              <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Progress: {progress}%</span>
                  <Button variant="outline" size="sm" onClick={handleReset} className="h-9 px-3">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                </div>
              </div>

              <div className="mb-6 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-7 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mb-6">
                <div
                  className="relative w-full min-h-[450px] cursor-pointer"
                  onClick={handleFlip}
                  style={{ perspective: "1000px" }}
                >
                  <div
                    className="absolute w-full h-full transition-transform duration-500"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* Front of card */}
                    <Card
                      className="absolute w-full min-h-[450px] border-2 border-chart-7 bg-card flex items-center justify-center"
                      style={{
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <CardContent className="text-center p-8 w-full">
                        <div className="text-5xl font-bold text-foreground mb-3">
                          {currentWord.word}
                        </div>
                        <div className="flex flex-col items-center justify-center gap-3 mb-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              pronounceWord(currentWord.word)
                            }}
                            className={`h-14 w-14 p-0 rounded-full transition-all shadow-lg ${
                              isPlaying
                                ? 'bg-chart-1 hover:bg-chart-1/90 animate-pulse'
                                : 'bg-chart-1 hover:bg-chart-1/90 hover:scale-110'
                            }`}
                            title="Click to hear pronunciation"
                          >
                            <Volume2 className="h-7 w-7 text-white" />
                          </Button>
                          <span className="text-xl text-muted-foreground">
                            {currentWord.pronunciation}
                          </span>
                        </div>
                        <div className="text-lg text-muted-foreground italic">
                          ({currentWord.part_of_speech})
                        </div>
                        {masteredWords.has(currentIndex) && (
                          <div className="mt-6 flex items-center justify-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-medium">Mastered</span>
                          </div>
                        )}
                        <div className="mt-12 text-sm text-muted-foreground">
                          Click to reveal definition
                        </div>
                      </CardContent>
                    </Card>

                    {/* Back of card */}
                    <Card
                      className="absolute w-full min-h-[450px] border-2 border-chart-7 bg-card overflow-y-auto"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <CardContent className="p-6 sm:p-8">
                        <div className="space-y-4">
                          {/* Meanings */}
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                              Definition{currentWord.meanings.length > 1 ? 's' : ''}
                            </h3>
                            <ol className="list-decimal list-inside space-y-1">
                              {currentWord.meanings.map((meaning, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground leading-relaxed">
                                  {meaning}
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Examples */}
                          {currentWord.examples && currentWord.examples.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                                Example{currentWord.examples.length > 1 ? 's' : ''}
                              </h3>
                              <div className="space-y-2">
                                {currentWord.examples.slice(0, 2).map((example, idx) => (
                                  <p key={idx} className="text-sm text-muted-foreground italic">
                                    "{example}"
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Synonyms */}
                          {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                                Synonyms
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {currentWord.synonyms.slice(0, 4).join(", ")}
                              </p>
                            </div>
                          )}

                          {/* Antonyms */}
                          {currentWord.antonyms && currentWord.antonyms.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                                Antonyms
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {currentWord.antonyms.join(", ")}
                              </p>
                            </div>
                          )}

                          {/* Show Details Button */}
                          {currentWord.further_information && currentWord.further_information.length > 0 && (
                            <div className="pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowDetails(!showDetails)
                                }}
                                className="text-chart-7 hover:text-chart-7"
                              >
                                <Info className="h-4 w-4 mr-2" />
                                {showDetails ? "Hide" : "Show"} Etymology & Notes
                              </Button>

                              {showDetails && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                  <ul className="space-y-2">
                                    {currentWord.further_information.map((info, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <div className="mt-1 h-1 w-1 rounded-full bg-chart-7 flex-shrink-0" />
                                        <span className="leading-relaxed">{info}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="mt-6 text-sm text-muted-foreground text-center">
                          Click to flip back
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {isFlipped && !masteredWords.has(currentIndex) && (
                  <Button
                    onClick={handleMarkMastered}
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-medium"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Mark as Mastered
                  </Button>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="flex-1 h-14 text-base font-medium"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {currentIndex + 1} / {words.length}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentIndex === words.length - 1}
                    className="flex-1 h-14 text-base font-medium"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href="/vocabulary/word-lists">
                  <Button variant="ghost" size="sm">
                    View Full Word List
                  </Button>
                </Link>
              </div>

              <Card className="mt-8 border-chart-7 bg-chart-7/5">
                <CardHeader>
                  <CardTitle>Flashcard Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>• Try to recall the definition and pronunciation before flipping</p>
                  <p>• Pay attention to the etymology to understand word roots</p>
                  <p>• Mark words as mastered only when you can define them confidently</p>
                  <p>• Review the examples to understand how words are used in context</p>
                  <p>• Notice patterns in synonyms to build your vocabulary network</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
