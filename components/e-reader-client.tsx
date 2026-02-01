"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, BookOpen, FileText, Trash2, Loader2, Library } from "lucide-react"
import { useAuth } from "@/contexts/firebase-auth-context"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Lazy load PDF and EPUB viewers to avoid SSR issues with DOMMatrix
const PDFViewer = dynamic(
  () => import("@/components/pdf-viewer").then((mod) => ({ default: mod.PDFViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
)

const EPUBViewer = dynamic(
  () => import("@/components/epub-viewer").then((mod) => ({ default: mod.EPUBViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
)

type FileType = "pdf" | "epub" | null

interface Book {
  id: string
  title: string
  file_name: string
  file_type: string
  file_size: number
  file_path: string
  uploaded_at: string
  last_read_at?: string
}

export function EReaderClient() {
  const { user } = useAuth()
  const [fileType, setFileType] = useState<FileType>(null)
  const [fileUrl, setFileUrl] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showLibrary, setShowLibrary] = useState(true)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)

  // Load book library
  useEffect(() => {
    if (user) {
      loadBooks()
    }
  }, [user])

  const loadBooks = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/books/list?userId=${user.uid}`)
      const data = await response.json()

      if (response.ok) {
        setBooks(data.books || [])
      } else {
        toast.error(data.error || "Failed to load books")
      }
    } catch (error) {
      console.error("Error loading books:", error)
      toast.error("Failed to load books")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (fileExtension !== "pdf" && fileExtension !== "epub") {
      toast.error("Please upload a PDF or EPUB file")
      return
    }

    // Upload to server
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", user.uid)

      const response = await fetch("/api/books/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Book uploaded successfully!")
        await loadBooks()
        openBook(data.book)
      } else {
        toast.error(data.error || "Failed to upload book")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload book")
    } finally {
      setIsUploading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const openBook = (book: Book) => {
    setFileType(book.file_type as "pdf" | "epub")
    setFileUrl(book.file_path)
    setFileName(book.file_name)
    setShowLibrary(false)
  }

  const handleReset = () => {
    setFileType(null)
    setFileUrl("")
    setFileName("")
    setShowLibrary(true)
  }

  const handleDeleteBook = async (book: Book) => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/books/delete?bookId=${book.id}&userId=${user.uid}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        toast.success("Book deleted successfully")
        await loadBooks()
        setBookToDelete(null)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete book")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete book")
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Show viewer if book is open
  if (fileType && fileUrl && !showLibrary) {
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

  // Show library/upload interface
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Upload New Book
            </CardTitle>
            <CardDescription>
              Upload PDF or EPUB files to your library. Files are stored securely and synced across devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.epub"
                onChange={handleFileSelect}
                disabled={!user || isUploading}
              />
              <label
                htmlFor="file-upload"
                className={user ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
              >
                {isUploading ? (
                  <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                ) : (
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                )}
                <p className="text-lg font-medium mb-2">
                  {isUploading ? "Uploading..." : "Click to upload a book"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  PDF and EPUB formats • Max 50MB
                </p>
                {user ? (
                  <Button
                    type="button"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Select File"}
                  </Button>
                ) : (
                  <p className="text-sm text-destructive">Please sign in to upload books</p>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Book Library */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-6 w-6" />
              My Library
              {books.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({books.length} {books.length === 1 ? "book" : "books"})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Your uploaded books, synced across all devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No books in your library yet</p>
                <p className="text-sm mt-2">Upload your first book to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {book.file_type === "pdf" ? (
                        <FileText className="h-10 w-10 text-primary" />
                      ) : (
                        <BookOpen className="h-10 w-10 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(book.file_size)} • {book.file_type.toUpperCase()} •
                        Uploaded {formatDate(book.uploaded_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => openBook(book)} size="sm">
                        Open
                      </Button>
                      <Button
                        onClick={() => setBookToDelete(book)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!bookToDelete} onOpenChange={() => setBookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{bookToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bookToDelete && handleDeleteBook(bookToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
