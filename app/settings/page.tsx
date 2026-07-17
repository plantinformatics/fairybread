'use client';

import Link from "next/link";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { chartColourPalettes } from "@/config/chart-config";
import { PC_OPTIONS, type PcAxis, usePreferences } from "@/context/preferences-context";

const PALETTE_NAMES = Array.from(chartColourPalettes.keys());
const PC_Z_NONE_VALUE = '__none__';

export default function SettingsPage() {
  const {
    palette,
    setPalette,
    advancedPlotSettings,
    setAdvancedPlotSettings,
    pcAxes,
    setPcAxes,
  } = usePreferences();
  const swatches = chartColourPalettes.get(palette) ?? [];

  const handlePaletteChange = (value: string | null) => {
    if (!value) return;
    setPalette(value);
  };

  const handlePcChange = (axis: 'x' | 'y') => (value: string | null) => {
    if (!value) return;
    if ((PC_OPTIONS as readonly string[]).includes(value)) {
      setPcAxes((prev) => ({ ...prev, [axis]: value as PcAxis }));
    }
  };

  const handlePcZChange = (value: string | null) => {
    if (!value) return;
    if (value === PC_Z_NONE_VALUE) {
      setPcAxes((prev) => ({ ...prev, z: null }));
      return;
    }
    if ((PC_OPTIONS as readonly string[]).includes(value)) {
      setPcAxes((prev) => ({ ...prev, z: value as PcAxis }));
    }
  };

  return (
    <div className="mr-auto w-full max-w-3xl px-6 py-8">
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

      <div className="mt-6 rounded-xl border p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label
              htmlFor="advanced-plot-settings"
              className="block text-sm font-medium"
            >
              Advanced plot settings
            </label>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick which principal components are plotted. Add a third
              component to render a 3D PCA.
            </p>
          </div>
          <Switch
            id="advanced-plot-settings"
            checked={advancedPlotSettings}
            onCheckedChange={setAdvancedPlotSettings}
          />
        </div>

        {advancedPlotSettings && (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">X axis</label>
              <Select value={pcAxes.x} onValueChange={handlePcChange('x')}>
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Select PC" />
                </SelectTrigger>
                <SelectContent>
                  {PC_OPTIONS.map((pc) => (
                    <SelectItem key={pc} value={pc}>
                      {pc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Y axis</label>
              <Select value={pcAxes.y} onValueChange={handlePcChange('y')}>
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Select PC" />
                </SelectTrigger>
                <SelectContent>
                  {PC_OPTIONS.map((pc) => (
                    <SelectItem key={pc} value={pc}>
                      {pc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Z axis <span className="text-muted-foreground">(3D)</span>
              </label>
              <Select
                value={pcAxes.z ?? PC_Z_NONE_VALUE}
                onValueChange={handlePcZChange}
              >
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="None (2D)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PC_Z_NONE_VALUE}>None (2D)</SelectItem>
                  {PC_OPTIONS.map((pc) => (
                    <SelectItem key={pc} value={pc}>
                      {pc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
