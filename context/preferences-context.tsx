'use client';

/**
 * Preferences Context
 *
 * App-wide user preferences persisted to localStorage. Start with `palette`;
 * add more preferences over time by extending the value shape below.
 *
 * Pattern mirrors `context/pca-data-context.tsx` — read that file if anything
 * here feels unfamiliar.
 *
 * The three moving parts of a context:
 *   1. A context object created with `createContext`.
 *   2. A <Provider> component that owns the state and wraps the subtree.
 *   3. A `useXxx()` consumer hook that pulls the value out with `useContext`.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { chartColourPalettes } from '@/config/chart-config';

// ---------------------------------------------------------------------------
// Constants — defaults + storage keys (one key per preference)
// ---------------------------------------------------------------------------

const DEFAULT_PALETTE = 'Dark';
const PALETTE_STORAGE_KEY = 'pca-plot-palette';

// ---------------------------------------------------------------------------
// Context value shape
// ---------------------------------------------------------------------------

/**
 * Everything a consumer can read from (or write to) the preferences store.
 * Add new preferences here as named pairs: `foo` + `setFoo`.
 */
interface PreferencesContextValue {
  /** Current chart colour palette name (e.g. "Dark"). */
  palette: string;
  /** Update the palette. Persists to localStorage via the provider's effect. */
  setPalette: (palette: string) => void;
  /**
   * True once the provider has read localStorage on the client. Consumers
   * that care about avoiding a flash of default values can gate on this.
   */
  isHydrated: boolean;
}

// ---------------------------------------------------------------------------
// Context object
// ---------------------------------------------------------------------------

/**
 * `undefined` as the default value means that if `usePreferences()` is called
 * outside of a `<PreferencesProvider>` it will throw a helpful error (see the
 * consumer hook below) rather than silently returning stale/empty state.
 */
const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Wrap your app tree with this component (already done in `app/layout.tsx`)
 * to make preferences available to all descendants.
 *
 * It is responsible for:
 *   1. Owning the state for every preference (`palette`, ...).
 *   2. Hydrating that state from localStorage on first client render.
 *   3. Persisting changes back to localStorage.
 *   4. Exposing the combined value to any descendant that calls `usePreferences()`.
 */
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  // --- State ---------------------------------------------------------------
  const [palette, setPalette] = useState<string>(DEFAULT_PALETTE);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPalette = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    if (savedPalette && chartColourPalettes.has(savedPalette)) {
      setPalette(savedPalette);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isHydrated) return;
    if (!chartColourPalettes.has(palette)) return;

    window.localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  }, [isHydrated, palette]);

  // --- Provide value to the tree ------------------------------------------
  return (<PreferencesContext.Provider value={{palette, setPalette, isHydrated}}>
    {children}
  </PreferencesContext.Provider>);
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * Read shared preferences. Throws if used outside `<PreferencesProvider>`.
 *
 * @example
 * const { palette, setPalette } = usePreferences();
 *
 * @throws If called outside of a `<PreferencesProvider>` tree.
 */
export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (ctx === undefined) {
    throw new Error('usePreferences must be used within a <PreferencesProvider>');
  }
  return ctx;
}
