import type { Timestamp } from 'firebase/firestore';

/**
 * Formats a Firestore Timestamp (or null/undefined for pending server timestamps)
 * to a human-readable date string.
 */
export function formatDate(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return '—';

  const date = timestamp.toDate();
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
