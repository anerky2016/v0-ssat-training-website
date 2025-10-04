import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SSAT Math Test-Taking Strategies & Tactics",
  description: "Master proven test-taking strategies and tactics for SSAT middle level math. Learn time management, problem-solving shortcuts, and common mistake patterns.",
  keywords: ["SSAT test strategies", "SSAT math tactics", "test-taking tips", "SSAT shortcuts"],
}

export default function TacticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
