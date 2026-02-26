import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Adds a new story to a session with 'pending' status.
 */
export async function addStory(
  sessionId: string,
  title: string,
  description?: string,
): Promise<string> {
  const storiesRef = collection(db, 'sessions', sessionId, 'stories');
  const docRef = await addDoc(storiesRef, {
    title,
    description: description ?? null,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Starts a story — sets status to 'active' and writes timerStart.
 * Caller should verify no other story is currently active before calling.
 */
export async function startStory(
  sessionId: string,
  storyId: string,
): Promise<void> {
  const storyRef = doc(db, 'sessions', sessionId, 'stories', storyId);
  await updateDoc(storyRef, {
    status: 'active',
    timerStart: serverTimestamp(),
  });
}

/**
 * Ends a story — sets status to 'ended' and computes average if the session
 * uses a numeric scale. Average calculation reads all votes from the subcollection.
 */
export async function endStory(
  sessionId: string,
  storyId: string,
  isNumericScale: boolean,
): Promise<void> {
  const storyRef = doc(db, 'sessions', sessionId, 'stories', storyId);

  let average: number | null = null;

  if (isNumericScale) {
    const votesRef = collection(
      db,
      'sessions',
      sessionId,
      'stories',
      storyId,
      'votes',
    );
    const votesSnapshot = await getDocs(votesRef);
    const numericValues: number[] = [];

    votesSnapshot.forEach((voteDoc) => {
      const value = Number(voteDoc.data().value);
      if (!Number.isNaN(value)) {
        numericValues.push(value);
      }
    });

    if (numericValues.length > 0) {
      const sum = numericValues.reduce((acc, v) => acc + v, 0);
      average = Math.round((sum / numericValues.length) * 100) / 100;
    }
  }

  await updateDoc(storyRef, {
    status: 'ended',
    average,
  });
}

/**
 * Ends the entire session — sets session status to 'ended'.
 */
export async function endSession(sessionId: string): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    status: 'ended',
  });
}
