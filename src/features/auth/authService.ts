import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const ACTION_CODE_SETTINGS = {
  url: window.location.origin + '/login',
  handleCodeInApp: true,
};

const EMAIL_STORAGE_KEY = 'pokerPlanningEmailForSignIn';

/**
 * Send an OTP / magic link to the user's email.
 */
export async function sendOTP(email: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email, ACTION_CODE_SETTINGS);
  window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
}

/**
 * Complete sign-in when the user returns via the email link.
 * Uses the stored email or the provided email override.
 */
export async function completeSignInWithEmailLink(
  emailOverride?: string,
): Promise<void> {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    throw new Error('Invalid sign-in link.');
  }

  const email =
    emailOverride ?? window.localStorage.getItem(EMAIL_STORAGE_KEY);

  if (!email) {
    throw new Error(
      'No email found. Please enter the email you used to sign in.',
    );
  }

  await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(EMAIL_STORAGE_KEY);
}

/**
 * Returns the stored email if the user opened the link on the same device.
 */
export function getStoredEmail(): string | null {
  return window.localStorage.getItem(EMAIL_STORAGE_KEY);
}

/**
 * Check whether the current URL is a Firebase sign-in link.
 */
export function isEmailSignInLink(): boolean {
  return isSignInWithEmailLink(auth, window.location.href);
}
