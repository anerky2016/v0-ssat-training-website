import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SSAT Math Topics & Lessons (Middle Level)",
  description: "Comprehensive SSAT middle level math lessons covering all topics: fractions, ratios, geometry, decimals, integers, percentages, and more. Interactive practice with step-by-step solutions.",
  keywords: ["SSAT math topics", "SSAT middle level math", "math lessons", "SSAT curriculum"],
}

export default function MathLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
