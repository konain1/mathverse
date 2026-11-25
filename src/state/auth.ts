import { useEffect } from 'react';
import { create } from 'zustand';
import { api, type User } from '@/lib/api';
import { useProgress, type SavedProgress } from './progress';

type Status = 'loading' | 'guest' | 'user';

interface AuthState {
  status: Status;
  user: User | null;
  /** asks the backend who is logged in (once, on app start) */
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (b: { name: string; email: string; password: string; classLevel: number }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>()((set, get) => ({
  status: 'loading',
  user: null,
  init: async () => {
    if (get().status !== 'loading') return;
    try {
      const { user } = await api.me();
      set({ status: 'user', user });
    } catch {
      set({ status: 'guest', user: null });
    }
  },
  login: async (email, password) => {
    const { user } = await api.login(email, password);
    set({ status: 'user', user });
  },
  signup: async (b) => {
    const { user } = await api.signup(b);
    set({ status: 'user', user });
  },
  logout: async () => {
    await api.logout().catch(() => undefined);
    set({ status: 'guest', user: null });
  },
}));

const snapshot = (): SavedProgress => {
  const { stars, built, watched } = useProgress.getState();
  return { stars, built, watched };
};

/**
 * Mounted once in the app shell. Finds out who is logged in, then keeps progress in sync:
 * on login this device's progress is merged into the account (best stars win),
 * and every later change is saved to the account a moment after it happens.
 */
export function useAuthAndSync() {
  const userId = useAuth((s) => s.user?.id);
  useEffect(() => {
    void useAuth.getState().init();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let applying = false;

    const push = async () => {
      try {
        const { progress } = await api.pushProgress(snapshot());
        if (cancelled) return;
        applying = true;
        useProgress.getState().replaceAll(progress);
        applying = false;
      } catch {
        /* offline: progress stays on this device and is sent with the next change */
      }
    };
    void push();
    const unsub = useProgress.subscribe(() => {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(() => void push(), 800);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsub();
    };
  }, [userId]);
}
