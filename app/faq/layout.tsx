import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description: "Find answers to common questions about SSAT Math Prep, practice materials, test preparation, and how to use our platform effectively.",
  keywords: ["SSAT FAQ", "SSAT questions", "test prep help", "SSAT middle level FAQ"],
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
