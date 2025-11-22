"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityCalendarProps {
  dailyCounts: Record<string, number>
  onDateSelect?: (date: Date | null) => void
  selectedDate?: Date | null
  title?: string
}

export function ActivityCalendar({
  dailyCounts,
  onDateSelect,
  selectedDate,
  title = "Activity Calendar"
}: ActivityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false
    return formatDateKey(date1) === formatDateKey(date2)
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateKey = formatDateKey(date)

    // Only allow selection of dates with activity
    if (dailyCounts[dateKey]) {
      if (onDateSelect) {
        // Toggle selection
        if (isSameDay(selectedDate, date)) {
          onDateSelect(null)
        } else {
          onDateSelect(date)
        }
      }
    }
  }

  const getCountForDay = (day: number): number => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateKey = formatDateKey(date)
    return dailyCounts[dateKey] || 0
  }

  const getIntensityColor = (count: number): string => {
    if (count === 0) return ""
    if (count <= 2) return "bg-teal-100 dark:bg-teal-900/30 text-teal-900 dark:text-teal-100"
    if (count <= 5) return "bg-teal-300 dark:bg-teal-700/50 text-teal-950 dark:text-teal-50"
    if (count <= 10) return "bg-teal-500 dark:bg-teal-600 text-white"
    return "bg-teal-700 dark:bg-teal-500 text-white font-bold"
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-medium">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const count = getCountForDay(day)
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            const isSelected = isSameDay(selectedDate, date)
            const hasActivity = count > 0

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={!hasActivity}
                className={cn(
                  "aspect-square rounded-md relative transition-all",
                  "flex flex-col items-center justify-center",
                  "text-sm",
                  hasActivity ? "cursor-pointer hover:ring-2 hover:ring-teal-400" : "cursor-default text-muted-foreground/50",
                  getIntensityColor(count),
                  isSelected && "ring-2 ring-offset-2 ring-teal-600 dark:ring-teal-400",
                  !hasActivity && "bg-muted/20"
                )}
              >
                <span className="text-xs">{day}</span>
                {count > 0 && (
                  <span className="text-[10px] font-semibold leading-none mt-0.5">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-muted/20 border" title="0" />
              <div className="w-4 h-4 rounded bg-teal-100 dark:bg-teal-900/30" title="1-2" />
              <div className="w-4 h-4 rounded bg-teal-300 dark:bg-teal-700/50" title="3-5" />
              <div className="w-4 h-4 rounded bg-teal-500 dark:bg-teal-600" title="6-10" />
              <div className="w-4 h-4 rounded bg-teal-700 dark:bg-teal-500" title="10+" />
            </div>
            <span>More</span>
          </div>
          {selectedDate && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Selected: </span>
              <span className="text-muted-foreground">
                {selectedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateSelect?.(null)}
                className="ml-2 h-6 text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
