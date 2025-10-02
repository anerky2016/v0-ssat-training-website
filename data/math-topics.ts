import { Topic } from '@/lib/types'
import { Calculator, BookOpen, Target, Hash, Percent, Zap, Ruler, BarChart3 } from 'lucide-react'

export const mathTopics: Topic[] = [
  {
    icon: Calculator,
    title: "Chapter 1: Fractions & Mixed Numbers",
    description: "Master fraction operations and mixed number calculations",
    topics: [
      "Simplifying Fractions",
      "Adding/Subtracting Fractions", 
      "Multiplying/Dividing Fractions",
      "Adding/Subtracting Mixed Numbers",
      "Multiplying/Dividing Mixed Numbers"
    ],
    color: "bg-chart-1/10 text-chart-1",
    href: "/math/fractions",
  },
  {
    icon: BookOpen,
    title: "Chapter 2: Decimals",
    description: "Work with decimal numbers and operations",
    topics: [
      "Comparing Decimals",
      "Rounding Decimals",
      "Adding/Subtracting Decimals",
      "Multiplying/Dividing Decimals"
    ],
    color: "bg-chart-2/10 text-chart-2",
    href: "/math/decimals",
  },
  {
    icon: Hash,
    title: "Chapter 3: Factoring Numbers",
    description: "Understand number factors and prime factorization",
    topics: [
      "Factoring Numbers",
      "Greatest Common Factor (GCF)",
      "Least Common Multiple (LCM)"
    ],
    color: "bg-chart-3/10 text-chart-3",
    href: "/math/factoring",
  },
  {
    icon: Target,
    title: "Chapter 4: Integers & Order of Operations",
    description: "Master integer operations and PEMDAS",
    topics: [
      "Adding/Subtracting Integers",
      "Multiplying/Dividing Integers",
      "Ordering Integers & Numbers",
      "Order of Operations",
      "Integers & Absolute Value"
    ],
    color: "bg-chart-4/10 text-chart-4",
    href: "/math/integers",
  },
  {
    icon: Percent,
    title: "Chapter 5: Ratios",
    description: "Understand proportional relationships",
    topics: [
      "Simplifying Ratios",
      "Proportional Ratios",
      "Creating Proportions",
      "Similarity & Ratios",
      "Simple Interest"
    ],
    color: "bg-chart-5/10 text-chart-5",
    href: "/math/ratios",
  },
  {
    icon: Calculator,
    title: "Chapter 6: Percentage",
    description: "Calculate percentages and applications",
    topics: [
      "Percentage Calculations",
      "Percent Problems",
      "Percent Increase & Decrease",
      "Discount/Tax/Tip"
    ],
    color: "bg-chart-6/10 text-chart-6",
    href: "/math/percentage",
  },
  {
    icon: Zap,
    title: "Chapter 7: Exponents & Variables",
    description: "Work with powers and variables",
    topics: [
      "Multiplication/Division Properties of Exponents",
      "Powers of Products & Quotients",
      "Zero & Negative Exponents",
      "Negative Exponents & Negative Bases",
      "Scientific Notation",
      "Square Roots"
    ],
    color: "bg-chart-7/10 text-chart-7",
    href: "/math/exponents",
  },
  {
    icon: BookOpen,
    title: "Chapter 8: Expressions & Variables",
    description: "Simplify and evaluate algebraic expressions",
    topics: [
      "Simplifying Variable Expressions",
      "Simplifying Polynomial Expressions",
      "Translating Phrases to Algebra",
      "Distributive Property",
      "Evaluating One Variable",
      "Evaluating Two Variables",
      "Combining Like Terms"
    ],
    color: "bg-chart-8/10 text-chart-8",
    href: "/math/expressions",
  },
  {
    icon: Target,
    title: "Chapter 9: Equations & Inequalities",
    description: "Solve equations and inequalities",
    topics: [
      "One-Step Equations",
      "Multi-Step Equations",
      "Graphing Single-Variable Inequalities",
      "One-Step Inequalities",
      "Multi-Step Inequalities"
    ],
    color: "bg-chart-9/10 text-chart-9",
    href: "/math/equations",
  },
  {
    icon: Ruler,
    title: "Chapter 10: Geometry & Solid Figures",
    description: "Calculate area, perimeter, and volume",
    topics: [
      "Pythagorean Theorem",
      "Triangles",
      "Polygons",
      "Circles",
      "Trapezoids",
      "Cubes",
      "Rectangular Prisms",
      "Cylinder"
    ],
    color: "bg-chart-10/10 text-chart-10",
    href: "/math/geometry",
  },
  {
    icon: BarChart3,
    title: "Chapter 11: Statistics & Probability",
    description: "Analyze data and calculate probabilities",
    topics: [
      "Mean, Median, Mode, Range",
      "Histograms",
      "Pie Graphs",
      "Probability"
    ],
    color: "bg-chart-11/10 text-chart-11",
    href: "/math/statistics",
  },
]
