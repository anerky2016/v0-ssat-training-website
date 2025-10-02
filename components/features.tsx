import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Target, TrendingUp, Users } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Comprehensive Materials",
    description: "Access hundreds of practice questions, study guides, and video lessons covering all SSAT sections.",
  },
  {
    icon: Target,
    title: "Targeted Practice",
    description: "Focus on your weak areas with adaptive practice that adjusts to your skill level.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your improvement with detailed analytics and performance insights.",
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "Get help from experienced tutors and join a community of motivated students.",
  },
]

export function Features() {
  return (
    <section id="materials" className="py-12 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3 sm:mb-4 text-balance">
            Everything You Need to Succeed
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed px-4 sm:px-0">
            Our comprehensive platform provides all the tools and resources to help you excel on test day.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                <div className="mb-3 sm:mb-4 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-base sm:text-lg font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
