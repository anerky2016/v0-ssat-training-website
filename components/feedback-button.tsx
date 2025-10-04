"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { FeedbackDialog } from "@/components/feedback-dialog"

export function FeedbackButton() {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <>
      <Button
        onClick={() => setShowFeedback(true)}
        className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14 sm:h-auto sm:w-auto sm:rounded-md sm:px-4 sm:py-2 z-40"
        size="lg"
      >
        <MessageSquare className="h-5 w-5 sm:mr-2" />
        <span className="hidden sm:inline">Feedback</span>
      </Button>

      <FeedbackDialog open={showFeedback} onOpenChange={setShowFeedback} />
    </>
  )
}
