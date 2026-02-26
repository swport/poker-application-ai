import { useEffect, useState } from 'react';
import type { Timestamp } from 'firebase/firestore';
import { getRemainingSeconds } from '@/utils/timerUtils';

interface UseCountdownReturn {
  secondsRemaining: number;
  isExpired: boolean;
}

/**
 * Countdown hook that derives remaining time from a Firestore timerStart Timestamp.
 * Ticks every second via setInterval and cleans up on unmount.
 */
export function useCountdown(
  timerStart: Timestamp | undefined,
  durationSeconds: number,
): UseCountdownReturn {
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    getRemainingSeconds(timerStart, durationSeconds),
  );

  useEffect(() => {
    if (!timerStart) {
      return;
    }

    const intervalId = setInterval(() => {
      const remaining = getRemainingSeconds(timerStart, durationSeconds);
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timerStart, durationSeconds]);

  // Reset when timerStart or durationSeconds changes
  // Using an IIFE-free pattern: derive initial value synchronously outside effect
  const computedRemaining = timerStart
    ? getRemainingSeconds(timerStart, durationSeconds)
    : durationSeconds;

  // Sync state outside of effect when inputs change
  if (!timerStart && secondsRemaining !== durationSeconds) {
    setSecondsRemaining(durationSeconds);
  }

  return {
    secondsRemaining: timerStart ? secondsRemaining : computedRemaining,
    isExpired: (timerStart ? secondsRemaining : computedRemaining) <= 0,
  };
}
