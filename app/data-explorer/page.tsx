'use client';

import dynamic from "next/dynamic"
import { useQueryStates, parseAsString } from 'nuqs';
import { useEffect, useState, useMemo } from 'react';
import { fetchPCAPassportData } from '@/lib/fetchPCAPassportData';
import NuqsDataGridDemo from '@/components/filters/nuqs';

import { Skeleton } from "@/components/ui/skeleton";

import { chartConfig, chartLayout, chartColourPalettes } from "@/config/chart-config";

import { extractSortAndFilter, createPlotData } from "@/lib/dataProcessing";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] w-[100%] rounded-xl m-4" /> // unlikely to be used because data load is longer
})

export default function Page() {
  const [{ file, groupBy, palette }] = useQueryStates({
    file: parseAsString.withDefault('Wheat'),
    groupBy: parseAsString.withDefault('subRegion'),
    palette: parseAsString.withDefault('Dark')
  });

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const dynamicLayout = useMemo(() => ({
    ...chartLayout,
    colorway: [...chartColourPalettes.get(palette) || []],
  }), [palette]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const PCAPassportData = await fetchPCAPassportData(file);
      const sortedEntries = extractSortAndFilter(PCAPassportData, groupBy, 15);
      const plotData = createPlotData(sortedEntries, groupBy);
      setData(plotData);
      setLoading(false);
    }
    loadData();
  }, [file, groupBy]);

  if (loading) {
    return (
      <div className="mx-auto max-w-full p-4">
        <div className="mb-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
          <h1 className="text-xl font-bold mb-2">Loading PCA Passport Data...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="mb-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
        <h1 className="text-xl font-bold mb-2">PCA Passport Data</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          File: {file} | GroupBy: {groupBy} | Palette: {palette}
        </p>
      </div>
      <div className={`w-full ${loading ? 'blur-xs' : 'blur-none'}`}>
          <Plot
            data={data}
            layout={dynamicLayout}
            config={chartConfig}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
            // onInitialized={ensureGraphDivisBound}
          />
      </div>
      <div>
        <NuqsDataGridDemo></NuqsDataGridDemo>
      </div>
    </div>
  );
}
