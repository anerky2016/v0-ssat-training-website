import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Similar Figures & Ratios - SSAT Geometry",
  description: "Understand similar figures and use proportions to find missing side lengths. Real-world examples with shadows, models, and similar triangles for SSAT students.",
  keywords: ["similarity", "similar figures", "ratios", "proportions", "SSAT math", "geometry", "similar triangles"],
  openGraph: {
    title: "Similar Figures & Ratios - SSAT Geometry | midssat.com",
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
