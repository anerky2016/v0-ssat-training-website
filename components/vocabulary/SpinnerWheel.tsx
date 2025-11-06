"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

export interface SpinnerWheelOption {
  value: number
  label: string
  color: string
}

interface SpinnerWheelProps {
  options: SpinnerWheelOption[]
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  itemHeight?: number
  visibleItems?: number
}

export function SpinnerWheel({
  options,
  value,
  onChange,
  disabled = false,
  itemHeight = 48,
  visibleItems = 3,
}: SpinnerWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = options.findIndex(opt => opt.value === value)
    return index >= 0 ? index : 0
  })

  const y = useMotionValue(currentIndex * itemHeight)
  const springConfig = { damping: 30, stiffness: 300 }
  const springY = useSpring(y, springConfig)

  // Update current index when value prop changes externally
  useEffect(() => {
    const index = options.findIndex(opt => opt.value === value)
    if (index >= 0 && index !== currentIndex) {
      setCurrentIndex(index)
      y.set(index * itemHeight)
    }
  }, [value, options, currentIndex, y])

  // Snap to nearest option
  const snapToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1))
    setCurrentIndex(clampedIndex)
    y.set(clampedIndex * itemHeight)
    onChange(options[clampedIndex].value)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    springY.stop()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isDragging) return
    
    const currentY = e.touches[0].clientY
    const deltaY = currentY - startY
    const newY = currentIndex * itemHeight + deltaY
    
    // Apply resistance at boundaries
    const minY = 0
    const maxY = (options.length - 1) * itemHeight
    let constrainedY = newY
    
    if (newY < minY) {
      constrainedY = minY + (newY - minY) * 0.3 // Resistance
    } else if (newY > maxY) {
      constrainedY = maxY + (newY - maxY) * 0.3 // Resistance
    }
    
    y.set(constrainedY)
  }

  const handleTouchEnd = () => {
    if (disabled || !isDragging) return
    setIsDragging(false)
    
    // Calculate which index we're closest to
    const currentY = y.get()
    const nearestIndex = Math.round(currentY / itemHeight)
    snapToIndex(nearestIndex)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    setIsDragging(true)
    setStartY(e.clientY)
    springY.stop()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !isDragging) return
    
    const currentY = e.clientY
    const deltaY = currentY - startY
    const newY = currentIndex * itemHeight + deltaY
    
    // Apply resistance at boundaries
    const minY = 0
    const maxY = (options.length - 1) * itemHeight
    let constrainedY = newY
    
    if (newY < minY) {
      constrainedY = minY + (newY - minY) * 0.3
    } else if (newY > maxY) {
      constrainedY = maxY + (newY - maxY) * 0.3
    }
    
    y.set(constrainedY)
  }

  const handleMouseUp = () => {
    if (disabled || !isDragging) return
    setIsDragging(false)
    
    const currentY = y.get()
    const nearestIndex = Math.round(currentY / itemHeight)
    snapToIndex(nearestIndex)
  }

  // Handle wheel events for desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (disabled) return
    
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1 : -1
    const newIndex = Math.max(0, Math.min(currentIndex + delta, options.length - 1))
    snapToIndex(newIndex)
  }

  const containerHeight = itemHeight * visibleItems
  const halfItemHeight = itemHeight / 2

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{ height: containerHeight }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Selection highlight */}
      <div
        className="absolute left-0 right-0 border-y-2 border-primary/40 bg-primary/10 pointer-events-none z-10 rounded-lg"
        style={{
          top: `calc(50% - ${halfItemHeight}px)`,
          height: itemHeight,
        }}
      />

      {/* Top gradient overlay */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-20"
        style={{
          height: halfItemHeight,
          background: "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)",
        }}
      />

      {/* Bottom gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-20"
        style={{
          height: halfItemHeight,
          background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)",
        }}
      />

      {/* Options container */}
      <motion.div
        className="absolute left-0 right-0"
        style={{
          y: useTransform(springY, (val) => {
            const offset = containerHeight / 2 - halfItemHeight
            return -val + offset
          }),
        }}
      >
        {options.map((option, index) => {
          const distance = Math.abs(index - currentIndex)
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.5 : distance === 2 ? 0.2 : 0.1
          const scale = distance === 0 ? 1.1 : distance === 1 ? 0.95 : 0.85

          return (
            <motion.div
              key={option.value}
              className="flex items-center justify-center text-center font-medium transition-colors"
              style={{
                height: itemHeight,
                opacity,
                scale,
                color: option.color || 'hsl(var(--foreground))',
              }}
            >
              {option.label}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

