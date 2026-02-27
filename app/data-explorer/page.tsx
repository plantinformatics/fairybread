'use client';

import { useQueryStates, parseAsString } from 'nuqs';
import { useEffect, useState } from 'react';
import { fetchPCAPassportData } from '@/lib/fetchPCAPassportData';
import { useTheme } from '@/components/theme-provider';

import { PcaTable } from '@/components/pca-table';
import { PcaPlot } from "@/components/pca-plot";

export default function Page() {
  const [{ file, groupBy, palette }] = useQueryStates({
    file: parseAsString.withDefault('Wheat'),
    groupBy: parseAsString.withDefault('subRegion'),
    palette: parseAsString.withDefault('Dark')
  });

  const [rawData, setRawData] = useState<any[]>([]);
  const { isDark: isDarkMode } = useTheme();
  const [chartSelection, setChartSelection] = useState<any>({
    IID: []
  });

  useEffect(() => {
    async function loadData() {
      setRawData(await fetchPCAPassportData(file))
    }
    loadData();
  }, [file, groupBy]);

  return (
    <div className="w-full pl-10">
      <PcaPlot
      rawData={rawData}
      groupBy={groupBy}
      chartSelection={chartSelection}
      setChartSelection={setChartSelection}
      isDarkMode={isDarkMode}
      palette={palette}
      />
      <PcaTable 
      rawData={rawData}
      chartSelection={chartSelection}
      />
    </div>
  );
}
