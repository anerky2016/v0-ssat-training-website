import { LucideIcon } from 'lucide-react'

export interface Topic {
  icon: LucideIcon
  title: string
  description: string
  topics: string[]
  color?: string
  href?: string
  lessons?: Array<{
    title: string
    path: string
    status?: string
  }>
}
