"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect if the current viewport is mobile-sized
 * Uses Tailwind's sm breakpoint (640px) as the threshold
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
    }

    // Check on mount
    checkMobile()

    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return isMobile
}

/**
 * Hook to detect if the device has touch capabilities
 */
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - some browsers have this
      navigator.msMaxTouchPoints > 0
    )
  }, [])

  return isTouchDevice
}

