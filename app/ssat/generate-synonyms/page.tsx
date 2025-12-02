"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Plus, Sparkles, Play, List, FileText } from "lucide-react"
import Link from "next/link"
import { SynonymQuestion, type SynonymQuestionData } from "@/components/ssat/SynonymQuestion"
import { WordSelector } from "@/components/ssat/WordSelector"

type GenerationMode = 'single' | 'batch'

export default function GenerateSynonymsPage() {
  const [mode, setMode] = useState<GenerationMode>('batch')
  const [word, setWord] = useState("")
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [meaning, setMeaning] = useState("")
  const [partOfSpeech, setPartOfSpeech] = useState("")
  const [questionCount, setQuestionCount] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<SynonymQuestionData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentWord: '' })

  const handleGenerate = async () => {
    if (mode === 'single' && !word.trim()) {
      setError("Please enter a word")
      return
    }

    if (mode === 'batch' && selectedWords.length === 0) {
      setError("Please select at least one word")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedQuestions([])

    try {
      if (mode === 'single') {
        // Single word generation
        const response = await fetch('/api/ssat/generate-synonym-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            word: word.trim(),
            meaning: meaning.trim() || undefined,
            partOfSpeech: partOfSpeech.trim() || undefined,
            count: questionCount,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || errorData.error || 'Failed to generate questions')
        }

        const data = await response.json()
        setGeneratedQuestions(data.questions)
        setCurrentQuestionIndex(0)
        setIsPreviewing(false)
        setSelectedAnswer(null)
      } else {
        // Batch generation
        const words = selectedWords

        setBatchProgress({ current: 0, total: words.length, currentWord: '' })
        const allQuestions: SynonymQuestionData[] = []

        for (let i = 0; i < words.length; i++) {
          const currentWord = words[i]
          setBatchProgress({ current: i + 1, total: words.length, currentWord })

          try {
            const response = await fetch('/api/ssat/generate-synonym-questions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                word: currentWord,
                count: questionCount,
              }),
            })

            if (response.ok) {
              const data = await response.json()
              console.log(`[Batch] Generated ${data.questions.length} question(s) for word: ${currentWord}`)
              allQuestions.push(...data.questions)
              console.log(`[Batch] Total questions so far: ${allQuestions.length}`)
            } else {
              console.error(`Failed to generate questions for: ${currentWord}`)
            }

            // Small delay to avoid rate limiting
            if (i < words.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          } catch (err) {
            console.error(`Error generating for ${currentWord}:`, err)
          }
        }

        console.log(`[Batch] Batch complete! Setting ${allQuestions.length} total questions`)
        setGeneratedQuestions(allQuestions)
        setCurrentQuestionIndex(0)
        setIsPreviewing(false)
        setSelectedAnswer(null)
        setBatchProgress({ current: 0, total: 0, currentWord: '' })
      }
    } catch (err: any) {
      console.error('Error generating questions:', err)
      setError(err.message || 'Failed to generate questions')
      setBatchProgress({ current: 0, total: 0, currentWord: '' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartPreview = () => {
    setIsPreviewing(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setSelectedAnswer(null)
    }
  }

  const handleClearAll = () => {
    setGeneratedQuestions([])
    setIsPreviewing(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
  }

  const currentQuestion = generatedQuestions[currentQuestionIndex]

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <Link
                href="/ssat"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to SSAT Practice
              </Link>

              <div className="mb-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                  Generate Synonym Questions
                </h1>
                <p className="text-lg text-muted-foreground">
                  Use AI to create SSAT-style synonym questions for vocabulary words
                </p>
              </div>

              {/* Mode Selector */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setMode('single')}
                      variant={mode === 'single' ? "default" : "outline"}
                      size="sm"
                      className={mode === 'single' ? "bg-purple-500 hover:bg-purple-600" : ""}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Single Word
                    </Button>
                    <Button
                      onClick={() => setMode('batch')}
                      variant={mode === 'batch' ? "default" : "outline"}
                      size="sm"
                      className={mode === 'batch' ? "bg-purple-500 hover:bg-purple-600" : ""}
                    >
                      <List className="h-4 w-4 mr-2" />
                      Batch Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {mode === 'single' ? (
                // Single Mode Layout
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Word Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="word">Word *</Label>
                          <Input
                            id="word"
                            placeholder="e.g., eloquent"
                            value={word}
                            onChange={(e) => setWord(e.target.value)}
                            disabled={isGenerating}
                          />
                        </div>

                        <div>
                          <Label htmlFor="meaning">Meaning (Optional)</Label>
                          <Input
                            id="meaning"
                            placeholder="e.g., fluent and persuasive in speaking"
                            value={meaning}
                            onChange={(e) => setMeaning(e.target.value)}
                            disabled={isGenerating}
                          />
                        </div>

                        <div>
                          <Label htmlFor="partOfSpeech">Part of Speech (Optional)</Label>
                          <Input
                            id="partOfSpeech"
                            placeholder="e.g., adjective"
                            value={partOfSpeech}
                            onChange={(e) => setPartOfSpeech(e.target.value)}
                            disabled={isGenerating}
                          />
                        </div>

                        <div>
                          <Label>Number of Questions</Label>
                          <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 5].map(num => (
                              <Button
                                key={num}
                                onClick={() => setQuestionCount(num)}
                                variant={questionCount === num ? "default" : "outline"}
                                size="sm"
                                disabled={isGenerating}
                                className={questionCount === num ? "bg-purple-500 hover:bg-purple-600" : ""}
                              >
                                {num}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {error && (
                          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
                            {error}
                          </div>
                        )}

                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating || !word.trim()}
                          className="w-full bg-purple-500 hover:bg-purple-600"
                          size="lg"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate Questions
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <ResultsPanel
                    generatedQuestions={generatedQuestions}
                    isPreviewing={isPreviewing}
                    currentQuestionIndex={currentQuestionIndex}
                    currentQuestion={currentQuestion}
                    selectedAnswer={selectedAnswer}
                    onStartPreview={handleStartPreview}
                    onClearAll={handleClearAll}
                    onSelectAnswer={setSelectedAnswer}
                    onPrevious={handlePreviousQuestion}
                    onNext={handleNextQuestion}
                    onExitPreview={() => setIsPreviewing(false)}
                  />
                </div>
              ) : (
                // Batch Mode Layout
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <WordSelector
                        selectedWords={selectedWords}
                        onWordsSelected={setSelectedWords}
                      />
                    </div>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Questions Per Word</Label>
                            <div className="flex gap-2 mt-2">
                              {[1, 2, 3, 5].map(num => (
                                <Button
                                  key={num}
                                  onClick={() => setQuestionCount(num)}
                                  variant={questionCount === num ? "default" : "outline"}
                                  size="sm"
                                  disabled={isGenerating}
                                  className={questionCount === num ? "bg-purple-500 hover:bg-purple-600" : ""}
                                >
                                  {num}
                                </Button>
                              ))}
                            </div>
                            {selectedWords.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Total: {questionCount} × {selectedWords.length} words = <strong>{questionCount * selectedWords.length} questions</strong>
                              </p>
                            )}
                          </div>

                          {/* Batch Progress */}
                          {isGenerating && batchProgress.total > 0 && (
                            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-purple-900 dark:text-purple-100">
                                  Generating...
                                </span>
                                <span className="text-purple-700 dark:text-purple-300">
                                  {batchProgress.current} / {batchProgress.total}
                                </span>
                              </div>
                              {batchProgress.currentWord && (
                                <div className="text-xs text-purple-600 dark:text-purple-400">
                                  Current word: <strong>{batchProgress.currentWord}</strong>
                                </div>
                              )}
                              <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {error && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
                              {error}
                            </div>
                          )}

                          <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || selectedWords.length === 0}
                            className="w-full bg-purple-500 hover:bg-purple-600"
                            size="lg"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {batchProgress.total > 0
                                  ? `Generating ${batchProgress.current}/${batchProgress.total}...`
                                  : 'Generating...'}
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate All Questions
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {generatedQuestions.length > 0 && (
                    <ResultsPanel
                      generatedQuestions={generatedQuestions}
                      isPreviewing={isPreviewing}
                      currentQuestionIndex={currentQuestionIndex}
                      currentQuestion={currentQuestion}
                      selectedAnswer={selectedAnswer}
                      onStartPreview={handleStartPreview}
                      onClearAll={handleClearAll}
                      onSelectAnswer={setSelectedAnswer}
                      onPrevious={handlePreviousQuestion}
                      onNext={handleNextQuestion}
                      onExitPreview={() => setIsPreviewing(false)}
                    />
                  )}
                </div>
              )}

              {/* Info Section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <div className="font-semibold mb-2">1. Choose Mode</div>
                      <p className="text-muted-foreground">
                        Generate questions for a single word with details, or use batch selection to choose multiple words from different levels.
                      </p>
                    </div>
                    <div>
                      <div className="font-semibold mb-2">2. Generate Questions</div>
                      <p className="text-muted-foreground">
                        Our AI creates SSAT-style synonym questions with 5 options and explanations for each word.
                      </p>
                    </div>
                    <div>
                      <div className="font-semibold mb-2">3. Review & Practice</div>
                      <p className="text-muted-foreground">
                        Preview the generated questions to test your understanding or use them for study sessions.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Batch Selection Tip</div>
                        <p className="text-xs text-purple-800 dark:text-purple-200">
                          Use filters (levels, letters, difficulty) to find specific words, then select multiple words to generate questions in bulk. Perfect for creating comprehensive study materials!
                        </p>
                      </div>
                    </div>
                  </div>
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

// Extracted Results Panel Component
function ResultsPanel({
  generatedQuestions,
  isPreviewing,
  currentQuestionIndex,
  currentQuestion,
  selectedAnswer,
  onStartPreview,
  onClearAll,
  onSelectAnswer,
  onPrevious,
  onNext,
  onExitPreview,
}: {
  generatedQuestions: SynonymQuestionData[]
  isPreviewing: boolean
  currentQuestionIndex: number
  currentQuestion: SynonymQuestionData
  selectedAnswer: string | null
  onStartPreview: () => void
  onClearAll: () => void
  onSelectAnswer: (answer: string | null) => void
  onPrevious: () => void
  onNext: () => void
  onExitPreview: () => void
}) {
  console.log(`[ResultsPanel] Rendering with ${generatedQuestions.length} questions, isPreviewing: ${isPreviewing}, currentIndex: ${currentQuestionIndex}`)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generated Questions</CardTitle>
          {generatedQuestions.length > 0 && (
            <div className="flex gap-2">
              {!isPreviewing && (
                <Button onClick={onStartPreview} size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button
                onClick={onClearAll}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {generatedQuestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
              <Plus className="h-8 w-8" />
            </div>
            <p className="text-muted-foreground">
              No questions generated yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Select words and click "Generate Questions"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {generatedQuestions.length} question{generatedQuestions.length > 1 ? 's' : ''} generated
              </span>
              {isPreviewing && (
                <span className="font-semibold">
                  Question {currentQuestionIndex + 1} of {generatedQuestions.length}
                </span>
              )}
            </div>

            {!isPreviewing ? (
              // List view
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {generatedQuestions.map((q, index) => {
                  console.log(`[ResultsPanel] Rendering list item ${index + 1}: ${q.originalWord}`)
                  return (
                  <div key={q.id} className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="font-semibold text-sm">Question {index + 1}</div>
                      <div className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                        SYNONYM
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-purple-600 dark:text-purple-400 mb-1">
                        {q.originalWord}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Options: {q.options.join(', ')}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                        Answer: {q.answer}
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              // Preview mode
              <div className="space-y-4">
                <SynonymQuestion
                  question={currentQuestion}
                  selectedAnswer={selectedAnswer}
                  onSelectAnswer={onSelectAnswer}
                  submitted={false}
                  showFeedback={false}
                />

                {selectedAnswer && (
                  <div className={`p-3 rounded-lg ${
                    selectedAnswer === currentQuestion.answer
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  }`}>
                    <div className="text-sm font-semibold mb-1">
                      {selectedAnswer === currentQuestion.answer ? 'Correct!' : 'Incorrect'}
                    </div>
                    {selectedAnswer !== currentQuestion.answer && (
                      <div className="text-sm">
                        Correct answer: <strong>{currentQuestion.answer}</strong>
                      </div>
                    )}
                    {currentQuestion.explanation && (
                      <div className="text-sm mt-2 pt-2 border-t border-current/20">
                        {currentQuestion.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    onClick={onPrevious}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={onExitPreview}
                    variant="ghost"
                    size="sm"
                  >
                    Exit Preview
                  </Button>
                  <Button
                    onClick={onNext}
                    disabled={currentQuestionIndex === generatedQuestions.length - 1}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
