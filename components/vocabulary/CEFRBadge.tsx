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
    const allLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <BadgeContent />
          </TooltipTrigger>
          <TooltipContent
            className="max-w-md p-4 bg-popover border-2 shadow-lg"
            side="top"
            sideOffset={8}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className={`w-2 h-2 rounded-full ${colorClasses.split(' ')[0]}`} />
                <div className="font-bold text-base">This word is CEFR Level {level} - {description}</div>
              </div>

              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                All CEFR Levels:
              </div>

              <div className="space-y-2">
                {allLevels.map((lvl) => {
                  const lvlDescription = getCEFRDescription(lvl)
                  const lvlColor = getCEFRColor(lvl)
                  const isCurrentLevel = lvl === level

                  return (
                    <div
                      key={lvl}
                      className={`flex items-start gap-2 p-2 rounded-md transition-colors ${
                        isCurrentLevel ? 'bg-muted/50 ring-1 ring-border' : ''
                      }`}
                    >
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-xs flex-shrink-0 ${lvlColor}`}>
                        {lvl}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-semibold ${isCurrentLevel ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {lvlDescription}
                        </div>
                        {isCurrentLevel && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            ← This word's level
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
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
  const allLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

  return (
    <>
      <BadgeContent />
      <Sheet open={showMobileSheet} onOpenChange={setShowMobileSheet}>
        <SheetContent side="bottom" className="h-auto max-h-[70vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold ${colorClasses}`}>
                {level}
              </span>
              <SheetTitle className="text-lg">This word is CEFR Level {level}</SheetTitle>
            </div>
            <SheetDescription className="text-left space-y-4 pt-3">
              <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                All CEFR Levels:
              </div>

              <div className="space-y-3">
                {allLevels.map((lvl) => {
                  const lvlDescription = getCEFRDescription(lvl)
                  const lvlDetailedDescription = getCEFRDetailedDescription(lvl)
                  const lvlColor = getCEFRColor(lvl)
                  const isCurrentLevel = lvl === level

                  return (
                    <div
                      key={lvl}
                      className={`p-3 rounded-lg border transition-colors ${
                        isCurrentLevel ? 'bg-muted/50 border-border' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-xs ${lvlColor}`}>
                          {lvl}
                        </span>
                        <div className={`font-semibold text-sm ${isCurrentLevel ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {lvlDescription}
                        </div>
                        {isCurrentLevel && (
                          <span className="ml-auto text-xs bg-chart-5 text-white px-2 py-0.5 rounded-full">
                            This word
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {lvlDetailedDescription}
                      </div>
                    </div>
                  )
                })}
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
