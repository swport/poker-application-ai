import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CreateSessionData {
  title: string;
  pointScale: string[];
  isNumericScale: boolean;
  conferenceEnabled: boolean;
  masterId: string;
}

/**
 * Creates a new poker session in Firestore and returns the generated session ID.
 */
export async function createSession(data: CreateSessionData): Promise<string> {
  const docRef = await addDoc(collection(db, 'sessions'), {
    title: data.title,
    pointScale: data.pointScale,
    isNumericScale: data.isNumericScale,
    conferenceEnabled: data.conferenceEnabled,
    masterId: data.masterId,
    status: 'active' as const,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
