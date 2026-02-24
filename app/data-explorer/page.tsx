'use client';

import dynamic from "next/dynamic"
import { useQueryStates, parseAsString } from 'nuqs';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { fetchPCAPassportData } from '@/lib/fetchPCAPassportData';
import NuqsDataGridDemo from '@/components/filters/nuqs';

import { Skeleton } from "@/components/ui/skeleton";

import { chartConfig, buildChartLayout } from "@/config/chart-config";

import { extractSortAndFilter, createPlotData } from "@/lib/dataProcessing";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-xl" /> // unlikely to be used because data load is longer
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartSelection, setChartSelection] = useState<any>({
    IID: []
  });
  const graphDivRef = useRef<any>(null);
  const isSelectionBoundRef = useRef<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setIsDarkMode(root.classList.contains('dark'));
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const dynamicLayout = useMemo(() => {
    return buildChartLayout(isDarkMode, palette);
  }, [palette, isDarkMode]);

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

  const handleSelected = useCallback((eventData: any) => {
    if (eventData?.points?.length > 0) {
      console.log('Selected points:', eventData);
      setChartSelection((prev: any) => ({ ...prev, IID: eventData.points.map((point: any) => point.text) }));
    } else {
      setChartSelection((prev: any) => ({ ...prev, IID: [] }));
      console.log('No points selected');
    }
  }, []);

  function bindSelectionIfNeeded(graphDiv: any) {
    if (!graphDiv || typeof graphDiv.on !== 'function') return;
    if (isSelectionBoundRef.current) return;
    graphDiv.on('plotly_selected', handleSelected);
    isSelectionBoundRef.current = true;
  }

  // Ensures that the graph div is bound to the chart
  const ensureGraphDivisBound = (figure: any, graphDiv: any) => {
    graphDivRef.current = graphDiv;
    isSelectionBoundRef.current = false;
    bindSelectionIfNeeded(graphDiv);
  }


  return (
    <div className="w-full pl-10">
      <div className={`w-full h-[60vh] max-h-[60vh] py-2 overflow-hidden box-border ${loading ? 'blur-xs' : 'blur-none'}`}>
          <Plot
            data={data}
            layout={dynamicLayout}
            config={chartConfig}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
            onInitialized={ensureGraphDivisBound}
          />
      </div>
      <div>
        <NuqsDataGridDemo PCAPassportData={tableData}></NuqsDataGridDemo>
      </div>
    </div>
  );
}
