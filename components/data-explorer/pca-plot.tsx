import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useRef, useMemo } from "react";
import type { PlotSelectionEvent } from "plotly.js";
import posthog from "posthog-js";

import { buildGroupedEntries, createPlotData } from "@/lib/dataProcessing";
import { chartConfig, buildChartLayout } from "@/config/chart-config";
import type { PCAPassportData } from "@/config/table-and-filter-config";
import { LoadingOverlay } from "@/components/data-explorer/pca-plot-loading-overlay";
import { usePreferences } from "@/context/preferences-context";
import type { LoadProgress } from "@/lib/load-progress";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-xl" /> // unlikely to be used because data load is longer
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { pcAxes, squarePlot } = usePreferences();

  // react-plotly.js's `useResizeHandler` only reacts to `window` resize
  // events, so dragging the resizable panel handle (which resizes this
  // container without resizing the window) never triggers a redraw.
  // Watch the container itself and nudge Plotly to resize, debounced so we
  // don't thrash the chart while the user is actively dragging the handle.
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

  const data = useMemo(
    () => createPlotData(buildGroupedEntries(rawData, groupBy, tableFiltered.IID), groupBy, pcAxes),
    [rawData, groupBy, tableFiltered, pcAxes],
  );


  // Used because dark mode needs to be an explicit theme change for plotly
  const dynamicLayout = useMemo(() => {
    return buildChartLayout(isDarkMode, palette, pcAxes, pve, squarePlot);
  }, [palette, isDarkMode, pcAxes, pve, squarePlot]);

  const handleSelected = useCallback((eventData: Readonly<PlotSelectionEvent>) => {
    if (eventData?.points?.length > 0) {
      const selectedIDs = eventData.points.map((point) => point.text);
      posthog.capture('plot_selection_made', {
        selected_count: selectedIDs.length,
        group_by: groupBy,
      });
      setChartSelection((prev) => ({ ...prev, IID: selectedIDs }));
    } else {
      setChartSelection((prev) => ({ ...prev, IID: [] }));
    }
  }, [setChartSelection, groupBy]);

  const isPlotLoading = isLoading;

  return (
      <div ref={containerRef} className="relative w-full h-full min-w-0 overflow-hidden box-border">
        {isPlotLoading && <LoadingOverlay message="Loading plot..." progress={isLoading ? loadProgress : null} />}
        <Plot
          data={data}
          layout={dynamicLayout}
          config={chartConfig}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
          onSelected={handleSelected}
        />
    </div>
  )
}