import type { Timestamp } from 'firebase/firestore';

/**
 * Calculates remaining seconds based on a Firestore timerStart timestamp
 * and the given duration in seconds.
 * Returns 0 if the timer has expired.
 */
export function getRemainingSeconds(
  timerStart: Timestamp | undefined,
  durationSeconds: number,
): number {
  if (!timerStart) return durationSeconds;

  const startMs = timerStart.toMillis();
  const nowMs = Date.now();
  const elapsedSeconds = Math.floor((nowMs - startMs) / 1000);
  const remaining = durationSeconds - elapsedSeconds;

  return Math.max(0, remaining);
}
