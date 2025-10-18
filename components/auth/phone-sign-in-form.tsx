'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  sendPhoneVerificationCode,
  verifyPhoneCode,
  clearRecaptchaVerifier,
} from '@/lib/firebase-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface PhoneSignInFormProps {
  onSuccess?: () => void
}

export function PhoneSignInForm({ onSuccess }: PhoneSignInFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      clearRecaptchaVerifier()
    }
  }, [])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Format phone number with country code if not present
      let formattedPhone = phoneNumber.trim()
      if (!formattedPhone.startsWith('+')) {
        // Assume US number if no country code
        formattedPhone = '+1' + formattedPhone.replace(/\D/g, '')
      }

      // Validate phone number format
      if (!/^\+\d{10,15}$/.test(formattedPhone)) {
        toast({
          title: 'Invalid phone number',
          description: 'Please enter a valid phone number with country code (e.g., +1234567890)',
          variant: 'destructive',
        })
        return
      }

      // Send verification code
      await sendPhoneVerificationCode(formattedPhone)

      toast({
        title: 'Code sent!',
        description: 'Please check your phone for the verification code.',
      })

      setPhoneNumber(formattedPhone)
      setStep('code')
    } catch (error: any) {
      console.error('Send code error:', error)
      toast({
        title: 'Error sending code',
        description: error.message || 'Failed to send verification code. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = await verifyPhoneCode(verificationCode, name || undefined)

      toast({
        title: 'Welcome!',
        description: 'You have been signed in successfully.',
      })

      // Close the dialog if callback provided
      if (onSuccess) {
        onSuccess()
      }

      // Redirect to home page
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 300)
    } catch (error: any) {
      console.error('Verification error:', error)
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid verification code. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToPhone = () => {
    setStep('phone')
    setVerificationCode('')
    clearRecaptchaVerifier()
  }

  return (
    <>
      {step === 'phone' ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1 for US)
            </p>
          </div>

          {/* reCAPTCHA container - managed by firebase-auth.ts */}
          <div id="recaptcha-container"></div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending code...' : 'Send Verification Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              required
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify & Sign In'}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleBackToPhone}
            disabled={isLoading}
          >
            Use Different Number
          </Button>
        </form>
      )}
    </>
  )
}
