'use client'

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User,
  ConfirmationResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth'
import { auth } from './firebase'

export interface PhoneSignInData {
  phoneNumber: string
  name?: string
}

// Store the confirmation result and recaptcha verifier globally
let confirmationResult: ConfirmationResult | null = null
let recaptchaVerifier: RecaptchaVerifier | null = null
let recaptchaWidgetId: number | null = null

/**
 * Initialize or get existing reCAPTCHA verifier for phone authentication
 */
export function getRecaptchaVerifier(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  if (!auth) {
    throw new Error('Firebase authentication is not configured. Please add Firebase environment variables.')
  }

  // Return existing verifier if it exists and hasn't been cleared
  if (recaptchaVerifier) {
    return recaptchaVerifier
  }

  // Check if container element exists
  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error(`reCAPTCHA container element with id "${containerId}" not found in DOM`)
  }

  try {
    // Create new invisible reCAPTCHA verifier
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response: any) => {
        console.log('reCAPTCHA solved:', response ? 'success' : 'failed')
      },
      'error-callback': (error: any) => {
        console.error('reCAPTCHA callback error:', error)
      }
    })

    console.log('reCAPTCHA verifier initialized successfully')
    return recaptchaVerifier
  } catch (error: any) {
    console.error('Failed to initialize reCAPTCHA:', error)
    throw new Error(`reCAPTCHA initialization failed: ${error.message}`)
  }
}

/**
 * Clear the reCAPTCHA verifier
 */
export function clearRecaptchaVerifier(): void {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear()
      console.log('reCAPTCHA verifier cleared')
    } catch (error) {
      console.error('Error clearing reCAPTCHA:', error)
    }
    recaptchaVerifier = null
    recaptchaWidgetId = null
  }
}

/**
 * Send SMS verification code to phone number
 */
export async function sendPhoneVerificationCode(
  phoneNumber: string
): Promise<void> {
  if (!auth) {
    throw new Error('Firebase authentication is not configured. Please add Firebase environment variables.')
  }

  try {
    // Clear any existing confirmation result
    confirmationResult = null

    // Get or create reCAPTCHA verifier
    const verifier = getRecaptchaVerifier()

    console.log('Sending verification code to:', phoneNumber)

    // Send verification code
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier)

    console.log('Verification code sent successfully')
  } catch (error: any) {
    console.error('Error sending verification code:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)

    // Clear reCAPTCHA on error to allow retry
    clearRecaptchaVerifier()

    // Throw user-friendly error
    throw new Error(getAuthErrorMessage(error.code || 'unknown'))
  }
}

/**
 * Verify SMS code and sign in user
 */
export async function verifyPhoneCode(code: string, name?: string): Promise<User> {
  if (!confirmationResult) {
    throw new Error('No verification code was sent. Please request a new code.')
  }

  try {
    const result = await confirmationResult.confirm(code)
    const user = result.user

    // Update user profile with display name if provided
    if (user && name) {
      await updateProfile(user, {
        displayName: name,
      })
    }

    // Clear the confirmation result and recaptcha after successful sign-in
    confirmationResult = null
    clearRecaptchaVerifier()

    return user
  } catch (error: any) {
    console.error('Error verifying code:', error)
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  if (!auth) {
    throw new Error('Firebase authentication is not configured. Please add Firebase environment variables.')
  }

  try {
    await signOut(auth)
    // Clear any pending authentication state
    confirmationResult = null
    clearRecaptchaVerifier()
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

/**
 * Get user-friendly error messages for Firebase auth errors
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-phone-number':
      return 'Invalid phone number. Please enter a valid phone number with country code (e.g., +1234567890).'
    case 'auth/missing-phone-number':
      return 'Please enter a phone number.'
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again later.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/operation-not-allowed':
      return 'Phone authentication is not enabled. Please contact support.'
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again in a few minutes.'
    case 'auth/invalid-verification-code':
      return 'Invalid verification code. Please check the code and try again.'
    case 'auth/code-expired':
      return 'Verification code has expired. Please request a new code.'
    case 'auth/missing-verification-code':
      return 'Please enter the verification code.'
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed. Please ensure you are on an authorized domain and try again.'
    case 'auth/internal-error':
      return 'Authentication service error. Please ensure phone authentication is enabled in Firebase Console.'
    case 'auth/invalid-app-credential':
      return 'reCAPTCHA not configured. Go to: https://console.firebase.google.com/project/midssat-6448b/appcheck and register your web app with a reCAPTCHA key.'
    case 'auth/missing-app-credential':
      return 'Missing app credentials. Please ensure phone authentication is enabled in Firebase Console.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized. Please add it to Firebase authorized domains.'
    default:
      return `Authentication error${errorCode !== 'unknown' ? ` (${errorCode})` : ''}. Please try again or contact support.`
  }
}

/**
 * Get user-friendly error messages for OAuth errors
 */
function getOAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.'
    case 'auth/popup-blocked':
      return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.'
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.'
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials. Please use your original sign-in method.'
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later.'
    default:
      return 'An error occurred during sign-in. Please try again.'
  }
}

/**
 * Get the current user
 */
export function getCurrentUser(): User | null {
  return auth?.currentUser || null
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<User> {
  if (!auth) {
    throw new Error('Firebase authentication is not configured. Please add Firebase environment variables.')
  }

  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (error: any) {
    console.error('Error signing in with Google:', error)
    throw new Error(getOAuthErrorMessage(error.code))
  }
}

/**
 * Create a new user with email and password
 */
export async function signUpWithEmail(email: string, password: string, name?: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase authentication is not configured. Please add Firebase environment variables.')
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = result.user

    // Update user profile with display name if provided
    if (user && name) {
      await updateProfile(user, {
        displayName: name,
      })
    }

    // Send email verification
    await sendEmailVerification(user)

    return user
  } catch (error: any) {
    console.error('Error signing up with email:', error)
    throw new Error(getEmailAuthErrorMessage(error.code))
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase authentication is not configured. Please add Firebase environment variables.')
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error: any) {
    console.error('Error signing in with email:', error)
    throw new Error(getEmailAuthErrorMessage(error.code))
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase authentication is not configured. Please add Firebase environment variables.')
  }

  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    console.error('Error sending password reset email:', error)
    throw new Error(getEmailAuthErrorMessage(error.code))
  }
}

/**
 * Get user-friendly error messages for email/password auth errors
 */
function getEmailAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.'
    case 'auth/invalid-email':
      return 'Invalid email address.'
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    default:
      return 'An error occurred. Please try again.'
  }
}
