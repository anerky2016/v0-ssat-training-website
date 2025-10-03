import React from 'react'
import { cn } from '@/lib/utils'

// Lucide React imports - Modern, beautiful icons
import {
  GraduationCap as GraduationCapIcon,
  BookOpen as BookOpenIcon,
  Calculator as CalculatorIcon,
  BarChart3 as BarChart3Icon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  Settings as SettingsIcon,
  FileText as FileTextIcon,
  AlertTriangle as AlertTriangleIcon,
  Flame as FlameIcon,
  Lightbulb as LightbulbIcon,
  PenTool as PenToolIcon,
  Play as PlayIcon,
  Star as StarIcon,
  Trophy as TrophyIcon,
  Users as UsersIcon,
  X as XIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  XCircle as XCircleIcon,
  Check as CheckIcon,
  AlertCircle as AlertCircleIcon,
  Info as InfoIcon,
  Heart as HeartIcon,
  Sparkles as SparklesIcon,
  Zap as ZapIcon,
  Rocket as RocketIcon,
  Target as TargetIcon,
  Brain as BrainIcon,
  Puzzle as PuzzleIcon,
  Gift as GiftIcon,
  Shield as ShieldIcon,
  Award as AwardIcon,
  Medal as MedalIcon,
  Gem as GemIcon,
  Crown as CrownIcon,
} from 'lucide-react'

// Icon mapping - Modern and clean
const iconMap = {
  // Education & Learning
  'academic-cap': GraduationCapIcon,
  'book-open': BookOpenIcon,
  calculator: CalculatorIcon,
  'chart-bar': BarChart3Icon,

  // Success & Achievement
  'check-circle': CheckCircleIcon,
  trophy: TrophyIcon,
  star: StarIcon,
  award: AwardIcon,
  medal: MedalIcon,
  gem: GemIcon,
  crown: CrownIcon,
  'shield-check': ShieldIcon,

  // Energy & Motivation
  fire: FlameIcon,
  zap: ZapIcon,
  rocket: RocketIcon,
  sparkles: SparklesIcon,

  // Learning Tools
  brain: BrainIcon,
  target: TargetIcon,
  puzzle: PuzzleIcon,
  'light-bulb': LightbulbIcon,
  'pen-tool': PenToolIcon,

  // UI Elements
  clock: ClockIcon,
  settings: SettingsIcon,
  'file-text': FileTextIcon,
  'alert-triangle': AlertTriangleIcon,
  play: PlayIcon,
  users: UsersIcon,
  'x-mark': XIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-left': ArrowLeftIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  search: SearchIcon,
  menu: MenuIcon,
  'x-circle': XCircleIcon,
  check: CheckIcon,
  'alert-circle': AlertCircleIcon,
  info: InfoIcon,
  heart: HeartIcon,
  gift: GiftIcon,
  shield: ShieldIcon,
} as const

export type IconName = keyof typeof iconMap

export interface IconProps {
  name: IconName
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  color?: string
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-12 w-12',
}

export function Icon({ 
  name, 
  size = 'md', 
  className,
  color 
}: IconProps) {
  const IconComponent = iconMap[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <IconComponent 
      className={cn(
        sizeClasses[size],
        color && `text-${color}`,
        className
      )}
    />
  )
}

// Convenience components for common icons
export const AcademicCap = (props: Omit<IconProps, 'name'>) => <Icon name="academic-cap" {...props} />
export const BookOpen = (props: Omit<IconProps, 'name'>) => <Icon name="book-open" {...props} />
export const Calculator = (props: Omit<IconProps, 'name'>) => <Icon name="calculator" {...props} />
export const ChartBar = (props: Omit<IconProps, 'name'>) => <Icon name="chart-bar" {...props} />
export const CheckCircle = (props: Omit<IconProps, 'name'>) => <Icon name="check-circle" {...props} />
export const Clock = (props: Omit<IconProps, 'name'>) => <Icon name="clock" {...props} />
export const Settings = (props: Omit<IconProps, 'name'>) => <Icon name="settings" {...props} />
export const FileText = (props: Omit<IconProps, 'name'>) => <Icon name="file-text" {...props} />
export const AlertTriangle = (props: Omit<IconProps, 'name'>) => <Icon name="alert-triangle" {...props} />
export const Flame = (props: Omit<IconProps, 'name'>) => <Icon name="fire" {...props} />
export const LightBulb = (props: Omit<IconProps, 'name'>) => <Icon name="light-bulb" {...props} />
export const PenTool = (props: Omit<IconProps, 'name'>) => <Icon name="pen-tool" {...props} />
export const Play = (props: Omit<IconProps, 'name'>) => <Icon name="play" {...props} />
export const Star = (props: Omit<IconProps, 'name'>) => <Icon name="star" {...props} />
export const Trophy = (props: Omit<IconProps, 'name'>) => <Icon name="trophy" {...props} />
export const Users = (props: Omit<IconProps, 'name'>) => <Icon name="users" {...props} />
export const XMark = (props: Omit<IconProps, 'name'>) => <Icon name="x-mark" {...props} />
export const Brain = (props: Omit<IconProps, 'name'>) => <Icon name="brain" {...props} />
export const Target = (props: Omit<IconProps, 'name'>) => <Icon name="target" {...props} />
export const Zap = (props: Omit<IconProps, 'name'>) => <Icon name="zap" {...props} />
export const Rocket = (props: Omit<IconProps, 'name'>) => <Icon name="rocket" {...props} />
export const Sparkles = (props: Omit<IconProps, 'name'>) => <Icon name="sparkles" {...props} />
export const Heart = (props: Omit<IconProps, 'name'>) => <Icon name="heart" {...props} />
export const Gift = (props: Omit<IconProps, 'name'>) => <Icon name="gift" {...props} />
export const Shield = (props: Omit<IconProps, 'name'>) => <Icon name="shield" {...props} />
export const Award = (props: Omit<IconProps, 'name'>) => <Icon name="award" {...props} />
export const Medal = (props: Omit<IconProps, 'name'>) => <Icon name="medal" {...props} />
export const Gem = (props: Omit<IconProps, 'name'>) => <Icon name="gem" {...props} />
export const Crown = (props: Omit<IconProps, 'name'>) => <Icon name="crown" {...props} />
export const ArrowRight = (props: Omit<IconProps, 'name'>) => <Icon name="arrow-right" {...props} />
export const ArrowLeft = (props: Omit<IconProps, 'name'>) => <Icon name="arrow-left" {...props} />
export const Plus = (props: Omit<IconProps, 'name'>) => <Icon name="plus" {...props} />
export const Minus = (props: Omit<IconProps, 'name'>) => <Icon name="minus" {...props} />
export const Check = (props: Omit<IconProps, 'name'>) => <Icon name="check" {...props} />
export const XCircle = (props: Omit<IconProps, 'name'>) => <Icon name="x-circle" {...props} />
export const AlertCircle = (props: Omit<IconProps, 'name'>) => <Icon name="alert-circle" {...props} />
export const Info = (props: Omit<IconProps, 'name'>) => <Icon name="info" {...props} />