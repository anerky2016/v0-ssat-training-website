"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PrintExercisesButtonProps {
  exercises: Array<{
    id: string
    prompt?: string
    pair?: [string, string]
    question_latex?: string
    problem_latex?: string
  }>
  topicTitle: string
  difficulty?: string
}

export function PrintExercisesButton({ exercises, topicTitle, difficulty }: PrintExercisesButtonProps) {
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to print exercises')
      return
    }

    // Build the HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${topicTitle} - ${difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'All'} Exercises</title>
          <script>
            MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
              },
              svg: {
                fontCache: 'global'
              }
            };
          </script>
          <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #1a1a1a;
            }
            h2 {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 30px;
              color: #4a4a4a;
            }
            .exercise {
              margin-bottom: 80px;
              page-break-inside: avoid;
            }
            .exercise-header {
              font-weight: 600;
              font-size: 16px;
              margin-bottom: 12px;
              color: #2a2a2a;
            }
            .exercise-content {
              font-size: 18px;
              font-weight: 500;
              color: #1a1a1a;
              margin-bottom: 15px;
            }
            .answer-space {
              border-bottom: 1px solid #d0d0d0;
              height: 60px;
              margin-top: 20px;
            }
            @media print {
              body {
                margin: 20px;
              }
              .exercise {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <h1>${topicTitle}</h1>
          <h2>${difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + ' ' : ''}Practice Exercises</h2>
          ${exercises.map((exercise) => {
            let questionText = ''
            if (exercise.pair) {
              questionText = `Compare: \\[${exercise.pair[0]}\\] and \\[${exercise.pair[1]}\\]`
            } else if (exercise.question_latex || exercise.problem_latex) {
              const latex = exercise.question_latex || exercise.problem_latex || ''
              questionText = `\\[${latex}\\]`
            } else {
              questionText = exercise.prompt || ''
            }

            return `
              <div class="exercise">
                <div class="exercise-header">Problem ${exercise.id}</div>
                <div class="exercise-content">${questionText}</div>
                <div class="answer-space"></div>
              </div>
            `
          }).join('')}
        </body>
      </html>
    `

    // Write the content and print
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Wait for MathJax to render before printing
    printWindow.onload = () => {
      if (printWindow.MathJax) {
        printWindow.MathJax.startup.promise.then(() => {
          printWindow.print()
        })
      } else {
        // Fallback if MathJax doesn't load
        setTimeout(() => printWindow.print(), 1000)
      }
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className="flex items-center gap-2"
    >
      <Printer className="h-4 w-4" />
      Print All Exercises
    </Button>
  )
}
