'use client'

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
  User,
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential,
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
export function initializeRecaptcha(containerId: string): RecaptchaVerifier {
  if (!auth) {
    throw new Error('Firebase authentication is not configured. Please add Firebase environment variables.')
  }

  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
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
    default:
      return 'An error occurred. Please try again.'
  }
}

/**
 * Get the current user
 */
export function getCurrentUser(): User | null {
  return auth?.currentUser || null
}
