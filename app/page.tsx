import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { RecentUpdatesCarousel } from "@/components/recent-updates-carousel"
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
        <RecentUpdatesCarousel />
        <TestSections />
        <QuestionsCarousel />
        <TrustedContent />
        <Stats />
      </main>
      <Footer />
    </div>
  )
}
