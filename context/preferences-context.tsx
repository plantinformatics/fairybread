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

export const PC_OPTIONS = [
  'PC1', 'PC2', 'PC3', 'PC4', 'PC5',
  'PC6', 'PC7', 'PC8', 'PC9', 'PC10',
] as const;
export type PcAxis = typeof PC_OPTIONS[number];

const isPcAxis = (value: string | null): value is PcAxis =>
  value !== null && (PC_OPTIONS as readonly string[]).includes(value);

export interface PcAxes {
  x: PcAxis;
  y: PcAxis;
  z: PcAxis | null; // optional value for 3d plotly
}

const DEFAULT_ADVANCED_PLOT_SETTINGS = false;
const DEFAULT_PC_AXES: PcAxes = { x: 'PC1', y: 'PC2', z: null };

const ADVANCED_PLOT_SETTINGS_STORAGE_KEY = 'pca-plot-advanced-settings';
const PC_AXES_STORAGE_KEY = 'pca-plot-pc-axes';

/** Coerce an unknown value to a `PcAxis`, returning `fallback` if invalid. */
const coercePcAxis = (value: unknown, fallback: PcAxis): PcAxis => {
  if (typeof value === 'string' && isPcAxis(value)) return value;
  return fallback;
};

/** Parse a stored JSON blob into a `PcAxes`, falling back to defaults per-field. */
const parseStoredPcAxes = (raw: string | null): PcAxes | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { x, y, z } = parsed as Record<string, unknown>;
    return {
      x: coercePcAxis(x, DEFAULT_PC_AXES.x),
      y: coercePcAxis(y, DEFAULT_PC_AXES.y),
      z: typeof z === 'string' && isPcAxis(z) ? z : null,
    };
  } catch {
    return null;
  }
};

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
  /** Whether advanced plot settings (PC axis pickers, 3D PCA) are enabled. */
  advancedPlotSettings: boolean;
  setAdvancedPlotSettings: (enabled: boolean) => void;
  /**
   * When `advancedPlotSettings` is false this is always the default
   * (`PC1`/`PC2`, 2D) regardless of what the user previously chose — their
   * stored selection is preserved and reappears when advanced is re-enabled.
   */
  pcAxes: PcAxes;
  setPcAxes: (
    update: PcAxes | ((prev: PcAxes) => PcAxes),
  ) => void;
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
  const [advancedPlotSettings, setAdvancedPlotSettings] = useState<boolean>(
    DEFAULT_ADVANCED_PLOT_SETTINGS,
  );
  const [pcAxes, setPcAxes] = useState<PcAxes>(DEFAULT_PC_AXES);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPalette = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    if (savedPalette && chartColourPalettes.has(savedPalette)) {
      setPalette(savedPalette);
    }

    const savedAdvanced = window.localStorage.getItem(ADVANCED_PLOT_SETTINGS_STORAGE_KEY);
    if (savedAdvanced === 'true' || savedAdvanced === 'false') {
      setAdvancedPlotSettings(savedAdvanced === 'true');
    }

    const savedPcAxes = parseStoredPcAxes(
      window.localStorage.getItem(PC_AXES_STORAGE_KEY),
    );
    if (savedPcAxes) setPcAxes(savedPcAxes);

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isHydrated) return;
    if (!chartColourPalettes.has(palette)) return;

    window.localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  }, [isHydrated, palette]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isHydrated) return;
    window.localStorage.setItem(
      ADVANCED_PLOT_SETTINGS_STORAGE_KEY,
      String(advancedPlotSettings),
    );
  }, [isHydrated, advancedPlotSettings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isHydrated) return;
    window.localStorage.setItem(PC_AXES_STORAGE_KEY, JSON.stringify(pcAxes));
  }, [isHydrated, pcAxes]);

  // Effective axes: fall back to defaults when advanced settings are off so
  // the plot renders the standard PC1/PC2 2D view.
  const effectivePcAxes: PcAxes = advancedPlotSettings ? pcAxes : DEFAULT_PC_AXES;

  // --- Provide value to the tree ------------------------------------------
  return (
    <PreferencesContext.Provider
      value={{
        palette,
        setPalette,
        advancedPlotSettings,
        setAdvancedPlotSettings,
        pcAxes: effectivePcAxes, // grabs calcuated value above
        setPcAxes,
        isHydrated,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
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
