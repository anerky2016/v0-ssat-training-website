import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { GoogleAnalytics } from "@/components/google-analytics"
import { BookmarkProvider } from "@/components/bookmark-provider"
import { StudyHistoryProvider } from "@/components/study-history-provider"
import { FeedbackButton } from "@/components/feedback-button"
import { StructuredData } from "@/components/structured-data"
import { LoginTracker } from "@/components/login-tracker"
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://www.midssat.com'),
  title: {
    default: "SSAT Prep for Middle School | midssat.com",
    template: "%s | midssat.com"
  },
  description: "Master SSAT middle level math with comprehensive training materials and practice problems. Interactive lessons covering fractions, ratios, geometry, decimals, integers, and more.",
  keywords: [
    "SSAT math",
    "SSAT math prep",
    "SSAT middle level math",
    "SSAT math practice",
    "SSAT math test preparation",
    "middle school math prep",
    "fractions practice",
    "ratios and proportions",
    "geometry practice",
    "decimals practice",
    "integers practice",
    "SSAT math study materials",
    "SSAT math online prep",
    "middle level SSAT math",
    "SSAT quantitative",
    "math admission test",
    "percentage practice",
    "exponents practice",
    "equations practice"
  ],
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
  verification: {
    // Add your Bing Webmaster verification code here
    // Get it from: https://www.bing.com/webmasters
    other: {
      'msvalidate.01': 'YOUR_BING_VERIFICATION_CODE', // Replace with actual code from Bing Webmaster Tools
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SSAT Math Prep",
    title: "SSAT Math Prep - Middle Level Math Training",
    description: "Master SSAT middle level math with comprehensive training materials and practice problems. Interactive lessons covering fractions, ratios, geometry, decimals, integers, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSAT Math Prep - Middle Level Math Training",
    description: "Master SSAT middle level math with comprehensive training materials and practice problems. Interactive lessons covering fractions, ratios, geometry, decimals, integers, and more.",
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
  const isProduction = process.env.NODE_ENV === 'production'

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {isProduction && (
          <script defer src="https://cloud.umami.is/script.js" data-website-id="61d8f68c-ffd1-4dd2-a1ac-68f4d4c3893f"></script>
        )}
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <StructuredData />
        <GoogleAnalytics />
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <BookmarkProvider>
              <StudyHistoryProvider>
                <LoginTracker />
                <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
                <FeedbackButton />
                <Analytics />
              </StudyHistoryProvider>
            </BookmarkProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
