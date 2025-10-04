import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SSAT Math Practice Tests (Middle Level)",
  description: "Full-length SSAT middle level math practice tests with instant scoring and detailed explanations. Simulate real test conditions and track your progress.",
  keywords: ["SSAT practice tests", "SSAT math test", "middle level practice test", "SSAT test simulation"],
}

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
