import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import type { Session } from '@/types/index';

interface UseSessionReturn {
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useSession(sessionId: string | undefined): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!sessionId ? false : true);
  const [error, setError] = useState<string | null>(
    !sessionId ? 'No session ID provided' : null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const docRef = doc(db, 'sessions', sessionId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError('Session not found');
          setSession(null);
          setLoading(false);
          navigate('/dashboard', { replace: true });
          return;
        }

        setSession({ id: snapshot.id, ...snapshot.data() } as Session);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to session:', err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [sessionId, navigate]);

  return { session, loading, error };
}
