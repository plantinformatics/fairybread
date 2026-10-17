'use client';

import { useQueryState, parseAsString } from 'nuqs';
import { useState } from 'react';
import { useTheme } from '@/context/theme-context';
import { usePreferences } from '@/context/preferences-context';
import { usePcaData } from '@/context/pca-data-context';

import { PcaTable } from '@/components/data-explorer/pca-table';
import { PcaPlot } from "@/components/data-explorer/pca-plot";
import { DEFAULT_PLOT_HEIGHT, ResizablePlotPanel } from '@/components/data-explorer/resizable-plot-panel';
import { CustomListConflictDialog } from '@/components/data-explorer/custom-list-conflict-dialog';
import BottomFooter from '@/components/bottom-footer';

export default function Page() {
  // `rawData` and `isLoading` come from the shared context — no local fetch needed.
  const { rawData, isLoading, pve } = usePcaData();

  const [groupBy, setGroupBy] = useQueryState("groupBy", parseAsString.withDefault("subRegion"));
  const { palette, resizablePlot } = usePreferences();
  const { isDark: isDarkMode } = useTheme();

  const [chartSelection, setChartSelection] = useState<{ IID: string[] }>({
    IID: [] 
  });
  const [tableFiltered, setTableFiltered] = useState<{ IID: string[] }>({
    IID: []
  });

  return (
    // pl-2 is used to bring the plot and table in line with the start of the icon
    <div className="w-full min-w-0 pl-2"> 
      <PlotPanel resizable={resizablePlot}>
        <PcaPlot
        rawData={rawData}
        isLoading={isLoading}
        groupBy={groupBy}
        chartSelection={chartSelection}
        setChartSelection={setChartSelection}
        tableFiltered={tableFiltered}
        setTableFiltered={setTableFiltered}
        isDarkMode={isDarkMode}
        palette={palette}
        pve={pve}
        />
      </PlotPanel>
      <PcaTable
      rawData={rawData} 
      isLoading={isLoading}
      groupBy={groupBy}
      setGroupBy={setGroupBy}
      chartSelection={chartSelection}
      setChartSelection={setChartSelection}
      tableFiltered={tableFiltered}
      setTableFiltered={setTableFiltered} 
      />
      <BottomFooter></BottomFooter>
      <CustomListConflictDialog isPlotReady={!isLoading && rawData.length > 0} />
    </div>
  );
}

/** Drag-to-resize panel when enabled in advanced settings, otherwise a fixed default height. */
function PlotPanel({ resizable, children }: { resizable: boolean; children: React.ReactNode }) {
  if (resizable) return <ResizablePlotPanel>{children}</ResizablePlotPanel>;
  return <div className="w-full min-w-0" style={{ height: DEFAULT_PLOT_HEIGHT }}>{children}</div>;
}
