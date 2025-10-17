'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Eraser, Undo, Trash2, Download, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface ScreenshotAnnotatorProps {
  screenshot: string
  onSave: (annotatedImage: string) => void
  className?: string
}

type Tool = 'pen' | 'eraser'

export function ScreenshotAnnotator({ screenshot, onSave, className }: ScreenshotAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mainContainerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>('pen')
  const [penColor, setPenColor] = useState('#FF0000')
  const [penSize, setPenSize] = useState(3)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [zoom, setZoom] = useState(100)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      setCanvasSize({ width: img.width, height: img.height })
      ctx.drawImage(img, 0, 0)
      saveToHistory()

      // Focus the canvas after image loads
      setTimeout(() => {
        canvas.focus()
      }, 100)
    }
    img.src = screenshot
  }, [screenshot])

  useEffect(() => {
    if (wrapperRef.current && canvasSize.width && canvasSize.height) {
      const scaledWidth = canvasSize.width * (zoom / 100)
      const scaledHeight = canvasSize.height * (zoom / 100)
      wrapperRef.current.style.width = `${scaledWidth}px`
      wrapperRef.current.style.height = `${scaledHeight}px`
    }
  }, [zoom, canvasSize])

  // Handle ESC key to prompt save and close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [hasUnsavedChanges])

  // Focus the annotator immediately and prevent interaction with page content
  useEffect(() => {
    // Blur any currently focused element (like inputs from the lesson page)
    if (document.activeElement && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur()
    }

    // Focus our canvas with multiple retries to ensure it gets focus
    const focusCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.focus()
      }
    }

    // Try immediately
    focusCanvas()

    // Retry after short delays to ensure focus is captured
    const timeout1 = setTimeout(focusCanvas, 50)
    const timeout2 = setTimeout(focusCanvas, 150)
    const timeout3 = setTimeout(focusCanvas, 300)

    // Disable selection on the entire document
    const originalUserSelect = document.body.style.userSelect
    const originalWebkitUserSelect = document.body.style.webkitUserSelect

    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'

    // Prevent mousedown on document
    const preventMouseDown = (e: MouseEvent) => {
      // Only prevent if the target is not within our annotator
      if (e.target && !(e.target as HTMLElement).closest('[data-annotator]')) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    // Prevent focus events on document except within annotator
    const preventFocus = (e: FocusEvent) => {
      if (e.target && !(e.target as HTMLElement).closest('[data-annotator]')) {
        e.preventDefault()
        e.stopPropagation()
        // Refocus canvas
        if (canvasRef.current) {
          canvasRef.current.focus()
        }
      }
    }

    document.addEventListener('mousedown', preventMouseDown, true)
    document.addEventListener('focus', preventFocus, true)

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearTimeout(timeout3)
      document.body.style.userSelect = originalUserSelect
      document.body.style.webkitUserSelect = originalWebkitUserSelect
      document.removeEventListener('mousedown', preventMouseDown, true)
      document.removeEventListener('focus', preventFocus, true)
    }
  }, [])

  const saveToHistory = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    setIsDrawing(true)
    const { x, y } = getCoordinates(e)

    ctx.beginPath()
    ctx.moveTo(x, y)

    if (tool === 'pen') {
      ctx.strokeStyle = penColor
      ctx.lineWidth = penSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    } else {
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = penSize * 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveToHistory()
      setHasUnsavedChanges(true)
    }
  }

  const handleUndo = () => {
    if (historyIndex <= 0) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    ctx.putImageData(history[newIndex], 0, 0)
    setHasUnsavedChanges(true)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      saveToHistory()
      setHasUnsavedChanges(true)
    }
    img.src = screenshot
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const annotatedImage = canvas.toDataURL('image/png')
    setHasUnsavedChanges(false)
    onSave(annotatedImage)
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true)
    } else {
      // No changes, just save current state
      handleSave()
    }
  }

  const handleConfirmSave = () => {
    setShowConfirmDialog(false)
    handleSave()
  }

  const handleCancelClose = () => {
    setShowConfirmDialog(false)
    // Stay in annotation mode
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const handleZoomReset = () => {
    setZoom(100)
  }

  return (
    <div
      ref={mainContainerRef}
      data-annotator
      tabIndex={-1}
      className={cn('fixed inset-0 z-[60] flex items-center justify-center bg-black/50 select-none focus:outline-none', className)}
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onMouseUp={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onMouseMove={(e) => {
        e.stopPropagation()
      }}
      onTouchStart={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onTouchMove={(e) => {
        e.stopPropagation()
      }}
      onTouchEnd={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <div className="w-[80vw] h-[80vh] bg-background rounded-lg shadow-2xl border flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted rounded-t-lg border-b flex-shrink-0 relative">
        {/* Close button - positioned outside the flex layout */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-3 -right-3 rounded-full shadow-lg z-10 h-8 w-8"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleClose()
          }}
          title="Close (ESC)"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex gap-1">
          <Button
            variant={tool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('pen')}
            title="Pen Tool"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('eraser')}
            title="Eraser Tool"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {tool === 'pen' && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm">Color:</label>
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Size:</label>
              <input
                type="range"
                min="1"
                max="10"
                value={penSize}
                onChange={(e) => setPenSize(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm w-6">{penSize}</span>
            </div>
          </>
        )}

        <div className="w-px h-6 bg-border" />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomReset}
            title="Reset Zoom"
            className="min-w-[60px]"
          >
            {zoom}%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 300}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            title="Clear All Annotations"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto">
          <Button
            onClick={handleSave}
            size="sm"
            title="Save Annotated Screenshot"
          >
            <Download className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/30 p-4 rounded-b-lg"
      >
        <div
          ref={wrapperRef}
          className="relative mx-auto"
          style={{
            minWidth: 'fit-content',
            minHeight: 'fit-content',
          }}
        >
          <canvas
            ref={canvasRef}
            tabIndex={0}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="cursor-crosshair touch-none block origin-top-left focus:outline-none focus:ring-2 focus:ring-primary"
            style={{
              transform: `scale(${zoom / 100})`,
            }}
          />
        </div>
      </div>

      <div className="p-3 border-t bg-muted/50 text-center flex-shrink-0">
        <p className="text-sm text-muted-foreground">
          Use zoom controls to magnify the image, then draw with your mouse, touch pen, or finger. Click "Save" when done.
        </p>
      </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelClose}
        title="Unsaved Changes"
        description="You have unsaved changes. Do you want to save your annotations before closing?"
      />
    </div>
  )
}
