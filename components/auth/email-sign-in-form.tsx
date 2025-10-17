'use client'

import { useState } from 'react'
import { signInWithEmail, signUpWithEmail, resetPassword } from '@/lib/firebase-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface EmailSignInFormProps {
  onSuccess?: () => void
}

export function EmailSignInForm({ onSuccess }: EmailSignInFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isResetPassword) {
        // Handle password reset
        await resetPassword(email)
        toast({
          title: 'Password reset email sent',
          description: 'Check your email for instructions to reset your password.',
        })
        setIsResetPassword(false)
        setEmail('')
      } else if (isSignUp) {
        // Handle sign up
        await signUpWithEmail(email, password, name || undefined)
        toast({
          title: 'Welcome!',
          description: 'Account created successfully. Please check your email to verify your account.',
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        // Handle sign in
        await signInWithEmail(email, password)
        toast({
          title: 'Welcome back!',
          description: 'You have been signed in successfully.',
        })
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      toast({
        title: isSignUp ? 'Sign up failed' : isResetPassword ? 'Reset failed' : 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isResetPassword) {
    return (
      <div className="space-y-4">
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold">Reset Password</h3>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setIsResetPassword(false)
              setEmail('')
            }}
            disabled={isLoading}
          >
            Back to Sign In
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">{isSignUp ? 'Create Account' : 'Sign In'}</h3>
        <p className="text-sm text-muted-foreground">
          {isSignUp
            ? 'Create a new account to get started'
            : 'Sign in to your account to continue'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
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
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder={isSignUp ? 'At least 6 characters' : 'Your password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
          />
        </div>

        {!isSignUp && (
          <div className="text-right">
            <Button
              type="button"
              variant="link"
              className="px-0 text-sm"
              onClick={() => setIsResetPassword(true)}
              disabled={isLoading}
            >
              Forgot password?
            </Button>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {isSignUp ? 'Already have an account?' : 'New here?'}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setPassword('')
            setName('')
          }}
          disabled={isLoading}
        >
          {isSignUp ? 'Sign In Instead' : 'Create New Account'}
        </Button>
      </form>
    </div>
  )
}
