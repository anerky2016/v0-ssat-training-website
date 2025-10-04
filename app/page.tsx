import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TestSections } from "@/components/test-sections"
import { Stats } from "@/components/stats"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <TestSections />
        <Stats />
      </main>
      <Footer />
    </div>
  )
}
