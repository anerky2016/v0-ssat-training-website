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
  PhoneAuthProvider,
  signInWithCredential,
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

// Store the confirmation result globally for the verification step
let confirmationResult: ConfirmationResult | null = null

/**
 * Initialize reCAPTCHA verifier for phone authentication
 */
export function initializeRecaptcha(containerId: string, size: 'invisible' | 'normal' = 'normal'): RecaptchaVerifier {
  if (!auth) {
    throw new Error('Firebase authentication is not configured. Please add Firebase environment variables.')
  }

  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: size,
    callback: () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber
    },
  })

  return recaptchaVerifier
}

/**
 * Send SMS verification code to phone number
 */
export async function sendPhoneVerificationCode(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<void> {
  if (!auth) {
    throw new Error('Firebase authentication is not configured. Please add Firebase environment variables.')
  }

  try {
    // Store the confirmation result for later verification
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
  } catch (error: any) {
    console.error('Error sending verification code:', error)
    console.error('Error code:', error.code)
    console.error('Error details:', error)
    throw new Error(getAuthErrorMessage(error.code))
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

    // Clear the confirmation result
    confirmationResult = null

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
      return 'Invalid phone number. Please enter a valid phone number with country code.'
    case 'auth/missing-phone-number':
      return 'Please enter a phone number.'
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again later.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/operation-not-allowed':
      return 'Phone authentication is not enabled.'
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later.'
    case 'auth/invalid-verification-code':
      return 'Invalid verification code. Please check the code and try again.'
    case 'auth/code-expired':
      return 'Verification code has expired. Please request a new code.'
    case 'auth/missing-verification-code':
      return 'Please enter the verification code.'
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed. Please try again.'
    case 'auth/internal-error':
      return 'Authentication service error. Please ensure your domain is authorized in Firebase Console and try again.'
    case 'auth/invalid-app-credential':
      return 'Firebase project configuration error. Please set up reCAPTCHA in Firebase Console (Authentication → Settings → Phone number sign-in).'
    default:
      return 'An error occurred. Please try again.'
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
