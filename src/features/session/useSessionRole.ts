import { useAuth } from '@/features/auth/useAuth';
import type { Session } from '@/types/index';

interface UseSessionRoleReturn {
  isMaster: boolean;
}

export function useSessionRole(session: Session | null): UseSessionRoleReturn {
  const { user } = useAuth();

  const isMaster = Boolean(user && session && session.masterId === user.uid);

  return { isMaster };
}
