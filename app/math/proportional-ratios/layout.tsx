import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Proportional Ratios - SSAT Math Prep",
  description: "Master proportional ratios and cross multiplication. Learn to solve proportion problems with step-by-step examples for SSAT middle level test preparation.",
  keywords: ["proportional ratios", "proportions", "cross multiplication", "SSAT math", "ratios practice", "proportion problems"],
  openGraph: {
    title: "Proportional Ratios - SSAT Math Prep",
    description: "Master proportional ratios and cross multiplication. Learn to solve proportion problems with step-by-step examples for SSAT middle level test preparation.",
  },
}

export default function ProportionalRatiosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
