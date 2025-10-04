import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { StructuredData, generateBreadcrumbStructuredData } from "@/components/structured-data"

const breadcrumbData = generateBreadcrumbStructuredData([
  { name: 'Home', url: '/' },
  { name: 'Terms of Service', url: '/terms' },
])

export default function TermsPage() {
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
                Terms of Service
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
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using midssat.com ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>

              <h2>2. Use of Service</h2>
              <p>
                The Service provides educational materials for SSAT test preparation. You agree to use the Service only for lawful purposes and in accordance with these Terms.
              </p>
              <p>You agree not to:</p>
              <ul>
                <li>Use the Service in any way that violates applicable laws or regulations</li>
                <li>Copy, reproduce, or distribute content without permission</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems or software to extract data from the Service</li>
              </ul>

              <h2>3. Educational Content</h2>
              <p>
                All content on midssat.com, including but not limited to practice problems, lessons, explanations, and study materials, is provided for educational purposes only. We strive for accuracy but do not guarantee that the content is error-free or complete.
              </p>

              <h2>4. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by midssat.com and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You may access and use the content for personal, non-commercial educational purposes. You may not reproduce, distribute, modify, create derivative works, publicly display, or otherwise use our content without prior written permission.
              </p>

              <h2>5. User Accounts</h2>
              <p>
                Currently, midssat.com does not require user accounts for accessing basic content. If we implement user accounts in the future, you will be responsible for maintaining the confidentiality of your account credentials.
              </p>

              <h2>6. Disclaimer of Warranties</h2>
              <p>
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that:
              </p>
              <ul>
                <li>The Service will be uninterrupted, secure, or error-free</li>
                <li>The results obtained from using the Service will be accurate or reliable</li>
                <li>The quality of the Service will meet your expectations</li>
                <li>Use of the Service will guarantee any specific test scores or admission outcomes</li>
              </ul>

              <h2>7. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, midssat.com shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>

              <h2>8. Third-Party Links</h2>
              <p>
                The Service may contain links to third-party websites or services that are not owned or controlled by midssat.com. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.
              </p>

              <h2>9. SSAT Trademark</h2>
              <p>
                SSAT is a registered trademark of The Enrollment Management Association. This website is not affiliated with, endorsed by, or connected to The Enrollment Management Association.
              </p>

              <h2>10. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
              </p>

              <h2>11. Termination</h2>
              <p>
                We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
              </p>

              <h2>12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>

              <h2>13. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
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
