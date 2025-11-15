"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

// Wrapper for Tooltip that supports both hover and click on mobile
const Tooltip = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) => {
  const [open, setOpen] = React.useState(false)

  // Close tooltip when clicking/tapping outside
  React.useEffect(() => {
    if (!open) return

    const handleOutsideInteraction = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement
      // Check if click/tap is outside tooltip content
      if (!target.closest('[data-radix-tooltip-content]') && !target.closest('[data-radix-tooltip-trigger]')) {
        setOpen(false)
      }
    }

    // Add listeners for both mouse and touch events (for Android & iOS)
    document.addEventListener('mousedown', handleOutsideInteraction)
    document.addEventListener('touchstart', handleOutsideInteraction)

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction)
      document.removeEventListener('touchstart', handleOutsideInteraction)
    }
  }, [open])

  return (
    <TooltipPrimitive.Root open={open} onOpenChange={setOpen} {...props}>
      {children}
    </TooltipPrimitive.Root>
  )
}

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>((props, ref) => (
  <TooltipPrimitive.Trigger
    ref={ref}
    onClick={(e) => {
      // Toggle tooltip on click/tap for mobile devices (iOS & Android)
      e.preventDefault()
      e.stopPropagation()
      props.onClick?.(e)
    }}
    onTouchEnd={(e) => {
      // Explicit touch handling for Android and other touch devices
      e.preventDefault()
      e.stopPropagation()
      props.onTouchEnd?.(e)
    }}
    {...props}
  />
))
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      // Better mobile support with touch-action and pointer-events
      "touch-action-none pointer-events-auto",
      className
    )}
    // Prevent tooltip from being cut off on mobile
    collisionPadding={10}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
