'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  sendPhoneVerificationCode,
  verifyPhoneCode,
  clearRecaptchaVerifier,
  isRecaptchaConfigured,
  waitForRecaptcha,
  getFirebaseConsoleUrl,
  getCurrentDomainInfo,
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

  // Format phone number for display
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '')
    
    // If it starts with +, keep it as is
    if (cleaned.startsWith('+')) {
      return cleaned
    }
    
    // If it's a US number (10 digits), format it nicely
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    
    // For other cases, just return the cleaned number
    return cleaned
  }

  useEffect(() => {
    // Check if reCAPTCHA is properly configured
    const checkRecaptcha = async () => {
      try {
        // Wait a bit for the script to load
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (!isRecaptchaConfigured()) {
          console.warn('reCAPTCHA is not properly configured. Phone authentication may not work.')
          // Try to wait for reCAPTCHA to be ready
          try {
            await waitForRecaptcha()
            console.log('reCAPTCHA is now ready')
          } catch (error) {
            console.error('reCAPTCHA initialization failed:', error)
          }
        }
      } catch (error) {
        console.error('Error checking reCAPTCHA:', error)
      }
    }

    checkRecaptcha()

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
      
      // Remove all non-digit characters except +
      const digitsOnly = formattedPhone.replace(/[^\d+]/g, '')
      
      if (!digitsOnly.startsWith('+')) {
        // Assume US number if no country code
        formattedPhone = '+1' + digitsOnly
      } else {
        formattedPhone = digitsOnly
      }

      // Validate phone number format - more flexible regex
      // Must start with + and have 10-15 digits total
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
      
      // Provide specific guidance for reCAPTCHA configuration issues
      if (error.message.includes('reCAPTCHA not configured')) {
        const consoleUrl = getFirebaseConsoleUrl()
        toast({
          title: 'reCAPTCHA Configuration Required',
          description: `Please configure reCAPTCHA in Firebase Console. Go to: ${consoleUrl}`,
          variant: 'destructive',
        })
      } else if (error.message.includes('Domain not authorized') || error.message.includes('Hostname match not found')) {
        const consoleUrl = getFirebaseConsoleUrl()
        const domainInfo = getCurrentDomainInfo()
        toast({
          title: 'Domain Authorization Required',
          description: `Please add "${domainInfo.hostname}" to authorized domains in Firebase Console. Go to: ${consoleUrl}`,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error sending code',
          description: error.message || 'Failed to send verification code. Please try again.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate verification code format
      if (!/^\d{6}$/.test(verificationCode)) {
        toast({
          title: 'Invalid code format',
          description: 'Please enter a 6-digit verification code.',
          variant: 'destructive',
        })
        return
      }

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
    <div role="main" aria-label="Phone number sign-in">
      {step === 'phone' ? (
        <form onSubmit={handleSendCode} className="space-y-4" aria-label="Enter phone number">
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              aria-describedby="name-help"
              className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            />
            <p id="name-help" className="text-xs text-muted-foreground">
              Your name will be displayed in your profile
            </p>
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
              aria-describedby="phone-help"
              autoComplete="tel"
              className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            />
            <p id="phone-help" className="text-xs text-muted-foreground">
              Include country code (e.g., +1 for US)
            </p>
          </div>

          {/* reCAPTCHA container - managed by firebase-auth.ts */}
          <div id="recaptcha-container" aria-label="reCAPTCHA verification"></div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            aria-describedby="submit-help"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending code...
              </>
            ) : 'Send Verification Code'}
          </Button>
          <p id="submit-help" className="text-xs text-muted-foreground">
            You will receive an SMS with a verification code
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4" aria-label="Enter verification code">
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
              aria-describedby="code-help"
              autoComplete="one-time-code"
              className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            />
            <p id="code-help" className="text-xs text-muted-foreground">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            aria-describedby="verify-help"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : 'Verify & Sign In'}
          </Button>
          <p id="verify-help" className="text-xs text-muted-foreground">
            This will complete your sign-in process
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleBackToPhone}
            disabled={isLoading}
            aria-label="Use a different phone number"
          >
            Use Different Number
          </Button>
        </form>
      )}
    </div>
  )
}
