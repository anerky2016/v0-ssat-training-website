"use client"

import { useState } from 'react'
import { CEFRLevel, getAllCEFRLevels, getCEFRDescription, getCEFRColor } from '@/lib/vocabulary-levels'

interface CEFRFilterProps {
  selectedLevels: CEFRLevel[]
  onLevelsChange: (levels: CEFRLevel[]) => void
  showCounts?: boolean
  levelCounts?: Record<CEFRLevel, number>
}

export default function CEFRFilter({
  selectedLevels,
  onLevelsChange,
  showCounts = false,
  levelCounts
}: CEFRFilterProps) {
  const allLevels = getAllCEFRLevels()

  const toggleLevel = (level: CEFRLevel) => {
    if (selectedLevels.includes(level)) {
      onLevelsChange(selectedLevels.filter(l => l !== level))
    } else {
      onLevelsChange([...selectedLevels, level])
    }
  }

  const selectAll = () => {
    onLevelsChange(allLevels)
  }

  const clearAll = () => {
    onLevelsChange([])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Filter by CEFR Level
        </h3>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allLevels.map(level => {
          const isSelected = selectedLevels.includes(level)
          const description = getCEFRDescription(level)
          const colorClasses = getCEFRColor(level)
          const count = levelCounts?.[level] ?? 0

          return (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              className={`
                relative px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isSelected
                  ? `${colorClasses} ring-2 ring-offset-2 ring-current`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-bold">{level}</span>
                <span className="text-xs opacity-90">{description}</span>
                {showCounts && levelCounts && (
                  <span className="text-xs font-semibold mt-0.5">
                    {count} {count === 1 ? 'word' : 'words'}
                  </span>
                )}
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedLevels.length > 0 && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {selectedLevels.length} {selectedLevels.length === 1 ? 'level' : 'levels'} selected
        </div>
      )}
    </div>
  )
}
