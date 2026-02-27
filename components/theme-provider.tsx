'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'theme';

type ThemeContextValue = {
  isDark: boolean;
  setIsDark: (nextIsDark: boolean) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(nextIsDark: boolean) {
  document.documentElement.classList.toggle('dark', nextIsDark);
  window.localStorage.setItem(STORAGE_KEY, nextIsDark ? 'dark' : 'light');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDarkState] = useState(false);

  const setIsDark = useCallback((nextIsDark: boolean) => {
    applyTheme(nextIsDark);
    setIsDarkState(nextIsDark);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);
  }, [isDark, setIsDark]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextIsDark = stored ? stored === 'dark' : prefersDark;

    applyTheme(nextIsDark);
    setIsDarkState(nextIsDark);
  }, []);

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
