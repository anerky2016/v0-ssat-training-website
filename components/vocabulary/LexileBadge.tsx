"use client"

import { useState } from 'react'
import { LexileLevel, getLexileDescription, getLexileColor, getLexileDetailedDescription } from '@/lib/vocabulary-levels'
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
} from "@/components/ui/sheet"
import { useMobile } from '@/hooks/use-mobile'
import { Info } from 'lucide-react'

interface LexileBadgeProps {
  level: LexileLevel
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LexileBadge({
  level,
  showDescription = true,
  size = 'md',
  className = ''
}: LexileBadgeProps) {
  const [showMobileSheet, setShowMobileSheet] = useState(false)
  const isMobile = useMobile()
  const description = getLexileDescription(level)
  const detailedDescription = getLexileDetailedDescription(level)
  const colorClasses = getLexileColor(level)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const handleMobileClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMobileSheet(true)
  }

  // Mobile: Use button element for better iOS support
  if (isMobile) {
    return (
      <>
        <button
          type="button"
          className={`
            inline-flex items-center gap-1.5 rounded-full font-medium cursor-pointer transition-all active:scale-95
            border-0 outline-none
            ${colorClasses}
            ${sizeClasses[size]}
            ${className}
          `}
          onClick={handleMobileClick}
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          <span className="font-semibold">{level}</span>
          {showDescription && (
            <span className="hidden sm:inline">
              {description}
            </span>
          )}
          <Info className="h-3 w-3 opacity-70" />
        </button>
        <Sheet open={showMobileSheet} onOpenChange={setShowMobileSheet}>
          <SheetContent
            side="bottom"
            className="h-auto max-h-[85vh] pb-8"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            <SheetHeader className="text-left pb-4 border-b border-border sticky top-0 bg-background z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm ${colorClasses}`}>
                  {level}
                </span>
                <div>
                  <SheetTitle className="text-base font-bold">Lexile Level {level}</SheetTitle>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
              </div>
            </SheetHeader>

            <div
              className="overflow-y-auto max-h-[calc(85vh-120px)] pt-4 pb-4"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
              <div className="space-y-4">
                {/* Current word's explanation */}
                <div className="bg-chart-5/10 border-2 border-chart-5 rounded-lg p-4">
                  <div className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-chart-5">●</span>
                    This Word's Level
                  </div>
                  <div className="text-sm leading-relaxed text-foreground">
                    {detailedDescription}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 py-2">
                  <div className="h-px bg-border flex-1" />
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    All Lexile Levels
                  </div>
                  <div className="h-px bg-border flex-1" />
                </div>

                {/* All levels in compact format */}
                <div className="space-y-2">
                  {(['500L-700L', '700L-900L', '800L-1000L', '900L-1100L', '1000L-1200L', '1100L-1300L'] as LexileLevel[]).map((lvl) => {
                    const lvlDescription = getLexileDescription(lvl)
                    const lvlColor = getLexileColor(lvl)
                    const isCurrentLevel = lvl === level

                    return (
                      <div
                        key={lvl}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          isCurrentLevel
                            ? 'bg-chart-5/5 border-2 border-chart-5/30'
                            : 'bg-muted/30 border border-transparent'
                        }`}
                      >
                        <span className={`inline-flex items-center justify-center min-w-[80px] px-2 py-1.5 rounded-full font-bold text-xs flex-shrink-0 ${lvlColor}`}>
                          {lvl}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm leading-tight ${
                            isCurrentLevel ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {lvlDescription}
                          </div>
                        </div>
                        {isCurrentLevel && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-chart-5">
                              <span className="w-2 h-2 rounded-full bg-chart-5 animate-pulse" />
                              This word
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Footer note */}
                <div className="text-center pt-4 pb-2">
                  <div className="text-xs text-muted-foreground italic">
                    Lexile Framework for Reading
                  </div>
                  <div className="text-xs text-muted-foreground italic">
                    Based on word frequency analysis
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  const BadgeContent = () => (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium cursor-help transition-all hover:scale-105
        ${colorClasses}
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      <span className="font-semibold">{level}</span>
      {showDescription && (
        <span className="hidden sm:inline">
          {description}
        </span>
      )}
    </span>
  )

  // Desktop: Use Tooltip
  if (!isMobile) {
    const allLevels: LexileLevel[] = ['500L-700L', '700L-900L', '800L-1000L', '900L-1100L', '1000L-1200L', '1100L-1300L']

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
                <div className="font-bold text-base">This word is Lexile {level} - {description}</div>
              </div>

              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                All Lexile Levels:
              </div>

              <div className="space-y-2">
                {allLevels.map((lvl) => {
                  const lvlDescription = getLexileDescription(lvl)
                  const lvlDetailedDescription = getLexileDetailedDescription(lvl)
                  const lvlColor = getLexileColor(lvl)
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
                Lexile Framework - Based on word frequency
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // This should never be reached since we return early for both mobile and desktop
  return null
}
