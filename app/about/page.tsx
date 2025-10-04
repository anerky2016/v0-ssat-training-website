import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Target, Users, BookOpen, Award } from "lucide-react"
import Link from "next/link"
import { StructuredData, generateBreadcrumbStructuredData } from "@/components/structured-data"

const breadcrumbData = generateBreadcrumbStructuredData([
  { name: 'Home', url: '/' },
  { name: 'About Us', url: '/about' },
])

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <StructuredData data={breadcrumbData} />
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
                About SSAT Prep
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Empowering students to achieve their best on the Middle Level SSAT through comprehensive, accessible, and effective test preparation materials.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                <div className="flex flex-col items-start">
                  <div className="rounded-lg bg-primary/10 p-3 mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mb-3">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We are dedicated to providing high-quality SSAT preparation resources that help middle school students build confidence and excel on test day. Our goal is to make effective test preparation accessible to all students, regardless of their background or resources.
                  </p>
                </div>

                <div className="flex flex-col items-start">
                  <div className="rounded-lg bg-primary/10 p-3 mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mb-3">Our Approach</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We believe in learning by doing. Our platform offers interactive practice problems, detailed explanations, and comprehensive coverage of all SSAT Middle Level topics. We focus on building fundamental skills while developing effective test-taking strategies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">What We Offer</h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="bg-background rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Comprehensive Math Coverage</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Practice problems covering fractions, decimals, ratios, geometry, integers, statistics, algebra, and more. Each topic includes multiple difficulty levels and detailed step-by-step solutions.
                  </p>
                </div>

                <div className="bg-background rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Verbal Reasoning Practice</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Build vocabulary, improve reading comprehension, and master verbal reasoning skills with our targeted practice exercises and proven strategies.
                  </p>
                </div>

                <div className="bg-background rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Interactive Learning</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Engage with interactive practice problems that provide immediate feedback. Learn from your mistakes with detailed explanations for every question.
                  </p>
                </div>

                <div className="bg-background rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Test-Taking Strategies</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Master proven tactics and strategies to maximize your score, manage your time effectively, and approach challenging questions with confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Serve Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 text-center">Who We Serve</h2>
              <div className="prose prose-slate dark:prose-invert mx-auto">
                <p className="text-muted-foreground leading-relaxed">
                  Our platform is designed for students in grades 5-7 preparing for the Middle Level SSAT examination. Whether you're just beginning your test preparation journey or looking to refine your skills before test day, our resources adapt to your needs.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We also support parents and educators who are helping students prepare for the SSAT. Our clear explanations and structured curriculum make it easy to guide students through their preparation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">Our Values</h2>

              <div className="space-y-6">
                <div className="bg-background rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Quality
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We maintain the highest standards for our educational content. Every practice problem is carefully crafted to align with SSAT Middle Level standards and reviewed for accuracy.
                  </p>
                </div>

                <div className="bg-background rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Accessibility
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We believe quality test preparation should be accessible to all students. Our platform provides free access to comprehensive SSAT preparation materials, removing financial barriers to success.
                  </p>
                </div>

                <div className="bg-background rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Continuous Improvement
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We are constantly expanding our content library, refining our explanations, and incorporating user feedback to create the best possible learning experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-3">Independent Resource</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  midssat.com is an independent educational resource and is not affiliated with, endorsed by, or connected to The Enrollment Management Association or any official SSAT organization. SSAT® is a registered trademark of The Enrollment Management Association. All references to "SSAT" are used solely for descriptive purposes to indicate the subject matter of our educational materials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Ready to Start Your SSAT Journey?
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Explore our comprehensive collection of practice problems, lessons, and test-taking strategies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/math">
                  <button className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90 transition-colors">
                    Explore Math Topics
                  </button>
                </Link>
                <Link href="/verbal">
                  <button className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-md text-base font-medium bg-background hover:bg-accent transition-colors">
                    Explore Verbal Topics
                  </button>
                </Link>
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
