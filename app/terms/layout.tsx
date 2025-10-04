import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions for using midssat.com. Learn about your rights and responsibilities when accessing our SSAT prep materials.",
  keywords: ["terms of service", "terms and conditions", "user agreement", "SSAT prep terms"],
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
