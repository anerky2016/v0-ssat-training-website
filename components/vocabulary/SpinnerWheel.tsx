"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion"

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
  itemHeight = 56,
  visibleItems = 5,
}: SpinnerWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = options.findIndex(opt => opt.value === value)
    return index >= 0 ? index : 0
  })

  const y = useMotionValue(currentIndex * itemHeight)
  const velocity = useVelocity(y)
  const springConfig = { damping: 40, stiffness: 400, mass: 0.8 }
  const springY = useSpring(y, springConfig)

  // Update current index when value prop changes externally
  useEffect(() => {
    const index = options.findIndex(opt => opt.value === value)
    if (index >= 0 && index !== currentIndex) {
      setCurrentIndex(index)
      y.set(index * itemHeight)
    }
  }, [value, options, currentIndex, y])

  // Snap to nearest option (no momentum - immediate snap)
  const snapToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1))
    setCurrentIndex(clampedIndex)
    y.set(clampedIndex * itemHeight)

    // Call onChange immediately to update the value
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

    // Snap to nearest option immediately (no momentum)
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

    // Snap to nearest option immediately (no momentum)
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
  const centerY = containerHeight / 2

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none rounded-2xl bg-muted/30"
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
      {/* iOS-style selection indicator with handles */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-20"
        style={{
          top: `calc(50% - ${halfItemHeight}px)`,
          height: itemHeight,
        }}
      >
        {/* Top border */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-border/50" />
        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-border/50" />
        {/* Selection highlight background */}
        <div className="absolute inset-0 bg-primary/5 rounded-lg" />
      </div>

      {/* Top gradient overlay - more pronounced for iOS look */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-30 rounded-t-2xl"
        style={{
          height: halfItemHeight * 2,
          background: "linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--background)) 60%, transparent 100%)",
        }}
      />

      {/* Bottom gradient overlay - more pronounced for iOS look */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-30 rounded-b-2xl"
        style={{
          height: halfItemHeight * 2,
          background: "linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background)) 60%, transparent 100%)",
        }}
      />

      {/* Options container with smooth scrolling */}
      <motion.div
        className="absolute left-0 right-0"
        style={{
          y: useTransform(springY, (val) => {
            return centerY - halfItemHeight - val
          }),
        }}
      >
        {options.map((option, index) => {
          // Calculate distance from current index for iOS-style effect
          const distance = Math.abs(index - currentIndex)
          
          // iOS-style opacity and scale based on distance
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : distance === 2 ? 0.3 : 0.1
          const scale = distance === 0 ? 1 : distance === 1 ? 0.92 : 0.8
          
          // Color intensity based on selection
          const isSelected = distance < 0.5
          const textColor = isSelected 
            ? (option.color || 'hsl(var(--foreground))')
            : 'hsl(var(--muted-foreground))'

          return (
            <motion.div
              key={option.value}
              className="flex items-center justify-center text-center font-semibold"
              style={{
                height: itemHeight,
                opacity,
                scale,
                color: textColor,
                fontSize: isSelected ? '18px' : '16px',
                fontWeight: isSelected ? 600 : 500,
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

