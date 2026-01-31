"use client"

import { useState, useEffect } from "react"
import { ReactReader } from "react-reader"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Type, Maximize } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EPUBViewerProps {
  fileUrl: string
  fileName: string
}

export function EPUBViewer({ fileUrl, fileName }: EPUBViewerProps) {
  const [location, setLocation] = useState<string | number>(0)
  const [fontSize, setFontSize] = useState<number>(100)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [rendition, setRendition] = useState<any>(null)

  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}%`)
    }
  }, [fontSize, rendition])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Controls */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <Select
              value={fontSize.toString()}
              onValueChange={(value) => setFontSize(parseInt(value))}
            >
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80">Small</SelectItem>
                <SelectItem value="100">Medium</SelectItem>
                <SelectItem value="120">Large</SelectItem>
                <SelectItem value="140">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={toggleFullscreen} variant="outline" size="sm">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* EPUB Display */}
      <div className="flex-1 relative">
        <ReactReader
          url={fileUrl}
          location={location}
          locationChanged={(epubcfi: string) => setLocation(epubcfi)}
          getRendition={(rendition: any) => {
            setRendition(rendition)
            rendition.themes.fontSize(`${fontSize}%`)
          }}
          epubOptions={{
            flow: "paginated",
            manager: "default",
          }}
        />
      </div>
    </div>
  )
}
