'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react'

interface ScreenshotZoomProps {
  src: string
  alt: string
  className?: string
}

export function ScreenshotZoom({ src, alt, className }: ScreenshotZoomProps) {
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const handleReset = () => {
    setZoom(100)
  }

  const handleClose = () => {
    setOpen(false)
    setZoom(100)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Image clicked, opening zoom modal')
    setOpen(true)
  }

  return (
    <>
      <div className="relative group">
        <img
          src={src}
          alt={alt}
          className={`cursor-pointer transition-opacity hover:opacity-80 ${className}`}
          onClick={handleImageClick}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-md pointer-events-none">
          <Maximize2 className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>
          <div className="relative w-full h-full">
            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                title="Reset Zoom"
                className="min-w-[60px]"
              >
                {zoom}%
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 300}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="w-px bg-border" />
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  title="Close"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>

            {/* Image Container */}
            <div className="w-full h-[95vh] overflow-auto bg-muted/50 p-8">
              <div className="flex items-center justify-center min-h-full">
                <img
                  src={src}
                  alt={alt}
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transition: 'transform 0.2s ease-in-out',
                  }}
                  className="max-w-none"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
