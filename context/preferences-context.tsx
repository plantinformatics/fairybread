'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { chartColourPalettes } from '@/config/chart-config';

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
  z: PcAxis | null;
}

const DEFAULT_ADVANCED_PLOT_SETTINGS = false;
const DEFAULT_PC_AXES: PcAxes = { x: 'PC1', y: 'PC2', z: null };

const ADVANCED_PLOT_SETTINGS_STORAGE_KEY = 'pca-plot-advanced-settings';
const PC_AXES_STORAGE_KEY = 'pca-plot-pc-axes';
const RESIZABLE_PLOT_STORAGE_KEY = 'pca-plot-resizable';
const SQUARE_PLOT_STORAGE_KEY = 'pca-plot-square';

/** Read a stored `"true"`/`"false"` flag, or `null` if missing/invalid. */
const readStoredBoolean = (key: string): boolean | null => {
  const raw = window.localStorage.getItem(key);
  return raw === 'true' || raw === 'false' ? raw === 'true' : null;
};

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

interface PreferencesContextValue {
  palette: string;
  setPalette: (palette: string) => void;
  /** Whether advanced plot settings (PC axis pickers, 3D PCA) are enabled. */
  advancedPlotSettings: boolean;
  setAdvancedPlotSettings: (enabled: boolean) => void;
  /** Always PC1/PC2 2D while advanced settings are off; the stored choice returns when re-enabled. */
  pcAxes: PcAxes;
  setPcAxes: (
    update: PcAxes | ((prev: PcAxes) => PcAxes),
  ) => void;
  /** Drag handle to resize plot height. Off unless advanced is on. */
  resizablePlot: boolean;
  setResizablePlot: (enabled: boolean) => void;
  /** Locks plot axes to equal units (1:1). Off unless advanced is on. */
  squarePlot: boolean;
  setSquarePlot: (enabled: boolean) => void;
  /**
   * True once the provider has read localStorage on the client. Consumers
   * that care about avoiding a flash of default values can gate on this.
   */
  isHydrated: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState<string>(DEFAULT_PALETTE);
  const [advancedPlotSettings, setAdvancedPlotSettings] = useState<boolean>(
    DEFAULT_ADVANCED_PLOT_SETTINGS,
  );
  const [pcAxes, setPcAxes] = useState<PcAxes>(DEFAULT_PC_AXES);
  const [resizablePlot, setResizablePlot] = useState<boolean>(false);
  const [squarePlot, setSquarePlot] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    const savedPalette = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    if (savedPalette && chartColourPalettes.has(savedPalette)) {
      setPalette(savedPalette);
    }

    const savedAdvanced = readStoredBoolean(ADVANCED_PLOT_SETTINGS_STORAGE_KEY);
    if (savedAdvanced !== null) setAdvancedPlotSettings(savedAdvanced);

    const savedResizable = readStoredBoolean(RESIZABLE_PLOT_STORAGE_KEY);
    if (savedResizable !== null) setResizablePlot(savedResizable);

    const savedSquare = readStoredBoolean(SQUARE_PLOT_STORAGE_KEY);
    if (savedSquare !== null) setSquarePlot(savedSquare);

    const savedPcAxes = parseStoredPcAxes(
      window.localStorage.getItem(PC_AXES_STORAGE_KEY),
    );
    if (savedPcAxes) setPcAxes(savedPcAxes);

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!chartColourPalettes.has(palette)) return;

    window.localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  }, [isHydrated, palette]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(
      ADVANCED_PLOT_SETTINGS_STORAGE_KEY,
      String(advancedPlotSettings),
    );
  }, [isHydrated, advancedPlotSettings]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(PC_AXES_STORAGE_KEY, JSON.stringify(pcAxes));
  }, [isHydrated, pcAxes]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(RESIZABLE_PLOT_STORAGE_KEY, String(resizablePlot));
    window.localStorage.setItem(SQUARE_PLOT_STORAGE_KEY, String(squarePlot));
  }, [isHydrated, resizablePlot, squarePlot]);

  // Advanced off means the standard PC1/PC2 2D view at a fixed size; stored choices are kept.
  const effectivePcAxes: PcAxes = advancedPlotSettings ? pcAxes : DEFAULT_PC_AXES;

  return (
    <PreferencesContext.Provider
      value={{
        palette,
        setPalette,
        advancedPlotSettings,
        setAdvancedPlotSettings,
        pcAxes: effectivePcAxes,
        setPcAxes,
        resizablePlot: advancedPlotSettings && resizablePlot,
        setResizablePlot,
        squarePlot: advancedPlotSettings && squarePlot,
        setSquarePlot,
        isHydrated,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (ctx === undefined) {
    throw new Error('usePreferences must be used within a <PreferencesProvider>');
  }
  return ctx;
}
