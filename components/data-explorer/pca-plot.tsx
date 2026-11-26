import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useRef, useMemo } from "react";
import posthog from "posthog-js";

import { buildGroupedEntries, createPlotData } from "@/lib/dataProcessing";
import { chartConfig, buildChartLayout } from "@/config/chart-config";
import { groupByLabel, type PCAPassportData } from "@/config/table-and-filter-config";
import { LoadingOverlay } from "@/components/data-explorer/pca-plot-loading-overlay";
import { usePreferences } from "@/context/preferences-context";
import type { LoadProgress } from "@/lib/load-progress";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-xl" />
})


export function PcaPlot({
  rawData, 
  isLoading,
  loadProgress = null,
  groupBy, 
  setChartSelection, 
  tableFiltered, 
  isDarkMode, 
  palette,
  pve = null,
}:{ 
  rawData: PCAPassportData[];
  isLoading: boolean;
  loadProgress?: LoadProgress | null;
  groupBy: string;
  setChartSelection: React.Dispatch<React.SetStateAction<{ IID: string[] }>>;
  tableFiltered: { IID: string[] };
  isDarkMode: boolean;
  palette: string;
  pve?: number[] | null;
}) 
{
  const graphDivRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isSelectionBoundRef = useRef<boolean>(false);
  const resizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { pcAxes, squarePlot } = usePreferences();

  // react-plotly's `useResizeHandler` only sees window resizes, not panel drags.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      resizeDebounceRef.current = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 150);
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
    };
  }, []);

  const data = useMemo(() => {
    const groupedEntries = buildGroupedEntries(rawData, groupBy, tableFiltered.IID);
    return createPlotData(groupedEntries, groupBy, groupByLabel(groupBy), pcAxes);
  }, [rawData, groupBy, tableFiltered, pcAxes]);

  const dynamicLayout = useMemo(() => {
    return buildChartLayout(isDarkMode, palette, pcAxes, pve, squarePlot);
  }, [palette, isDarkMode, pcAxes, pve, squarePlot]);

  const handleSelected = useCallback((eventData: any) => {
    if (eventData?.points?.length > 0) {
      const selectedIDs: string[] = eventData.points.map((point: any) => point.text);
      posthog.capture('plot_selection_made', {
        selected_count: selectedIDs.length,
        group_by: groupBy,
      });
      setChartSelection((prev: any) => ({ ...prev, IID: selectedIDs }));
    } else {
      setChartSelection((prev: any) => ({ ...prev, IID: [] }));
    }
  }, [setChartSelection, groupBy]);

  function bindSelectionIfNeeded(graphDiv: any) {
  if (!graphDiv || typeof graphDiv.on !== 'function') return;
  if (isSelectionBoundRef.current) return;
  graphDiv.on('plotly_selected', handleSelected);
  isSelectionBoundRef.current = true;
  }

  const ensureGraphDivisBound = (figure: any, graphDiv: any) => {
  graphDivRef.current = graphDiv;
  isSelectionBoundRef.current = false;
  bindSelectionIfNeeded(graphDiv);
  }    
  return (
      <div ref={containerRef} className="relative w-full h-full min-w-0 overflow-hidden box-border">
        {isLoading && <LoadingOverlay message="Loading plot..." progress={loadProgress} />}
        <Plot
          data={data}
          layout={dynamicLayout}
          config={chartConfig}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
          onInitialized={ensureGraphDivisBound}
        />
    </div>
  )
}