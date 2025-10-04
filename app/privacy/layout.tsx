import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how midssat.com collects, uses, and protects your information. Our privacy policy explains our data practices and your privacy rights.",
  keywords: ["privacy policy", "data protection", "privacy rights", "SSAT prep privacy"],
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
