'use client';

import { useQueryState, parseAsString } from 'nuqs';
import { useEffect, useState } from 'react';
import { fetchPCAPassportData } from '@/lib/fetchPCAPassportData';
import { useTheme } from '@/components/theme-provider';
import type { PCAPassportData } from '@/config/table-and-filter-config';

import { PcaTable } from '@/components/data-explorer/pca-table';
import { PcaPlot } from "@/components/data-explorer/pca-plot";
import { PcaGroupByDropdown } from '@/components/data-explorer/pca-group-by-dropdown';

export default function Page() {
  const [file, setFile] = useQueryState("file", parseAsString.withDefault("Wheat"));
  const [groupBy, setGroupBy] = useQueryState("groupBy", parseAsString.withDefault("subRegion"));
  const [palette, setPalette] = useQueryState("palette", parseAsString.withDefault("Dark"));

  const [rawData, setRawData] = useState<PCAPassportData[]>([]);
  const { isDark: isDarkMode } = useTheme();
  const [chartSelection, setChartSelection] = useState<{ IID: string[] }>({
    IID: []
  });
  const [tableFiltered, setTableFiltered] = useState<{ IID: string[] }>({
    IID: []
  });

  useEffect(() => {
    async function loadData() {
      setRawData(await fetchPCAPassportData(file))
    }
    loadData();
  }, [file]);

  return (
    <div className="w-full pl-10">
      <div className="mb-2 flex justify-end">
        <PcaGroupByDropdown groupBy={groupBy} setGroupBy={setGroupBy} />
      </div>
      <PcaPlot
      rawData={rawData}
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
      chartSelection={chartSelection}
      setChartSelection={setChartSelection}
      tableFiltered={tableFiltered}
      setTableFiltered={setTableFiltered} 
      />
    </div>
  );
}
