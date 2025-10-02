const stats = [
  { value: "10,000+", label: "Students Prepared" },
  { value: "95%", label: "Score Improvement" },
  { value: "500+", label: "Practice Questions" },
  { value: "4.9/5", label: "Parent Rating" },
]

export function Stats() {
  return (
    <section className="py-12 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-6 sm:gap-8 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
