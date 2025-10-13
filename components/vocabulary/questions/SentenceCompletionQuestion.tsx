"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

export interface SentenceCompletionQuestionData {
  id: string
  question: string
  options: string[]
  answer: string
}

interface SentenceCompletionQuestionProps {
  question: SentenceCompletionQuestionData
  onAnswer?: (isCorrect: boolean) => void
  showFeedback?: boolean
}

export function SentenceCompletionQuestion({
  question,
  onAnswer,
  showFeedback = true
}: SentenceCompletionQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)

  const handleOptionSelect = (option: string) => {
    if (hasAnswered) return

    setSelectedOption(option)
    setHasAnswered(true)

    const isCorrect = option === question.answer

    if (onAnswer) {
      onAnswer(isCorrect)
    }
  }

  const getOptionStyle = (option: string) => {
    if (!hasAnswered) {
      return "bg-card hover:bg-muted/50 border-2 border-border cursor-pointer transition-all hover:scale-[1.02]"
    }

    if (option === question.answer) {
      return "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
    }

    if (option === selectedOption && option !== question.answer) {
      return "bg-red-100 dark:bg-red-900/30 border-2 border-red-500"
    }

    return "bg-muted/30 border-2 border-border opacity-60"
  }

  const getOptionIcon = (option: string) => {
    if (!hasAnswered) return null

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
            disabled={hasAnswered}
            className={`w-full p-4 rounded-lg text-left flex items-center justify-between ${getOptionStyle(option)}`}
          >
            <span className="font-medium">{option}</span>
            {getOptionIcon(option)}
          </button>
        ))}

        {showFeedback && hasAnswered && (
          <div className={`mt-4 p-4 rounded-lg ${
            selectedOption === question.answer
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}>
            <div className="flex items-center gap-2 font-semibold mb-1">
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
              <p className="text-sm">
                The correct answer is: <strong>{question.answer}</strong>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
