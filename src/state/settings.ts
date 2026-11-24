import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClassLevel, Lang } from '@/topics/types';
import { appStorage, storageKey } from './storage';

export type Theme = 'dark' | 'light';

interface SettingsState {
  lang: Lang;
  theme: Theme;
  classLevel: ClassLevel;
  sound: boolean;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setClassLevel: (c: ClassLevel) => void;
  setSound: (on: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      lang: 'hinglish',
      theme: 'dark',
      classLevel: 8,
      sound: true,
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setClassLevel: (classLevel) => set({ classLevel }),
      setSound: (sound) => set({ sound }),
    }),
    {
      // index.html reads this key before paint to avoid a theme flash
      name: storageKey('settings'),
      storage: appStorage,
      version: 1,
      partialize: ({ lang, theme, classLevel, sound }) => ({ lang, theme, classLevel, sound }),
    },
  ),
);
