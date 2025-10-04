import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Similarity and Ratios - SSAT Math Prep",
  description: "Understand similar figures and use proportions to find missing side lengths. Real-world examples with shadows, models, and similar triangles for SSAT students.",
  keywords: ["similarity", "similar figures", "ratios", "proportions", "SSAT math", "geometry", "similar triangles"],
  openGraph: {
    title: "Similarity and Ratios - SSAT Math Prep",
    description: "Understand similar figures and use proportions to find missing side lengths. Real-world examples with shadows, models, and similar triangles for SSAT students.",
  },
}

export default function SimilarityRatiosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
