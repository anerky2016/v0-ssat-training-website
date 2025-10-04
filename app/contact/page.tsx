import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, ShoppingCart, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { StructuredData, generateContactPageStructuredData, generateBreadcrumbStructuredData } from "@/components/structured-data"

const contactData = generateContactPageStructuredData()
const breadcrumbData = generateBreadcrumbStructuredData([
  { name: 'Home', url: '/' },
  { name: 'Contact', url: '/contact' },
])

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <StructuredData data={contactData} />
      <StructuredData data={breadcrumbData} />
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Mail className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
                Contact Us
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground text-pretty leading-relaxed">
                Have questions about SSAT Math Prep? We're here to help! Reach out to our team.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
                {/* Support Email */}
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">General Support</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      For questions about lessons, practice problems, or technical support
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a
                      href="mailto:support@midssat.com"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      <Mail className="h-4 w-4" />
                      support@midssat.com
                    </a>
                  </CardContent>
                </Card>

                {/* Sales Email */}
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10 text-chart-2">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">Sales & Partnerships</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      For inquiries about subscriptions, pricing, or partnership opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a
                      href="mailto:sales@midssat.com"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      <Mail className="h-4 w-4" />
                      sales@midssat.com
                    </a>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info */}
              <Card className="border-border bg-muted/30 mt-8">
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We typically respond to all inquiries within 24-48 hours during business days (Monday-Friday).
                    For urgent technical issues, please include "URGENT" in your email subject line.
                  </p>
                </CardContent>
              </Card>
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
