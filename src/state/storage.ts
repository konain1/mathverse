import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { STORAGE_PREFIX } from '@/config/app';

/**
 * All persisted state goes through this adapter. v1 = localStorage.
 * To add cloud sync later (e.g. Firebase), wrap this storage so writes are
 * mirrored to the user's profile; stores do not need to change.
 */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* private mode / quota: progress just won't persist */
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const appStorage = createJSONStorage(() => safeLocalStorage);
export const storageKey = (name: string) => `${STORAGE_PREFIX}.${name}`;
