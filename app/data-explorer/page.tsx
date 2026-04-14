'use client';

import { useQueryState, parseAsString } from 'nuqs';
import { useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { usePalettePreference } from '@/hooks/use-palette-preference';
import { usePcaData } from '@/context/pca-data-context';

import { PcaTable } from '@/components/data-explorer/pca-table';
import { PcaPlot } from "@/components/data-explorer/pca-plot";
import BottomFooter from '@/components/bottom-footer';

export default function Page() {
  // `rawData` and `isLoading` come from the shared context — no local fetch needed.
  const { rawData, isLoading } = usePcaData();

  const [groupBy, setGroupBy] = useQueryState("groupBy", parseAsString.withDefault("subRegion"));
  const { palette } = usePalettePreference();
  const { isDark: isDarkMode } = useTheme();

  const [chartSelection, setChartSelection] = useState<{ IID: string[] }>({
    IID: []
  });
  const [tableFiltered, setTableFiltered] = useState<{ IID: string[] }>({
    IID: []
  });

  return (
    <div className="w-full pl-10">
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
      />
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
    </div>
  );
}
