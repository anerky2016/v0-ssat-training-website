import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"
import { Suspense } from "react"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'),
  title: {
    default: "SSAT Prep - Middle Level Training Materials",
    template: "%s | SSAT Prep"
  },
  description: "Comprehensive SSAT training materials and practice tests for middle school students. Master math, verbal reasoning, and test-taking strategies.",
  keywords: ["SSAT", "SSAT prep", "middle level", "test preparation", "math practice", "verbal reasoning", "practice tests", "middle school"],
  authors: [{ name: "SSAT Prep" }],
  creator: "SSAT Prep",
  publisher: "SSAT Prep",
  generator: "v0.app",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SSAT Prep",
    title: "SSAT Prep - Middle Level Training Materials",
    description: "Comprehensive SSAT training materials and practice tests for middle school students",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSAT Prep - Middle Level Training Materials",
    description: "Comprehensive SSAT training materials and practice tests for middle school students",
  },
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="61d8f68c-ffd1-4dd2-a1ac-68f4d4c3893f"></script>
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
