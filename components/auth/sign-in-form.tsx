'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { sendPasswordReset } from '@/lib/firebase-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface SignInData {
  email: string
  password: string
}

export function SignInForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: 'Sign in failed',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have been signed in successfully.',
        })

        // Redirect to home page
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!formData.email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address first.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      await sendPasswordReset(formData.email)
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for instructions to reset your password.',
      })
      setShowResetPassword(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <button
            type="button"
            onClick={() => setShowResetPassword(!showResetPassword)}
            className="text-xs text-primary hover:underline"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      {showResetPassword && (
        <div className="rounded-lg border bg-muted p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Enter your email above and click the button below to receive a password reset link.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePasswordReset}
            disabled={isLoading}
          >
            Send Reset Email
          </Button>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
