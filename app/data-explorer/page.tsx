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
  loading: () => <Skeleton className="w-full h-[70vh] max-h-[70vh] rounded-xl" /> // unlikely to be used because data load is longer
})

export default function Page() {
  const [{ file, groupBy, palette }] = useQueryStates({
    file: parseAsString.withDefault('Wheat'),
    groupBy: parseAsString.withDefault('subRegion'),
    palette: parseAsString.withDefault('Dark')
  });

  const [data, setData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState(true);

  const dynamicLayout = useMemo(() => {
    // Let Plotly autosize to the parent container height instead of fixed layout height.
    const { height: _defaultHeight, ...baseLayout } = chartLayout;
    return {
      ...baseLayout,
      autosize: true,
      colorway: [...chartColourPalettes.get(palette) || []],
    };
  }, [palette]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const PCAPassportData = await fetchPCAPassportData(file);
      const sortedEntries = extractSortAndFilter(PCAPassportData, groupBy, 15);
      setTableData(PCAPassportData);
      const plotData = createPlotData(sortedEntries, groupBy);
      setData(plotData);
      setLoading(false);
    }
    loadData();
  }, [file, groupBy]);


  return (
    <div className="w-full p-4">
      <div className={`w-full h-[70vh] max-h-[70vh] ${loading ? 'blur-xs' : 'blur-none'}`}>
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
        <NuqsDataGridDemo PCAPassportData={tableData}></NuqsDataGridDemo>
      </div>
    </div>
  );
}
