'use client';

import { createContext, useContext } from 'react';
import { chartColourPalettes } from '@/config/chart-config';
import { usePersistedState } from '@/hooks/use-persisted-state';
import type { Updater } from '@/lib/persisted-store';
import { DEFAULT_PC_AXES, toPcAxes, type PcAxes } from '@/lib/pc-axes';
import { booleanCodec, jsonCodec, oneOfCodec } from '@/lib/storage-codecs';

const PALETTE_STORAGE_KEY = 'pca-plot-palette';
const ADVANCED_PLOT_SETTINGS_STORAGE_KEY = 'pca-plot-advanced-settings';
const PC_AXES_STORAGE_KEY = 'pca-plot-pc-axes';
const RESIZABLE_PLOT_STORAGE_KEY = 'pca-plot-resizable';
const SQUARE_PLOT_STORAGE_KEY = 'pca-plot-square';

const DEFAULT_PALETTE = 'Dark';

const paletteCodec = oneOfCodec(chartColourPalettes.keys());
const pcAxesCodec = jsonCodec(toPcAxes);

interface PreferencesContextValue {
  palette: string;
  setPalette: (palette: string) => void;
  /** Whether advanced plot settings (PC axis pickers, 3D PCA) are enabled. */
  advancedPlotSettings: boolean;
  setAdvancedPlotSettings: (enabled: boolean) => void;
  /** Always PC1/PC2 2D while advanced settings are off; the stored choice returns when re-enabled. */
  pcAxes: PcAxes;
  setPcAxes: (update: Updater<PcAxes, PcAxes>) => void;
  /** Drag handle to resize plot height. Off unless advanced is on. */
  resizablePlot: boolean;
  setResizablePlot: (enabled: boolean) => void;
  /** Locks plot axes to equal units (1:1). Off unless advanced is on. */
  squarePlot: boolean;
  setSquarePlot: (enabled: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = usePersistedState(PALETTE_STORAGE_KEY, DEFAULT_PALETTE, paletteCodec);
  const [advancedPlotSettings, setAdvancedPlotSettings] = usePersistedState(
    ADVANCED_PLOT_SETTINGS_STORAGE_KEY,
    false,
    booleanCodec,
  );
  const [pcAxes, setPcAxes] = usePersistedState(PC_AXES_STORAGE_KEY, DEFAULT_PC_AXES, pcAxesCodec);
  const [resizablePlot, setResizablePlot] = usePersistedState(RESIZABLE_PLOT_STORAGE_KEY, false, booleanCodec);
  const [squarePlot, setSquarePlot] = usePersistedState(SQUARE_PLOT_STORAGE_KEY, false, booleanCodec);

  return (
    <PreferencesContext.Provider
      value={{
        palette,
        setPalette,
        advancedPlotSettings,
        setAdvancedPlotSettings,
        pcAxes: advancedPlotSettings ? pcAxes : DEFAULT_PC_AXES,
        setPcAxes,
        resizablePlot: advancedPlotSettings && resizablePlot,
        setResizablePlot,
        squarePlot: advancedPlotSettings && squarePlot,
        setSquarePlot,
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
