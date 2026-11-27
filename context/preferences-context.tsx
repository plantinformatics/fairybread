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

import { createContext, useContext } from 'react';
import { chartColourPalettes } from '@/config/chart-config';
import {
  DEFAULT_PC_AXES,
  createLocalStorageStore,
  parseStoredBoolean,
  parseStoredPcAxes,
  useIsHydrated,
  useLocalStorageStore,
  type PcAxes,
} from '@/lib/local-storage-store';

export { PC_OPTIONS, type PcAxes, type PcAxis } from '@/lib/local-storage-store';

// ---------------------------------------------------------------------------
// Stores — one localStorage key per preference
// ---------------------------------------------------------------------------

const DEFAULT_PALETTE = 'Dark';

const paletteStore = createLocalStorageStore<string>(
  'pca-plot-palette',
  (raw) => (raw && chartColourPalettes.has(raw) ? raw : DEFAULT_PALETTE),
  String,
);
const advancedPlotSettingsStore = createLocalStorageStore(
  'pca-plot-advanced-settings',
  (raw) => parseStoredBoolean(raw, false),
  String,
);
const resizablePlotStore = createLocalStorageStore(
  'pca-plot-resizable',
  (raw) => parseStoredBoolean(raw, false),
  String,
);
const squarePlotStore = createLocalStorageStore(
  'pca-plot-square',
  (raw) => parseStoredBoolean(raw, false),
  String,
);
const pcAxesStore = createLocalStorageStore('pca-plot-pc-axes', parseStoredPcAxes, JSON.stringify);

const setPalette = (palette: string) => {
  if (chartColourPalettes.has(palette)) paletteStore.set(palette);
};

// Functional updates read the stored (not effective) axes, so editing one axis
// keeps the user's other stored choices.
const setPcAxes = (update: PcAxes | ((prev: PcAxes) => PcAxes)) => {
  pcAxesStore.set(typeof update === 'function' ? update(pcAxesStore.getSnapshot()) : update);
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
  /** Update the palette. Persists to localStorage; unknown palette names are ignored. */
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
  /** Whether the plot shows a drag handle to resize its height. Off unless advanced is on. */
  resizablePlot: boolean;
  setResizablePlot: (enabled: boolean) => void;
  /** Whether the plot axes are locked to equal units (1:1). Off unless advanced is on. */
  squarePlot: boolean;
  setSquarePlot: (enabled: boolean) => void;
  /**
   * False during SSR and hydration (values are defaults), true once the
   * client renders stored values.
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
 *   1. Subscribing to every preference (`palette`, ...).
 *   2. Reading and writing it through localStorage-backed stores
 *      (`lib/local-storage-store.ts`), so there is no hydrate/persist effect.
 *   3. Exposing the combined value to any descendant that calls `usePreferences()`.
 */
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const palette = useLocalStorageStore(paletteStore);
  const advancedPlotSettings = useLocalStorageStore(advancedPlotSettingsStore);
  const pcAxes = useLocalStorageStore(pcAxesStore);
  const resizablePlot = useLocalStorageStore(resizablePlotStore);
  const squarePlot = useLocalStorageStore(squarePlotStore);
  const isHydrated = useIsHydrated();

  // Effective values: fall back to defaults when advanced settings are off so
  // the plot renders the standard PC1/PC2 2D view at a fixed size. Stored
  // choices are kept and reappear when advanced is re-enabled.
  const effectivePcAxes: PcAxes = advancedPlotSettings ? pcAxes : DEFAULT_PC_AXES;

  // --- Provide value to the tree ------------------------------------------
  return (
    <PreferencesContext.Provider
      value={{
        palette,
        setPalette,
        advancedPlotSettings,
        setAdvancedPlotSettings: advancedPlotSettingsStore.set,
        pcAxes: effectivePcAxes, // grabs calcuated value above
        setPcAxes,
        resizablePlot: advancedPlotSettings && resizablePlot,
        setResizablePlot: resizablePlotStore.set,
        squarePlot: advancedPlotSettings && squarePlot,
        setSquarePlot: squarePlotStore.set,
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
