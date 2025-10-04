import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Simplifying Ratios - SSAT Math Lesson",
  description: "Learn how to simplify ratios using the greatest common factor. Interactive lessons, worked examples, and practice problems for SSAT middle level students.",
  keywords: ["simplifying ratios", "ratio simplification", "GCF", "greatest common factor", "SSAT math", "ratios practice"],
  openGraph: {
    title: "Simplifying Ratios - SSAT Math Lesson | midssat.com",
    description: "Learn how to simplify ratios using the greatest common factor. Interactive lessons, worked examples, and practice problems for SSAT middle level students.",
  },
}

export default function SimplifyingRatiosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
