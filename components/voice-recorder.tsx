"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, Trash2, Download } from "lucide-react"
import { uploadAudio } from "@/lib/supabase"
import { auth } from "@/lib/firebase"

interface VoiceRecorderProps {
  onAudioSaved: (audioUrl: string) => void
  existingAudioUrl?: string
  onAudioDeleted?: () => void
}

export function VoiceRecorder({ onAudioSaved, existingAudioUrl, onAudioDeleted }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Update audio URL if prop changes
    if (existingAudioUrl && existingAudioUrl !== audioUrl) {
      setAudioUrl(existingAudioUrl)
    }
  }, [existingAudioUrl])

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        // Upload to Supabase
        const userId = auth?.currentUser?.uid
        if (userId) {
          setIsUploading(true)
          const uploadedUrl = await uploadAudio(userId, audioBlob)
          if (uploadedUrl) {
            setAudioUrl(uploadedUrl)
            onAudioSaved(uploadedUrl)
          }
          setIsUploading(false)
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const togglePlayback = () => {
    if (!audioUrl) return

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => setIsPlaying(false)
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setAudioUrl(null)
    setIsPlaying(false)
    setRecordingTime(0)
    if (onAudioDeleted) {
      onAudioDeleted()
    }
  }

  const downloadRecording = () => {
    if (!audioUrl) return

    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `note-audio-${Date.now()}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {!isRecording && !audioUrl && (
          <Button
            onClick={startRecording}
            className="gap-2"
            size="sm"
          >
            <Mic className="h-4 w-4" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="gap-2"
              size="sm"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
            <span className="text-sm text-muted-foreground animate-pulse">
              Recording: {formatTime(recordingTime)}
            </span>
          </>
        )}

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={togglePlayback}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isUploading}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Play
                </>
              )}
            </Button>

            <Button
              onClick={downloadRecording}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isUploading}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>

            <Button
              onClick={deleteRecording}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>

            <Button
              onClick={startRecording}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isUploading}
            >
              <Mic className="h-4 w-4" />
              Re-record
            </Button>

            {isUploading && (
              <span className="text-xs text-muted-foreground">
                Uploading...
              </span>
            )}
          </div>
        )}
      </div>

      {audioUrl && recordingTime > 0 && !isRecording && (
        <div className="text-xs text-muted-foreground">
          Duration: {formatTime(recordingTime)}
        </div>
      )}
    </div>
  )
}
