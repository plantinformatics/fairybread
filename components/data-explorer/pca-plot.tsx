import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import posthog from "posthog-js";

import { buildGroupedEntries, createPlotData } from "@/lib/dataProcessing";
import { chartConfig, buildChartLayout } from "@/config/chart-config";
import type { PCAPassportData } from "@/config/table-and-filter-config";
import { LoadingOverlay } from "@/components/data-explorer/pca-plot-loading-overlay";
import { usePreferences } from "@/context/preferences-context";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-xl" /> // unlikely to be used because data load is longer
})


export function PcaPlot({
  rawData, 
  isLoading,
  groupBy, 
  chartSelection, 
  setChartSelection, 
  tableFiltered, 
  setTableFiltered,
  isDarkMode, 
  palette,
  pve = null,
}:{ 
  rawData: PCAPassportData[];
  isLoading: boolean;
  groupBy: string;
  chartSelection: { IID: string[] };
  setChartSelection: React.Dispatch<React.SetStateAction<{ IID: string[] }>>;
  tableFiltered: { IID: string[] };
  setTableFiltered: React.Dispatch<React.SetStateAction<{ IID: string[] }>>;
  isDarkMode: boolean;
  palette: string;
  pve?: number[] | null;
}) 
{
  const graphDivRef = useRef<any>(null);
  const isSelectionBoundRef = useRef<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const { pcAxes } = usePreferences();

  useEffect(()=>{
    setLoading(true);
    const groupedEntries = buildGroupedEntries(rawData, groupBy, tableFiltered.IID);
    setData(createPlotData(groupedEntries, groupBy, pcAxes));
    setLoading(false);
  }, [rawData, groupBy, tableFiltered, pcAxes])


  // Used because dark mode needs to be an explicit theme change for plotly
  const dynamicLayout = useMemo(() => {
    return buildChartLayout(isDarkMode, palette, pcAxes, pve);
  }, [palette, isDarkMode, pcAxes, pve]);

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

  // used for logging please remove
  useEffect(() => {
    console.log("Chart Selection changed:", chartSelection);
  }, [chartSelection]);

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
  const isPlotLoading = isLoading || loading;

  return (
      <div className="relative w-full h-[60vh] max-h-[60vh] py-2 overflow-hidden box-border">
        {isPlotLoading && <LoadingOverlay message="Loading plot..." />}
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