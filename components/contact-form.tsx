"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Send } from "lucide-react"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      setSubmitStatus("success")
      setFormData({ name: "", email: "", subject: "", message: "" })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle")
      }, 5000)
    } catch (error) {
      console.error("Error sending contact message:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background rounded-lg border border-border p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          Contact Us
        </h2>
        <p className="text-muted-foreground">
          Have questions or need support? Send us a message and we'll get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-subject">
            Subject <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contact-subject"
            placeholder="What is this regarding?"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-message">
            Message <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="contact-message"
            placeholder="Tell us how we can help you..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            className="min-h-[150px]"
          />
        </div>

        {submitStatus === "success" && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-800 dark:text-green-200">
            ✓ Thank you for contacting us! We've received your message and will respond within 24-48 hours.
          </div>
        )}

        {submitStatus === "error" && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
            Failed to send message. Please try again or email us directly at support@midssat.com
          </div>
        )}

        <Button
          type="submit"
          className="w-full sm:w-auto gap-2"
          disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.message}
        >
          {isSubmitting ? (
            <>Sending...</>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
