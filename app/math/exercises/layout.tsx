import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free SSAT Practice Questions (Middle Level)",
  description: "Practice SSAT middle level math with free interactive questions. Get instant feedback and detailed explanations for fractions, percentages, geometry, and more.",
  keywords: ["SSAT practice questions", "SSAT math exercises", "free SSAT practice", "middle level SSAT", "SSAT test prep"],
}

export default function ExercisesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
