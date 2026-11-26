'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { oneOfCodec } from '@/lib/storage-codecs';

const STORAGE_KEY = 'theme';
const themeCodec = oneOfCodec(['dark', 'light']);
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

type ThemeContextValue = {
  isDark: boolean;
  setIsDark: (nextIsDark: boolean) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function subscribeToColorScheme(onChange: () => void) {
  const query = window.matchMedia(DARK_SCHEME_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function usePrefersDark(): boolean {
  return useSyncExternalStore(
    subscribeToColorScheme,
    () => window.matchMedia(DARK_SCHEME_QUERY).matches,
    () => false,
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [storedTheme, setStoredTheme] = usePersistedState(STORAGE_KEY, null, themeCodec);
  const prefersDark = usePrefersDark();
  const isDark = storedTheme === null ? prefersDark : storedTheme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const setIsDark = useCallback(
    (nextIsDark: boolean) => setStoredTheme(nextIsDark ? 'dark' : 'light'),
    [setStoredTheme],
  );

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);
  }, [isDark, setIsDark]);

  const value = useMemo(
    () => ({ isDark, setIsDark, toggleTheme }),
    [isDark, setIsDark, toggleTheme]
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
