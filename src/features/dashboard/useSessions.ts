import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Session } from '@/types/index';

interface UseSessionsResult {
  sessions: Session[];
  loading: boolean;
  error: string | null;
}

/**
 * Real-time hook that listens to sessions where the authenticated user is the master.
 * Ordered by createdAt descending (newest first).
 * Requires a composite Firestore index: sessions — masterId ASC, createdAt DESC.
 */
export function useSessions(userId: string | undefined): UseSessionsResult {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'sessions'),
      where('masterId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Session[];
        setSessions(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('useSessions listener error:', err);
        setError('Unable to load sessions. Please try again later.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  return { sessions, loading, error };
}
