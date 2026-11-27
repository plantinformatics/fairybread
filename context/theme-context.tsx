'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';
import { createLocalStorageStore, useLocalStorageStore } from '@/lib/local-storage-store';

const STORAGE_KEY = 'theme';

type ThemeContextValue = {
  isDark: boolean;
  setIsDark: (nextIsDark: boolean) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// With nothing stored, follow the OS preference. SSR and hydration render light.
const themeStore = createLocalStorageStore<boolean>(
  STORAGE_KEY,
  (raw) => (raw !== null ? raw === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches),
  (isDark) => (isDark ? 'dark' : 'light'),
  false,
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDark = useLocalStorageStore(themeStore);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const value = useMemo(
    () => ({
      isDark,
      setIsDark: themeStore.set,
      toggleTheme: () => themeStore.set(!themeStore.getSnapshot()),
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
