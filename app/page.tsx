import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { TestSections } from "@/components/test-sections"
import { Stats } from "@/components/stats"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <TestSections />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
