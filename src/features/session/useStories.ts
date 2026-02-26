import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Story } from '@/types/index';

interface UseStoriesReturn {
  stories: Story[];
  loading: boolean;
  error: string | null;
}

export function useStories(sessionId: string | undefined): UseStoriesReturn {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(!sessionId ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const storiesRef = collection(db, 'sessions', sessionId, 'stories');
    const storiesQuery = query(storiesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      storiesQuery,
      (snapshot) => {
        const storiesData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Story,
        );
        setStories(storiesData);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to stories:', err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [sessionId]);

  return { stories, loading, error };
}
