"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { getWordInfo } from "@/lib/vocabulary-lookup"

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
}

export function SentenceCompletionQuestion({
  question,
  onAnswer,
  showFeedback = true,
  selectedAnswer: externalSelectedAnswer,
  onSelectAnswer,
  submitted = false
}: SentenceCompletionQuestionProps) {
  const [internalSelectedOption, setInternalSelectedOption] = useState<string | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)

  // Use external selection if provided, otherwise use internal state
  const selectedOption = externalSelectedAnswer !== undefined ? externalSelectedAnswer : internalSelectedOption
  const isSubmitted = submitted || hasAnswered

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
                </div>
              )
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
