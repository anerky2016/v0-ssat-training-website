import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TestSections } from "@/components/test-sections"
import { Stats } from "@/components/stats"
import { Footer } from "@/components/footer"
import { StructuredData, websiteStructuredData, generateBreadcrumbStructuredData } from "@/components/structured-data"

const breadcrumbData = generateBreadcrumbStructuredData([
  { name: 'Home', url: '/' },
])

export default function Home() {
  return (
    <div className="min-h-screen">
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={breadcrumbData} />
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
