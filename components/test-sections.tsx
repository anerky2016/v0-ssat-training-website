import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, BookOpen, Target, Trophy } from "lucide-react"
import Link from "next/link"

const mathTopics = [
  {
    icon: Calculator,
    title: "Arithmetic",
    description: "Master fundamental operations",
    topics: ["Fractions & decimals", "Percentages", "Ratios & proportions", "Order of operations"],
    color: "bg-chart-1/10 text-chart-1",
    href: "/math/arithmetic",
  },
  {
    icon: BookOpen,
    title: "Algebra",
    description: "Build problem-solving skills",
    topics: ["Variables & expressions", "Linear equations", "Inequalities", "Word problems"],
    color: "bg-chart-2/10 text-chart-2",
    href: "/math/algebra",
  },
  {
    icon: Target,
    title: "Geometry",
    description: "Understand shapes & space",
    topics: ["Angles & triangles", "Circles & polygons", "Area & perimeter", "Volume & surface area"],
    color: "bg-chart-3/10 text-chart-3",
    href: "/math/geometry",
  },
  {
    icon: Trophy,
    title: "Advanced Topics",
    description: "Challenge yourself further",
    topics: ["Probability & statistics", "Number theory", "Patterns & sequences", "Logic problems"],
    color: "bg-chart-4/10 text-chart-4",
    href: "/math/advanced",
  },
]

export function TestSections() {
  return (
    <section id="sections" className="py-12 sm:py-20 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3 sm:mb-4 text-balance">
            Master Every Math Topic
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed px-4 sm:px-0">
            Comprehensive preparation covering all quantitative topics on the Middle Level SSAT.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {mathTopics.map((topic) => (
            <Card key={topic.title} className="border-border bg-card">
              <CardHeader className="pb-4">
                <div
                  className={`mb-3 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl ${topic.color}`}
                >
                  <topic.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-card-foreground">{topic.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {topic.topics.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href={topic.href}>
                  <Button variant="outline" size="sm" className="w-full bg-transparent text-sm">
                    Start Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
