import type { Timestamp } from 'firebase/firestore';

export interface Session {
  id: string;
  title: string;
  pointScale: string[];
  isNumericScale: boolean;
  conferenceEnabled: boolean;
  masterId: string;
  status: 'active' | 'ended';
  createdAt: Timestamp;
}

export interface Story {
  id: string;
  sessionId: string;
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'ended';
  timerStart?: Timestamp;
  timerDurationSeconds: 180;
  average?: number | null;
  createdAt: Timestamp;
}

export interface Vote {
  userId: string;
  displayName: string;
  value: string;
  submittedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
}

/** Hardcoded timer duration for MVP (3 minutes) */
export const TIMER_DURATION_SECONDS = 180;
