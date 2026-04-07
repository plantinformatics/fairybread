'use client';

import { useEffect, useState } from "react";
import { chartColourPalettes } from "@/config/chart-config";

const DEFAULT_PALETTE = "Dark";
const PALETTE_STORAGE_KEY = "pca-plot-palette";

export function usePalettePreference() {
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

  return {
    palette,
    setPalette,
    defaultPalette: DEFAULT_PALETTE,
  };
}
