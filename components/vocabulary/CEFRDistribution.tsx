"use client"

import { CEFRLevel, getCEFRDescription, getCEFRColor } from '@/lib/vocabulary-levels'

interface CEFRDistributionProps {
  distribution: Record<CEFRLevel, number>
  title?: string
  showPercentages?: boolean
}

export default function CEFRDistribution({
  distribution,
  title = "CEFR Level Distribution",
  showPercentages = true
}: CEFRDistributionProps) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0)
  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Total: {total} {total === 1 ? 'word' : 'words'}
        </span>
      </div>

      <div className="space-y-3">
        {levels.map(level => {
          const count = distribution[level] || 0
          const percentage = total > 0 ? (count / total) * 100 : 0
          const description = getCEFRDescription(level)
          const colorClasses = getCEFRColor(level)

          return (
            <div key={level} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-semibold ${colorClasses}`}>
                    {level}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {description}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {count}
                  </span>
                  {showPercentages && (
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      ({percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${colorClasses.split(' ')[0]} bg-current opacity-60`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary statistics */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Beginner</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {distribution.A1 + distribution.A2}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Intermediate</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {distribution.B1 + distribution.B2}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Advanced</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {distribution.C1 + distribution.C2}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
