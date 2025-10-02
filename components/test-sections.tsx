import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, BookOpen, Target, Hash, Percent, Zap, Ruler, BarChart3 } from "lucide-react"
import Link from "next/link"

const mathTopics = [
  {
    icon: Calculator,
    title: "Chapter 1: Fractions & Mixed Numbers",
    description: "Master fraction operations and conversions",
    topics: ["Simplifying Fractions", "Adding/Subtracting Fractions", "Multiplying/Dividing Fractions", "Mixed Numbers"],
    color: "bg-chart-1/10 text-chart-1",
    href: "/math/fractions",
  },
  {
    icon: BookOpen,
    title: "Chapter 2: Decimals",
    description: "Work with decimal numbers and operations",
    topics: ["Comparing Decimals", "Rounding Decimals", "Adding/Subtracting Decimals", "Multiplying/Dividing Decimals"],
    color: "bg-chart-2/10 text-chart-2",
    href: "/math/decimals",
  },
  {
    icon: Hash,
    title: "Chapter 3: Factoring Numbers",
    description: "Understand number factors and prime factorization",
    topics: ["Factoring Numbers", "Greatest Common Factor (GCF)", "Least Common Multiple (LCM)"],
    color: "bg-chart-3/10 text-chart-3",
    href: "/math/factoring",
  },
  {
    icon: Target,
    title: "Chapter 4: Integers & Order of Operations",
    description: "Master integer operations and PEMDAS",
    topics: ["Adding/Subtracting Integers", "Multiplying/Dividing Integers", "Order of Operations", "Absolute Value"],
    color: "bg-chart-4/10 text-chart-4",
    href: "/math/integers",
  },
  {
    icon: Percent,
    title: "Chapter 5: Ratios",
    description: "Understand proportional relationships",
    topics: ["Simplifying Ratios", "Proportional Ratios", "Creating Proportions", "Simple Interest"],
    color: "bg-chart-5/10 text-chart-5",
    href: "/math/ratios",
  },
  {
    icon: Calculator,
    title: "Chapter 6: Percentage",
    description: "Calculate percentages and applications",
    topics: ["Percentage Calculations", "Percent Problems", "Percent Increase & Decrease", "Discount/Tax/Tip"],
    color: "bg-chart-6/10 text-chart-6",
    href: "/math/percentage",
  },
  {
    icon: Zap,
    title: "Chapter 7: Exponents & Variables",
    description: "Work with powers and variables",
    topics: ["Exponent Rules", "Zero & Negative Exponents", "Scientific Notation", "Square Roots"],
    color: "bg-chart-7/10 text-chart-7",
    href: "/math/exponents",
  },
  {
    icon: BookOpen,
    title: "Chapter 8: Expressions & Variables",
    description: "Simplify and evaluate algebraic expressions",
    topics: ["Simplifying Variable Expressions", "Distributive Property", "Evaluating Variables", "Combining Like Terms"],
    color: "bg-chart-8/10 text-chart-8",
    href: "/math/expressions",
  },
  {
    icon: Target,
    title: "Chapter 9: Equations & Inequalities",
    description: "Solve equations and inequalities",
    topics: ["One-Step Equations", "Multi-Step Equations", "Graphing Inequalities", "Multi-Step Inequalities"],
    color: "bg-chart-9/10 text-chart-9",
    href: "/math/equations",
  },
  {
    icon: Ruler,
    title: "Chapter 10: Geometry & Solid Figures",
    description: "Calculate area, perimeter, and volume",
    topics: ["Pythagorean Theorem", "Triangles", "Circles", "Cubes & Prisms"],
    color: "bg-chart-10/10 text-chart-10",
    href: "/math/geometry",
  },
  {
    icon: BarChart3,
    title: "Chapter 11: Statistics & Probability",
    description: "Analyze data and calculate probabilities",
    topics: ["Mean, Median, Mode, Range", "Histograms", "Pie Graphs", "Probability"],
    color: "bg-chart-11/10 text-chart-11",
    href: "/math/statistics",
  },
]

export function TestSections() {
  return (
    <section id="sections" className="py-12 sm:py-20 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3 sm:mb-4 text-balance">
            🎯 Master All 11 Math Chapters
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed px-4 sm:px-0">
            Complete coverage of all SSAT math topics with dedicated exercises, tactics, and tests! 🚀
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
