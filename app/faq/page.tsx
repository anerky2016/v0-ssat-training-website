"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const faqs = [
  {
    question: "What is the SSAT?",
    answer: "The SSAT (Secondary School Admission Test) is a standardized test used by independent schools for admission. The Middle Level test is for students currently in grades 5-7 applying to grades 6-8."
  },
  {
    question: "What math topics are covered on the SSAT Middle Level?",
    answer: "The SSAT Middle Level covers arithmetic, elementary algebra, geometry, fractions, decimals, percentages, ratios and proportions, integers, word problems, and basic mathematical reasoning."
  },
  {
    question: "How is this site organized?",
    answer: "Our site is organized by math topics (like fractions, ratios, geometry), with each topic offering lessons, practice exercises, and worked examples. You can navigate through topics at your own pace."
  },
  {
    question: "Are the practice questions similar to actual SSAT questions?",
    answer: "Yes, our practice questions are designed to match the difficulty level and format of actual SSAT Middle Level math questions, helping you prepare effectively for the test."
  },
  {
    question: "Do I need to create an account to use the site?",
    answer: "Currently, you can access all practice materials and lessons without creating an account. Simply browse to any topic and start practicing."
  },
  {
    question: "How should I use this site to prepare for the SSAT?",
    answer: "We recommend starting with topics you find challenging, working through the lessons and examples, then practicing with exercises at different difficulty levels. Take practice tests to simulate the actual exam experience."
  },
  {
    question: "What is the difference between Easy, Medium, Challenge, and Extreme difficulty levels?",
    answer: "Easy questions cover basic concepts, Medium questions require applying multiple concepts, Challenge questions involve complex problem-solving, and Extreme questions are designed for students aiming for top scores."
  },
  {
    question: "Can I see the solutions to practice problems?",
    answer: "Yes, each practice problem includes a 'Show Answer' button that reveals the solution with explanations to help you understand the approach."
  },
  {
    question: "Is this site free to use?",
    answer: "Yes, all practice materials, lessons, and exercises on midssat.com are currently free to access."
  },
  {
    question: "How do I contact support if I have a question?",
    answer: "You can reach our support team at support@midssat.com. We typically respond within 24-48 hours during business days."
  },
  {
    question: "Do you offer live tutoring or one-on-one help?",
    answer: "For inquiries about tutoring services or personalized help, please contact sales@midssat.com."
  },
  {
    question: "How often is new content added?",
    answer: "We regularly update our content with new practice problems, lessons, and topics. Check back frequently for new materials."
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
                Frequently Asked Questions
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground text-pretty leading-relaxed">
                Find answers to common questions about SSAT Math Prep
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="border-border bg-card">
                    <CardHeader
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleFAQ(index)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-card-foreground pr-4">
                          {faq.question}
                        </CardTitle>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${
                            openIndex === index ? 'transform rotate-180' : ''
                          }`}
                        />
                      </div>
                    </CardHeader>
                    {openIndex === index && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {/* Contact CTA */}
              <Card className="border-border bg-muted/30 mt-8">
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground">Still have questions?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you couldn't find the answer you're looking for, feel free to contact our support team.
                  </p>
                  <Link href="/contact">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      Contact Us
                    </button>
                  </Link>
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
