const stats = [
  {
    value: "10,000+",
    label: "Learners supported",
    context: "U.S. & international",
    ariaLabel: "Over ten thousand learners supported"
  },
  {
    value: "95%",
    label: "Improved practice-test scores",
    context: "within 4 weeks; active learners",
    ariaLabel: "95 percent of active learners improved their practice-test scores within 4 weeks"
  },
  {
    value: "500+",
    label: "Exam-style practice questions",
    context: "mapped to SSAT Middle; updated quarterly",
    ariaLabel: "Over 500 exam-style practice questions mapped to SSAT Middle level, updated quarterly"
  },
  {
    value: "4.9/5",
    label: "Average parent rating",
    context: "last 12 months",
    ariaLabel: "4.9 out of 5 average parent rating from last 12 months"
  },
]

export function Stats() {
  return (
    <section className="py-12 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-8 sm:gap-12 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center" aria-label={stat.ariaLabel}>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm sm:text-base text-foreground font-medium mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{stat.context}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
