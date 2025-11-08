"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Layers, Check } from "lucide-react"
import { VocabularyLevel, getLevelInfo, getAvailableLevels } from "@/lib/vocabulary-levels"
import { cn } from "@/lib/utils"

interface LevelSelectorProps {
  selectedLevels: VocabularyLevel[]
  onLevelsChange: (levels: VocabularyLevel[]) => void
  className?: string
}

export function LevelSelector({ selectedLevels, onLevelsChange, className }: LevelSelectorProps) {
  const availableLevels = getAvailableLevels()
  
  const toggleLevel = (level: VocabularyLevel) => {
    if (selectedLevels.includes(level)) {
      // Remove level if already selected
      onLevelsChange(selectedLevels.filter(l => l !== level))
    } else {
      // Add level
      onLevelsChange([...selectedLevels, level])
    }
  }
  
  const selectAll = () => {
    onLevelsChange(availableLevels)
  }
  
  const deselectAll = () => {
    onLevelsChange([])
  }
  
  const allSelected = selectedLevels.length === availableLevels.length
  const noneSelected = selectedLevels.length === 0
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Vocabulary Levels:</span>
        {selectedLevels.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {selectedLevels.length} selected
          </Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableLevels.map(level => {
          const levelInfo = getLevelInfo(level)
          const isSelected = selectedLevels.includes(level)
          
          return (
            <Button
              key={level}
              onClick={() => toggleLevel(level)}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "relative",
                isSelected && "bg-chart-5 hover:bg-chart-5/90 text-white",
                level === "SSAT" && "font-semibold" // Make SSAT stand out
              )}
            >
              {isSelected && (
                <Check className="h-3 w-3 mr-1.5" />
              )}
              {levelInfo.name}
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2 text-xs",
                  isSelected ? "bg-white/20 text-white" : ""
                )}
              >
                {levelInfo.wordCount}
              </Badge>
            </Button>
          )
        })}
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={allSelected ? deselectAll : selectAll}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>
    </div>
  )
}

