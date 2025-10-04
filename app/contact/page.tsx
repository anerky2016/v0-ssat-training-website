"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, ShoppingCart, ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { StructuredData, generateContactPageStructuredData, generateBreadcrumbStructuredData } from "@/components/structured-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState } from "react"

const contactData = generateContactPageStructuredData()
const breadcrumbData = generateBreadcrumbStructuredData([
  { name: 'Home', url: '/' },
  { name: 'Contact', url: '/contact' },
])

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'support'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const emailAddress = formData.type === 'sales' ? 'sales@midssat.com' : 'support@midssat.com'
    const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`

    window.location.href = mailtoLink

    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '', type: 'support' })

      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
    }, 500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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
                Have questions about SSAT Math Prep? We're here to help! Send us a message.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-2xl text-card-foreground">Send us a message</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Fill out the form below and we'll get back to you as soon as possible.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              placeholder="Your name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="your.email@example.com"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="bg-background"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Department *</Label>
                          <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="support">General Support</option>
                            <option value="sales">Sales & Partnerships</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            placeholder="What's this about?"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="bg-background"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message *</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Tell us more about your inquiry..."
                            value={formData.message}
                            onChange={handleChange}
                            required
                            className="min-h-[150px] bg-background"
                          />
                        </div>

                        {submitStatus === 'success' && (
                          <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                            <p className="text-sm text-green-800 dark:text-green-200">
                              Your email client should open now. If it doesn't, please email us directly at{' '}
                              {formData.type === 'sales' ? 'sales@midssat.com' : 'support@midssat.com'}
                            </p>
                          </div>
                        )}

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full sm:w-auto"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>Sending...</>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Info Sidebar */}
                <div className="space-y-6">
                  {/* Support Email */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10 text-chart-1">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg text-card-foreground">General Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a
                        href="mailto:support@midssat.com"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                      >
                        <Mail className="h-4 w-4" />
                        support@midssat.com
                      </a>
                    </CardContent>
                  </Card>

                  {/* Sales Email */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg text-card-foreground">Sales & Partnerships</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a
                        href="mailto:sales@midssat.com"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                      >
                        <Mail className="h-4 w-4" />
                        sales@midssat.com
                      </a>
                    </CardContent>
                  </Card>

                  {/* Response Time */}
                  <Card className="border-border bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-card-foreground">Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        We typically respond within 24-48 hours during business days (Monday-Friday).
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
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
