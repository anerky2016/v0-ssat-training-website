"use client"

import { useState } from 'react'
import { CEFRLevel, getCEFRDescription, getCEFRColor, getCEFRDetailedDescription } from '@/lib/vocabulary-levels'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useMobile } from '@/hooks/use-mobile'
import { Info } from 'lucide-react'

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
  const [showMobileSheet, setShowMobileSheet] = useState(false)
  const isMobile = useMobile()
  const description = getCEFRDescription(level)
  const detailedDescription = getCEFRDetailedDescription(level)
  const colorClasses = getCEFRColor(level)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const BadgeContent = () => (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium cursor-help transition-all hover:scale-105 active:scale-95
        ${colorClasses}
        ${sizeClasses[size]}
        ${className}
      `}
      onClick={isMobile ? (e) => {
        e.stopPropagation()
        setShowMobileSheet(true)
      } : undefined}
    >
      <span className="font-semibold">{level}</span>
      {showDescription && (
        <span className="hidden sm:inline">
          {description}
        </span>
      )}
      {isMobile && (
        <Info className="h-3 w-3 opacity-70" />
      )}
    </span>
  )

  // Desktop: Use Tooltip
  if (!isMobile) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <BadgeContent />
          </TooltipTrigger>
          <TooltipContent
            className="max-w-sm p-4 bg-popover border-2 shadow-lg"
            side="top"
            sideOffset={8}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colorClasses.split(' ')[0]}`} />
                <div className="font-bold text-base">CEFR Level {level}</div>
              </div>
              <div className="font-semibold text-sm">{description}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {detailedDescription}
              </div>
              <div className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-2">
                Common European Framework of Reference for Languages
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Mobile: Use Sheet (Bottom Drawer)
  return (
    <>
      <BadgeContent />
      <Sheet open={showMobileSheet} onOpenChange={setShowMobileSheet}>
        <SheetContent side="bottom" className="h-auto max-h-[50vh]">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold ${colorClasses}`}>
                {level}
              </span>
              <SheetTitle className="text-xl">CEFR Level {level}</SheetTitle>
            </div>
            <SheetDescription className="text-left space-y-3 pt-2">
              <div>
                <div className="font-semibold text-base text-foreground mb-1">
                  {description}
                </div>
                <div className="text-sm leading-relaxed">
                  {detailedDescription}
                </div>
              </div>
              <div className="text-xs italic border-t border-border pt-3 mt-3 opacity-70">
                Common European Framework of Reference for Languages
              </div>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  )
}
