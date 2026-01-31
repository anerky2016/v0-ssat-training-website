"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, BookOpen, FileText } from "lucide-react"
import { PDFViewer } from "@/components/pdf-viewer"
import { EPUBViewer } from "@/components/epub-viewer"

type FileType = "pdf" | "epub" | null

export function EReaderClient() {
  const [fileType, setFileType] = useState<FileType>(null)
  const [fileUrl, setFileUrl] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (fileExtension === "pdf") {
      setFileType("pdf")
    } else if (fileExtension === "epub") {
      setFileType("epub")
    } else {
      alert("Please upload a PDF or EPUB file")
      return
    }

    const url = URL.createObjectURL(file)
    setFileUrl(url)
    setFileName(file.name)
  }

  const handleReset = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl)
    }
    setFileType(null)
    setFileUrl("")
    setFileName("")
  }

  if (fileType && fileUrl) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">{fileName}</span>
            </div>
            <Button onClick={handleReset} variant="outline" size="sm">
              Close Book
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {fileType === "pdf" && <PDFViewer fileUrl={fileUrl} fileName={fileName} />}
          {fileType === "epub" && <EPUBViewer fileUrl={fileUrl} fileName={fileName} />}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            E-Reader
          </CardTitle>
          <CardDescription>
            Upload and read PDF or EPUB files. Your reading progress will be saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.epub"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Choose a file to upload</p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports PDF and EPUB formats
              </p>
              <Button type="button" onClick={() => document.getElementById("file-upload")?.click()}>
                Select File
              </Button>
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Supported Formats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">PDF</p>
                  <p className="text-sm text-muted-foreground">
                    Portable Document Format
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">EPUB</p>
                  <p className="text-sm text-muted-foreground">
                    Electronic Publication
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Automatic reading progress tracking</li>
              <li>• Adjustable text size and display options</li>
              <li>• Navigation controls</li>
              <li>• Full-screen reading mode</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
