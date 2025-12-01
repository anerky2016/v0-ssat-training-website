"use client"

import { BookOpen } from "lucide-react"
import { type VocabularyLevel, getWordlyWiseLevelName, getWordlyWiseLevelColor } from "@/lib/vocabulary-levels"
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
  SheetTrigger,
} from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"

interface WordlyWiseBadgeProps {
  level: VocabularyLevel
  size?: "sm" | "md" | "lg"
}

export default function WordlyWiseBadge({ level, size = "md" }: WordlyWiseBadgeProps) {
  const isMobile = useMobile()
  const displayName = getWordlyWiseLevelName(level)
  const colorClass = getWordlyWiseLevelColor(level)

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4"
  }

  const getDescription = () => {
    if (level === "SSAT") {
      return "SSAT Vocabulary - Secondary School Admission Test words for middle and upper level students"
    }
    return `Wordly Wise 3000 Level ${level} - Vocabulary building program for systematic word learning`
  }

  const badge = (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${colorClass}`}>
      <BookOpen className={iconSizes[size]} />
      {displayName}
    </span>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <button className="inline-block">
            {badge}
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>{displayName}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {getDescription()}
            </p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-block">
            {badge}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs">
            {getDescription()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
