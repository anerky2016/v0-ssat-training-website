import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TestSections } from "@/components/test-sections"
import { QuestionsCarousel } from "@/components/questions-carousel"
import { TrustedContent } from "@/components/trusted-content"
import { Stats } from "@/components/stats"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <TestSections />
        <QuestionsCarousel />
        <TrustedContent />
        <Stats />
      </main>
      <Footer />
    </div>
  )
}
