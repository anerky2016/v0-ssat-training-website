"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, ExternalLink, Sparkles, Loader2, ThumbsUp, ThumbsDown } from "lucide-react"
import Link from "next/link"
import { getWordInfo } from "@/lib/vocabulary-lookup"
import ReactMarkdown from "react-markdown"

export interface SentenceCompletionQuestionData {
  id: string
  question: string
  options: string[]
  answer: string
  explanation?: string
}

interface SentenceCompletionQuestionProps {
  question: SentenceCompletionQuestionData
  onAnswer?: (isCorrect: boolean) => void
  showFeedback?: boolean
  // New props for deferred feedback mode
  selectedAnswer?: string | null
  onSelectAnswer?: (answer: string) => void
  submitted?: boolean
  // Callback to send AI explanation to parent
  onAiExplanation?: (questionId: string, explanation: string) => void
  // Pre-populate AI explanation (e.g., from database)
  initialAiExplanation?: string | null
}

export function SentenceCompletionQuestion({
  question,
  onAnswer,
  showFeedback = true,
  selectedAnswer: externalSelectedAnswer,
  onSelectAnswer,
  submitted = false,
  onAiExplanation,
  initialAiExplanation = null
}: SentenceCompletionQuestionProps) {
  const [internalSelectedOption, setInternalSelectedOption] = useState<string | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [aiExplanation, setAiExplanation] = useState<string | null>(initialAiExplanation)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null)
  const [regenerationAttempt, setRegenerationAttempt] = useState(0)

  // Use external selection if provided, otherwise use internal state
  const selectedOption = externalSelectedAnswer !== undefined ? externalSelectedAnswer : internalSelectedOption
  const isSubmitted = submitted || hasAnswered

  const requestAIExplanation = async (isRegeneration = false) => {
    setLoadingExplanation(true)
    if (isRegeneration) {
      setRegenerationAttempt(prev => prev + 1)
    }

    try {
      const wordInfo = getWordInfo(question.answer)

      // Build clean request body
      const requestBody: any = {
        question: question.question,
        correctAnswer: question.answer,
        allOptions: question.options, // Include all answer choices for comparison
        wordInfo: wordInfo.exists ? wordInfo : null,
      }

      // Only add userAnswer if it exists and is different from correct answer
      if (selectedOption && selectedOption !== question.answer) {
        requestBody.userAnswer = selectedOption
      }

      // Only add regeneration fields if this is a regeneration
      if (isRegeneration) {
        requestBody.isRegeneration = true
        requestBody.previousExplanation = aiExplanation || ''
      }

      console.log('Requesting AI explanation:', {
        isRegeneration,
        hasUserAnswer: !!requestBody.userAnswer,
        hasPreviousExplanation: !!requestBody.previousExplanation
      })

      const response = await fetch('/api/vocabulary/explain-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.explanation) {
        throw new Error('No explanation in response')
      }

      setAiExplanation(data.explanation)
      if (isRegeneration) {
        setFeedbackGiven(null) // Reset feedback for new explanation
      }

      // Notify parent component of the AI explanation
      if (onAiExplanation) {
        onAiExplanation(question.id, data.explanation)
      }
    } catch (error) {
      console.error('Error getting AI explanation:', error)
      setAiExplanation('Sorry, we could not generate an explanation at this time. Please try again later.')
    } finally {
      setLoadingExplanation(false)
    }
  }

  const handleFeedback = async (feedback: 'up' | 'down') => {
    setFeedbackGiven(feedback)

    // Save feedback to database (optional - for analytics)
    try {
      await fetch('/api/vocabulary/save-explanation-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          explanation: aiExplanation,
          feedback,
          regenerationAttempt,
        }),
      })
    } catch (error) {
      console.error('Error saving feedback:', error)
      // Non-critical error, don't show to user
    }

    // If thumbs down, automatically regenerate
    if (feedback === 'down') {
      setTimeout(() => {
        requestAIExplanation(true)
      }, 500) // Small delay for better UX
    }
  }

  const handleOptionSelect = (option: string) => {
    // If using external control (deferred mode)
    if (onSelectAnswer !== undefined) {
      onSelectAnswer(option)
      return
    }

    // Original immediate feedback mode
    if (hasAnswered) return

    setInternalSelectedOption(option)
    setHasAnswered(true)

    const isCorrect = option === question.answer

    if (onAnswer) {
      onAnswer(isCorrect)
    }
  }

  const getOptionStyle = (option: string) => {
    // If submitted or answered, show feedback
    if (isSubmitted && showFeedback) {
      if (option === question.answer) {
        return "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
      }

      if (option === selectedOption && option !== question.answer) {
        return "bg-red-100 dark:bg-red-900/30 border-2 border-red-500"
      }

      return "bg-muted/30 border-2 border-border opacity-60"
    }

    // If selected but not submitted, show selection highlight
    if (option === selectedOption) {
      return "bg-teal-100 dark:bg-teal-900/30 border-2 border-teal-500 cursor-pointer transition-all"
    }

    return "bg-card hover:bg-muted/50 border-2 border-border cursor-pointer transition-all hover:scale-[1.02]"
  }

  const getOptionIcon = (option: string) => {
    // Only show icons after submission
    if (!isSubmitted || !showFeedback) return null

    if (option === question.answer) {
      return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
    }

    if (option === selectedOption && option !== question.answer) {
      return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
    }

    return null
  }

  // Highlight the blank in the question with a purple underline
  const renderQuestion = () => {
    const parts = question.question.split('______')
    if (parts.length === 1) {
      return question.question
    }

    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="inline-block mx-1 border-b-4 border-purple-500 min-w-[100px] h-6"></span>
            )}
          </span>
        ))}
      </>
    )
  }

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <div className="flex items-start gap-2">
          <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
            SENTENCE COMPLETION
          </div>
        </div>
        <CardTitle className="text-lg mt-3 leading-relaxed">
          {renderQuestion()}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(option)}
            disabled={isSubmitted && showFeedback}
            className={`w-full p-4 rounded-lg text-left flex items-center justify-between ${getOptionStyle(option)}`}
          >
            <span className="font-medium">{option}</span>
            {getOptionIcon(option)}
          </button>
        ))}

        {showFeedback && isSubmitted && (
          <div className={`mt-4 p-4 rounded-lg ${
            selectedOption === question.answer
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}>
            <div className="flex items-center gap-2 font-semibold mb-2">
              {selectedOption === question.answer ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span>Incorrect</span>
                </>
              )}
            </div>
            {selectedOption !== question.answer && (
              <div className="mb-3">
                <p className="text-sm font-semibold mb-1">Correct Answer:</p>
                <p className="text-sm bg-white/50 dark:bg-black/20 p-2 rounded">
                  <strong>{question.answer}</strong>
                </p>
              </div>
            )}
            {isSubmitted && (() => {
              const wordInfo = getWordInfo(question.answer)

              return (
                <div className="mt-3 pt-3 border-t border-current/20">
                  <p className="text-sm font-semibold mb-2">Word Information:</p>

                  {wordInfo.exists ? (
                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-base mb-1">
                            {wordInfo.word}
                            {wordInfo.pronunciation && (
                              <span className="ml-2 text-sm font-normal text-muted-foreground">
                                {wordInfo.pronunciation}
                              </span>
                            )}
                          </div>
                          {wordInfo.partOfSpeech && (
                            <div className="text-xs text-muted-foreground italic mb-2">
                              {wordInfo.partOfSpeech}
                            </div>
                          )}
                          {wordInfo.meaning && (
                            <div className="text-sm">
                              {wordInfo.meaning}
                            </div>
                          )}
                        </div>
                        {wordInfo.url && (
                          <Link
                            href={wordInfo.url}
                            className="flex-shrink-0 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                            title="View word card"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded">
                      <div className="text-sm font-semibold mb-1">{question.answer}</div>
                      <div className="text-xs text-muted-foreground">[TBD - Word card not yet available]</div>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="mt-3 pt-3 border-t border-current/10">
                      <p className="text-xs font-semibold mb-1">Additional Notes:</p>
                      <p className="text-xs whitespace-pre-line opacity-75">
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  {/* AI Explanation Section */}
                  <div className="mt-3 pt-3 border-t border-current/10">
                    {!aiExplanation ? (
                      <Button
                        onClick={requestAIExplanation}
                        disabled={loadingExplanation}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        {loadingExplanation ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Generating explanation...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 mr-2" />
                            Still confused? Get AI explanation
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-3 rounded border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-semibold text-purple-900 dark:text-purple-100">
                              AI Tutor Explanation:
                              {regenerationAttempt > 0 && (
                                <span className="ml-2 text-[10px] opacity-60">
                                  (Attempt {regenerationAttempt + 1})
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => handleFeedback('up')}
                              disabled={feedbackGiven !== null || loadingExplanation}
                              variant="ghost"
                              size="sm"
                              className={`h-6 w-6 p-0 ${
                                feedbackGiven === 'up'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-purple-600 dark:text-purple-400 hover:text-green-600 dark:hover:text-green-400'
                              }`}
                              title="Helpful explanation"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => handleFeedback('down')}
                              disabled={feedbackGiven !== null || loadingExplanation}
                              variant="ghost"
                              size="sm"
                              className={`h-6 w-6 p-0 ${
                                feedbackGiven === 'down'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-purple-600 dark:text-purple-400 hover:text-red-600 dark:hover:text-red-400'
                              }`}
                              title="Not helpful - generate new explanation"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {loadingExplanation && feedbackGiven === 'down' ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin text-purple-600 dark:text-purple-400" />
                            <span className="text-xs text-purple-900 dark:text-purple-100">
                              Generating a better explanation...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs text-purple-900 dark:text-purple-100 leading-relaxed mb-2 prose prose-sm max-w-none">
                              <ReactMarkdown
                                components={{
                                  // Style paragraph tags
                                  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                  // Style strong/bold tags
                                  strong: ({children}) => <strong className="font-bold text-purple-950 dark:text-purple-50">{children}</strong>,
                                  // Style em/italic tags
                                  em: ({children}) => <em className="italic">{children}</em>,
                                }}
                              >
                                {aiExplanation || ''}
                              </ReactMarkdown>
                            </div>
                            {feedbackGiven === 'up' && (
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-purple-200 dark:border-purple-800">
                                <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                                <span className="text-[10px] text-purple-900 dark:text-purple-100 opacity-75">
                                  Thank you for your feedback!
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
