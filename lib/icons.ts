// Professional Icon System for SSAT Website
// Import from multiple professional icon libraries

// Heroicons (by Tailwind team) - Clean, minimal
export {
  AcademicCapIcon,
  BookOpenIcon,
  CalculatorIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  FireIcon,
  LightBulbIcon,
  PencilIcon,
  PlayIcon,
  StarIcon,
  TrophyIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

// React Icons - Massive collection
export {
  FaGraduationCap,
  FaBook,
  FaCalculator,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaCog,
  FaFileAlt,
  FaExclamationTriangle,
  FaFire,
  FaLightbulb,
  FaPencilAlt,
  FaPlay,
  FaStar,
  FaTrophy,
  FaUsers,
  FaTimes,
  FaBrain,
  FaRocket,
  FaTarget,
  FaAward,
  FaMedal,
  FaGem,
  FaMagic,
  FaZap,
} from 'react-icons/fa'

// Phosphor Icons - Beautiful & modern
export {
  GraduationCap,
  Book,
  Calculator,
  ChartLine,
  CheckCircle,
  Clock,
  Gear,
  FileText,
  Warning,
  Flame,
  Lightbulb,
  Pencil,
  Play,
  Star,
  Trophy,
  Users,
  X,
  Brain,
  Rocket,
  Target,
  Award,
  Medal,
  Gem,
  MagicWand,
  Lightning,
} from '@phosphor-icons/react'

// Icon mapping for consistent usage
export const iconMap = {
  // Education & Learning
  education: {
    heroicons: 'AcademicCapIcon',
    reactIcons: 'FaGraduationCap',
    phosphor: 'GraduationCap',
  },
  book: {
    heroicons: 'BookOpenIcon',
    reactIcons: 'FaBook',
    phosphor: 'Book',
  },
  calculator: {
    heroicons: 'CalculatorIcon',
    reactIcons: 'FaCalculator',
    phosphor: 'Calculator',
  },
  
  // Success & Achievement
  success: {
    heroicons: 'CheckCircleIcon',
    reactIcons: 'FaCheckCircle',
    phosphor: 'CheckCircle',
  },
  trophy: {
    heroicons: 'TrophyIcon',
    reactIcons: 'FaTrophy',
    phosphor: 'Trophy',
  },
  star: {
    heroicons: 'StarIcon',
    reactIcons: 'FaStar',
    phosphor: 'Star',
  },
  
  // Energy & Motivation
  fire: {
    heroicons: 'FireIcon',
    reactIcons: 'FaFire',
    phosphor: 'Flame',
  },
  lightning: {
    reactIcons: 'FaZap',
    phosphor: 'Lightning',
  },
  rocket: {
    reactIcons: 'FaRocket',
    phosphor: 'Rocket',
  },
  
  // Learning Tools
  brain: {
    reactIcons: 'FaBrain',
    phosphor: 'Brain',
  },
  target: {
    reactIcons: 'FaTarget',
    phosphor: 'Target',
  },
  magic: {
    reactIcons: 'FaMagic',
    phosphor: 'MagicWand',
  },
}

// Icon size presets
export const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-12 w-12',
}

// Icon color presets
export const iconColors = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  muted: 'text-muted-foreground',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  info: 'text-blue-600',
}
