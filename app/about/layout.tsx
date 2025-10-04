import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about midssat.com - your trusted resource for Middle Level SSAT test preparation. Discover our mission to provide high-quality, accessible SSAT practice materials.",
  keywords: ["about us", "SSAT prep", "about midssat", "SSAT study materials", "Middle Level SSAT"],
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
