'use client'

import { useState, useEffect } from 'react'
import { getNotes, deleteNote, updateNote, captureScreenshot, type Note } from '@/lib/notes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Plus, Trash2, Edit2, Save, X, ArrowLeft, Pencil, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ScreenshotZoom } from '@/components/screenshot-zoom'
import { ScreenshotAnnotator } from '@/components/screenshot-annotator'

export default function NotesPage() {
  const pathname = usePathname()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
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
    loadNotes()
  }, [])

  const loadNotes = async () => {
    setLoading(true)
    try {
      const fetchedNotes = await getNotes()
      setNotes(fetchedNotes)
    } finally {
      setLoading(false)
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCaptureScreenshot = async () => {
    setIsCapturing(true)
    try {
      const screenshot = await captureScreenshot()
      if (screenshot) {
        setFormData(prev => ({ ...prev, screenshot }))
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
    } finally {
      setIsCapturing(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    console.log('Saving note with screenshot:', formData.screenshot ? 'Yes' : 'No')
    console.log('Screenshot length:', formData.screenshot?.length || 0)

    try {
      if (editingId) {
        await updateNote(editingId, formData)
      } else {
        const { saveNote } = require('@/lib/notes')
        await saveNote({
          title: formData.title,
          content: formData.content,
          screenshot: formData.screenshot,
          path: pathname,
        })
      }

      setIsCreating(false)
      setEditingId(null)
      setFormData({ title: '', content: '', screenshot: undefined })
      await loadNotes()
    } catch (error) {
      console.error('Failed to save note:', error)
      alert('Failed to save note. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(id)
      await loadNotes()
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingId(null)
    setIsAnnotating(false)
    setFormData({ title: '', content: '', screenshot: undefined })
  }

  const showingForm = isCreating || editingId !== null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">My Notes</h1>
          <p className="text-muted-foreground mt-2">
            Capture screenshots and take notes to help with your SSAT study
          </p>
        </div>

        <div className="space-y-6">
          {!showingForm && (
            <Button onClick={handleCreateNew} size="lg" className="w-full sm:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              New Note
            </Button>
          )}

          {showingForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
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
                    rows={8}
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
                      className="w-full sm:w-auto"
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
                      <ScreenshotAnnotator
                        screenshot={formData.screenshot}
                        onSave={(annotatedImage) => {
                          setFormData(prev => ({ ...prev, screenshot: annotatedImage }))
                          setIsAnnotating(false)
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Note
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!showingForm && loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading your notes...</p>
              </CardContent>
            </Card>
          )}

          {!showingForm && !loading && notes.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No notes yet. Create your first note!</p>
              </CardContent>
            </Card>
          )}

          {!showingForm && !loading && notes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">All Notes ({notes.length})</h2>
              {notes.map((note) => {
                console.log(`Note "${note.title}" has screenshot:`, !!note.screenshot, 'Length:', note.screenshot?.length || 0)
                return (
                  <Card key={note.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg">{note.title}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {format(note.timestamp, 'MMM d, yyyy h:mm a')} • <Link href={note.path} className="text-primary hover:underline">{note.path}</Link>
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
                      <CardContent className="space-y-4">
                        {note.content && (
                          <div>
                            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                          </div>
                        )}
                        {note.screenshot && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Screenshot (click to zoom):</p>
                            <ScreenshotZoom
                              src={note.screenshot}
                              alt="Note screenshot"
                              className="w-full border rounded-md max-h-[600px] object-contain bg-muted"
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
      </div>
    </div>
  )
}
