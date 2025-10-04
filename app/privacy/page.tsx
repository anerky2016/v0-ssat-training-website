import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { StructuredData, generateBreadcrumbStructuredData } from "@/components/structured-data"

const breadcrumbData = generateBreadcrumbStructuredData([
  { name: 'Home', url: '/' },
  { name: 'Privacy Policy', url: '/privacy' },
])

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <StructuredData data={breadcrumbData} />
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-muted-foreground">
                Last updated: January 2025
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl prose prose-slate dark:prose-invert">
              <h2>1. Information We Collect</h2>
              <p>
                When you use midssat.com, we may collect the following types of information:
              </p>
              <ul>
                <li><strong>Usage Data:</strong> We collect information about how you interact with our website, including pages visited, time spent on pages, and practice problems attempted.</li>
                <li><strong>Device Information:</strong> We automatically collect certain information about your device, including IP address, browser type, and operating system.</li>
                <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to enhance your experience and analyze site usage.</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul>
                <li>To provide and maintain our educational services</li>
                <li>To improve and personalize your learning experience</li>
                <li>To analyze usage patterns and improve our content</li>
                <li>To communicate with you about updates and new features</li>
                <li>To ensure the security and integrity of our platform</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share information with:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> Third-party companies that help us operate our website (e.g., analytics providers)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>

              <h2>4. Analytics</h2>
              <p>
                We use Google Analytics and Umami Analytics to understand how visitors use our site. These services collect information such as how often users visit the site, what pages they visit, and what other sites they used prior to coming to our site.
              </p>

              <h2>5. Cookies</h2>
              <p>
                We use cookies to improve your experience on our website. You can set your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of our site may not function properly without cookies.
              </p>

              <h2>6. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2>7. Children's Privacy</h2>
              <p>
                Our service is intended for students preparing for the SSAT. We do not knowingly collect personal information from children under 13 without parental consent. If you believe we have collected information from a child under 13, please contact us at support@midssat.com.
              </p>

              <h2>8. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
              </ul>

              <h2>9. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>

              <h2>10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p>
                Email: <a href="mailto:support@midssat.com">support@midssat.com</a>
              </p>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex justify-center">
              <Link href="/">
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
