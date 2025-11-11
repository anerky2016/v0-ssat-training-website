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
  const [lastTouchY, setLastTouchY] = useState(0) // Track last touch position
  const [dragStartIndex, setDragStartIndex] = useState(0) // Track index when drag started
  const isDraggingRef = useRef(false) // Ref to track dragging state to prevent useEffect interference
  const pendingValueRef = useRef<number | null>(null) // Track value we're about to set to prevent useEffect from resetting
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = options.findIndex(opt => opt.value === value)
    return index >= 0 ? index : 0
  })

  const y = useMotionValue(currentIndex * itemHeight)
  const velocity = useVelocity(y)
  const springConfig = { damping: 40, stiffness: 400, mass: 0.8 }
  const springY = useSpring(y, springConfig)

  // Update current index when value prop changes externally
  // But don't interfere if we're currently dragging or just finished dragging
  useEffect(() => {
    // Skip if we're dragging
    if (isDraggingRef.current) return
    
    // Skip if this is the value we just set (prevent race condition)
    // This prevents the useEffect from resetting the position when onChange updates the parent
    if (pendingValueRef.current !== null && pendingValueRef.current === value) {
      // Don't clear pendingValueRef here - let it be cleared after a delay
      // This ensures we ignore this value change completely
      return
    }
    
    const index = options.findIndex(opt => opt.value === value)
    // Only update if the index actually changed AND it's different from current
    if (index >= 0 && index !== currentIndex) {
      setCurrentIndex(index)
      y.set(index * itemHeight)
      springY.set(index * itemHeight)
    }
  }, [value, options, currentIndex, y, springY])

  // Snap to nearest option (no momentum - immediate snap)
  const snapToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1))
    setCurrentIndex(clampedIndex)

    const targetY = clampedIndex * itemHeight

    // Stop spring animation completely
    springY.stop()

    // Use jump() to position immediately without animation
    y.jump(targetY)
    springY.jump(targetY)

    // Call onChange immediately to update the value
    onChange(options[clampedIndex].value)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    setIsDragging(true)
    isDraggingRef.current = true
    setStartY(e.touches[0].clientY)
    setLastTouchY(e.touches[0].clientY)
    setDragStartIndex(currentIndex) // Remember the index when drag started
    springY.stop() // Stop spring animation so we can control position directly
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isDragging) return
    
    const currentY = e.touches[0].clientY
    setLastTouchY(currentY) // Track the last touch position
    const deltaY = currentY - startY
    // Use dragStartIndex to ensure we calculate from the correct starting position
    const newY = dragStartIndex * itemHeight + deltaY
    
    // Apply resistance at boundaries
    const minY = 0
    const maxY = (options.length - 1) * itemHeight
    let constrainedY = newY
    
    if (newY < minY) {
      constrainedY = minY + (newY - minY) * 0.3 // Resistance
    } else if (newY > maxY) {
      constrainedY = maxY + (newY - maxY) * 0.3 // Resistance
    }
    
    // Directly set the motion value (bypass spring during drag)
    y.set(constrainedY)
  }

  const handleTouchEnd = () => {
    if (disabled || !isDragging) return
    
    // Stop any ongoing spring animation immediately
    springY.stop()

    // Get the current visual Y position directly from the motion value
    // This is the position that was set during touchMove, so it reflects where the user's finger was
    const currentY = y.get()
    
    // Snap to nearest option immediately (no momentum, no bounce)
    const nearestIndex = Math.round(currentY / itemHeight)
    const clampedIndex = Math.max(0, Math.min(nearestIndex, options.length - 1))
    const newValue = options[clampedIndex].value

    // Immediately snap without animation using jump() to avoid any spring animation
    const targetY = clampedIndex * itemHeight
    y.jump(targetY)
    springY.jump(targetY)
    setCurrentIndex(clampedIndex)
    
    // Track the value we're about to set to prevent useEffect from resetting it
    pendingValueRef.current = newValue
    
    // Call onChange to update parent state (this will trigger value prop change)
    onChange(newValue)
    
    // Keep dragging ref true briefly to prevent useEffect interference
    // Then clear it after a small delay to allow normal syncing
    setTimeout(() => {
      isDraggingRef.current = false
      setIsDragging(false)
      // Clear pending value after useEffect has had a chance to see it
      setTimeout(() => {
        pendingValueRef.current = null
      }, 50)
    }, 100)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    setIsDragging(true)
    isDraggingRef.current = true
    setStartY(e.clientY)
    setLastTouchY(e.clientY)
    setDragStartIndex(currentIndex) // Remember the index when drag started
    springY.stop() // Stop spring animation so we can control position directly
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !isDragging) return
    
    const currentY = e.clientY
    setLastTouchY(currentY) // Track for consistency
    const deltaY = currentY - startY
    // Use dragStartIndex to ensure we calculate from the correct starting position
    const newY = dragStartIndex * itemHeight + deltaY
    
    // Apply resistance at boundaries
    const minY = 0
    const maxY = (options.length - 1) * itemHeight
    let constrainedY = newY
    
    if (newY < minY) {
      constrainedY = minY + (newY - minY) * 0.3
    } else if (newY > maxY) {
      constrainedY = maxY + (newY - maxY) * 0.3
    }
    
    // Directly set the motion value (bypass spring during drag)
    y.set(constrainedY)
  }

  const handleMouseUp = () => {
    if (disabled || !isDragging) return

    // Stop any ongoing spring animation immediately
    springY.stop()

    // Get the current visual Y position directly from the motion value
    // This is the position that was set during mouseMove, so it reflects where the cursor was
    const currentY = y.get()
    
    // Snap to nearest option immediately (no momentum, no bounce)
    const nearestIndex = Math.round(currentY / itemHeight)
    const clampedIndex = Math.max(0, Math.min(nearestIndex, options.length - 1))
    const newValue = options[clampedIndex].value

    // Immediately snap without animation using jump() to avoid any spring animation
    const targetY = clampedIndex * itemHeight
    y.jump(targetY)
    springY.jump(targetY)
    setCurrentIndex(clampedIndex)
    
    // Track the value we're about to set to prevent useEffect from resetting it
    pendingValueRef.current = newValue
    
    // Call onChange to update parent state (this will trigger value prop change)
    onChange(newValue)
    
    // Keep dragging ref true briefly to prevent useEffect interference
    // Then clear it after a small delay to allow normal syncing
    setTimeout(() => {
      isDraggingRef.current = false
      setIsDragging(false)
      // Clear pending value after useEffect has had a chance to see it
      setTimeout(() => {
        pendingValueRef.current = null
      }, 50)
    }, 100)
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
          // Always use raw y value directly - we control it manually during drag
          // and jump it immediately on touch end to avoid any spring bounce-back
          y: useTransform(y, (val) => {
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

