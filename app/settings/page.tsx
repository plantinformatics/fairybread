'use client';

import Link from "next/link";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { chartColourPalettes } from "@/config/chart-config";
import { usePreferences } from "@/context/preferences-context";

const PALETTE_NAMES = Array.from(chartColourPalettes.keys());

export default function SettingsPage() {
  const { palette, setPalette } = usePreferences();
  const swatches = chartColourPalettes.get(palette) ?? [];

  const handlePaletteChange = (value: string | null) => {
    if (!value) return;
    setPalette(value);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose the default colour palette used by the PCA plot.
      </p>

      <div className="mt-6 rounded-xl border p-5">
        <label className="mb-2 block text-sm font-medium">Plot colour palette</label>
        <Select value={palette} onValueChange={handlePaletteChange}>
          <SelectTrigger className="w-64" size="sm">
            <SelectValue placeholder="Select a palette" />
          </SelectTrigger>
          <SelectContent>
            {PALETTE_NAMES.map((paletteName) => (
              <SelectItem key={paletteName} value={paletteName}>
                {paletteName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-4 flex flex-wrap gap-2">
          {swatches.slice(0, 12).map((colour, index) => (
            <div
              key={`${colour}-${index}`}
              className="h-6 w-6 rounded-md border"
              style={{ backgroundColor: colour }}
              title={colour}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/data-explorer"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Open Data Explorer with this palette
        </Link>
      </div>
    </div>
  );
}