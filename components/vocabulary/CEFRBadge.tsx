"use client"

import { CEFRLevel, getCEFRDescription, getCEFRColor, getCEFRDetailedDescription } from '@/lib/vocabulary-levels'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  const detailedDescription = getCEFRDetailedDescription(level)
  const colorClasses = getCEFRColor(level)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`
              inline-flex items-center gap-1.5 rounded-full font-medium cursor-help
              ${colorClasses}
              ${sizeClasses[size]}
              ${className}
            `}
          >
            <span className="font-semibold">{level}</span>
            {showDescription && (
              <span className="hidden sm:inline">
                {description}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <div className="font-semibold">CEFR Level {level} - {description}</div>
            <div className="text-xs text-muted-foreground">{detailedDescription}</div>
            <div className="text-xs text-muted-foreground italic border-t border-border pt-1 mt-2">
              Common European Framework of Reference for Languages
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
