"use client"

import { CEFRLevel, getCEFRDescription, getCEFRColor } from '@/lib/vocabulary-levels'

interface CEFRBadgeProps {
  level: CEFRLevel
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function CEFRBadge({
  level,
  showDescription = true,
  size = 'md',
  className = ''
}: CEFRBadgeProps) {
  const description = getCEFRDescription(level)
  const colorClasses = getCEFRColor(level)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${colorClasses}
        ${sizeClasses[size]}
        ${className}
      `}
      title={showDescription ? description : undefined}
    >
      <span className="font-semibold">{level}</span>
      {showDescription && (
        <span className="hidden sm:inline">
          {description}
        </span>
      )}
    </span>
  )
}
