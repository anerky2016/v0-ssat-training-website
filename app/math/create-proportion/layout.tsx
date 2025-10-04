import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How to Create a Proportion - SSAT Math",
  description: "Learn how to create and verify proportions. Interactive practice problems teaching equal fractions and proportion solving for SSAT middle level students.",
  keywords: ["create proportion", "proportions", "equal fractions", "SSAT math", "proportion practice", "verify proportions"],
  openGraph: {
    title: "How to Create a Proportion - SSAT Math | midssat.com",
    description: "Learn how to create and verify proportions. Interactive practice problems teaching equal fractions and proportion solving for SSAT middle level students.",
  },
}

export default function CreateProportionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
