import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { RecentUpdatesCarousel } from "@/components/recent-updates-carousel"
import { StudyReminder } from "@/components/study-reminder"
import { SubjectSections } from "@/components/subject-sections"
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
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <StudyReminder />
            </div>
          </div>
        </section>
        <SubjectSections />
        <TestSections />
        <QuestionsCarousel />
        <TrustedContent />
        <Stats />
      </main>
      <Footer />
    </div>
  )
}
