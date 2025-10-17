'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getNotes, saveNote, updateNote, deleteNote, captureScreenshot, type Note } from '@/lib/notes'
import { Camera, Plus, Trash2, Edit2, Save, X, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { ScreenshotZoom } from '@/components/screenshot-zoom'
import { ScreenshotAnnotator } from '@/components/screenshot-annotator'

interface NotesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotesDialog({ open, onOpenChange }: NotesDialogProps) {
  const pathname = usePathname()
  const [notes, setNotes] = useState<Note[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isAnnotating, setIsAnnotating] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    screenshot: undefined as string | undefined,
  })

  useEffect(() => {
    if (open) {
      loadNotes()
    }
  }, [open])

  const loadNotes = () => {
    setNotes(getNotes())
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    setEditingId(null)
    setFormData({ title: '', content: '', screenshot: undefined })
  }

  const handleEdit = (note: Note) => {
    setEditingId(note.id)
    setIsCreating(false)
    setIsAnnotating(false)
    setFormData({
      title: note.title,
      content: note.content,
      screenshot: note.screenshot,
    })
  }

  const handleCaptureScreenshot = async () => {
    setIsCapturing(true)
    try {
      // Hide the sheet/dialog overlay and content while capturing
      const screenshot = await captureScreenshot([
        '[data-slot="sheet-overlay"]',
        '[data-slot="sheet-content"]'
      ])
      if (screenshot) {
        setFormData(prev => ({ ...prev, screenshot }))
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
    } finally {
      setIsCapturing(false)
    }
  }

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    console.log('Saving note with screenshot:', formData.screenshot ? 'Yes' : 'No')
    console.log('Screenshot length:', formData.screenshot?.length || 0)

    try {
      if (editingId) {
        updateNote(editingId, formData)
      } else {
        saveNote({
          title: formData.title,
          content: formData.content,
          screenshot: formData.screenshot,
          path: pathname,
        })
      }

      setIsCreating(false)
      setEditingId(null)
      setFormData({ title: '', content: '', screenshot: undefined })
      loadNotes()
    } catch (error) {
      console.error('Failed to save note:', error)
      alert('Failed to save note. Please try again.')
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(id)
      loadNotes()
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingId(null)
    setIsAnnotating(false)
    setFormData({ title: '', content: '', screenshot: undefined })
  }

  const showingForm = isCreating || editingId !== null

  // Hide sheet overlay when annotating
  useEffect(() => {
    if (isAnnotating) {
      const overlay = document.querySelector('[data-slot="sheet-overlay"]') as HTMLElement
      if (overlay) {
        overlay.style.pointerEvents = 'none'
        overlay.style.opacity = '0'
      }
      const content = document.querySelector('[data-slot="sheet-content"]') as HTMLElement
      if (content) {
        content.style.pointerEvents = 'none'
        content.style.opacity = '0'
      }
    } else {
      const overlay = document.querySelector('[data-slot="sheet-overlay"]') as HTMLElement
      if (overlay) {
        overlay.style.pointerEvents = ''
        overlay.style.opacity = ''
      }
      const content = document.querySelector('[data-slot="sheet-content"]') as HTMLElement
      if (content) {
        content.style.pointerEvents = ''
        content.style.opacity = ''
      }
    }
  }, [isAnnotating])

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>My Notes</SheetTitle>
          <SheetDescription>
            Take notes and capture screenshots to help with your study
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!showingForm && (
            <Button onClick={handleCreateNew} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          )}

          {showingForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingId ? 'Edit Note' : 'New Note'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="Note title..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    placeholder="Write your notes here..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Screenshot</label>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCaptureScreenshot}
                      disabled={isCapturing}
                      className="w-full"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {isCapturing ? 'Capturing...' : formData.screenshot ? 'Retake Screenshot' : 'Capture Screenshot'}
                    </Button>

                    {formData.screenshot && !isAnnotating && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsAnnotating(true)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Annotate
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, screenshot: undefined }))}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                        <ScreenshotZoom
                          src={formData.screenshot}
                          alt="Screenshot preview (click to zoom)"
                          className="w-full border rounded-md"
                        />
                      </div>
                    )}

                    {formData.screenshot && isAnnotating && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Annotation tool opened in full-screen mode</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!showingForm && notes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No notes yet. Create your first note!</p>
            </div>
          )}

          {!showingForm && notes.length > 0 && (
            <div className="space-y-3">
              {notes.map((note) => {
                console.log(`Note "${note.title}" has screenshot:`, !!note.screenshot, 'Length:', note.screenshot?.length || 0)
                return (
                  <Card key={note.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{note.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {format(note.timestamp, 'MMM d, yyyy h:mm a')} • <a href={note.path} className="text-primary hover:underline" onClick={() => onOpenChange(false)}>{note.path}</a>
                            {note.screenshot && ' • Has screenshot'}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(note)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(note.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {(note.content || note.screenshot) && (
                      <CardContent className="space-y-3">
                        {note.content && (
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        )}
                        {note.screenshot && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Screenshot (click to zoom):</p>
                            <ScreenshotZoom
                              src={note.screenshot}
                              alt="Note screenshot"
                              className="w-full border rounded-md max-h-96 object-contain"
                            />
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>

    {/* Render annotator outside of Sheet using Portal */}
    {formData.screenshot && isAnnotating && typeof window !== 'undefined' && createPortal(
      <ScreenshotAnnotator
        screenshot={formData.screenshot}
        onSave={(annotatedImage) => {
          setFormData(prev => ({ ...prev, screenshot: annotatedImage }))
          setIsAnnotating(false)
        }}
      />,
      document.body
    )}
    </>
  )
}
