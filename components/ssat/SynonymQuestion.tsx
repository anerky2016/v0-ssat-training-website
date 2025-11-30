"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"

export interface SynonymQuestionData {
  id: string
  question: string
  originalWord: string
  options: string[]
  answer: string
  explanation?: string
}

interface SynonymQuestionProps {
  question: SynonymQuestionData
  selectedAnswer?: string | null
  onSelectAnswer?: (answer: string) => void
  submitted?: boolean
  showFeedback?: boolean
}

export function SynonymQuestion({
  question,
  selectedAnswer = null,
  onSelectAnswer,
  submitted = false,
  showFeedback = true,
}: SynonymQuestionProps) {
  const isSubmitted = submitted

  const handleOptionSelect = (option: string) => {
    if (isSubmitted || !onSelectAnswer) return
    onSelectAnswer(option)
  }

  const getOptionStyle = (option: string) => {
    // If submitted and showing feedback
    if (isSubmitted && showFeedback) {
      if (option === question.answer) {
        return "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
      }

      if (option === selectedAnswer && option !== question.answer) {
        return "bg-red-100 dark:bg-red-900/30 border-2 border-red-500"
      }

      return "bg-muted/30 border-2 border-border opacity-60"
    }

    // If selected but not submitted
    if (option === selectedAnswer) {
      return "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 cursor-pointer transition-all"
    }

    return "bg-card hover:bg-muted/50 border-2 border-border cursor-pointer transition-all hover:scale-[1.02]"
  }

  const getOptionIcon = (option: string) => {
    if (!isSubmitted || !showFeedback) return null

    if (option === question.answer) {
      return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
    }

    if (option === selectedAnswer && option !== question.answer) {
      return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
    }

    return null
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-start gap-2">
          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
            SYNONYM
          </div>
        </div>
        <CardTitle className="text-lg mt-3 leading-relaxed">
          {question.question}
        </CardTitle>
        <div className="mt-2">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {question.originalWord}
          </span>
        </div>
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
            selectedAnswer === question.answer
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}>
            <div className="flex items-center gap-2 font-semibold mb-2">
              {selectedAnswer === question.answer ? (
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
            {selectedAnswer !== question.answer && (
              <div className="mb-3 space-y-2">
                <div>
                  <p className="text-sm font-semibold mb-1">Your Answer:</p>
                  <p className="text-sm bg-white/50 dark:bg-black/20 p-2 rounded">
                    <strong>{selectedAnswer || '(No answer selected)'}</strong>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Correct Answer:</p>
                  <p className="text-sm bg-white/50 dark:bg-black/20 p-2 rounded">
                    <strong>{question.answer}</strong>
                  </p>
                </div>
              </div>
            )}
            {question.explanation && (
              <div className="mt-3 pt-3 border-t border-current/20">
                <p className="text-sm font-semibold mb-2">Explanation:</p>
                <p className="text-sm">{question.explanation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
