'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { NotesDialog } from '@/components/notes-dialog'
import { BookOpen } from 'lucide-react'

export function NotesButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="relative"
        aria-label="Open notes"
      >
        <BookOpen className="h-5 w-5" />
        <span className="sr-only">Notes</span>
      </Button>
      <NotesDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
