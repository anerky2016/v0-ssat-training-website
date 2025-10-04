import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us - SSAT Math Prep Support",
  description: "Get in touch with the SSAT Math Prep team. Contact us for support, sales inquiries, or partnership opportunities. Email: support@midssat.com",
  keywords: ["contact SSAT prep", "SSAT support", "midssat contact", "SSAT help"],
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
