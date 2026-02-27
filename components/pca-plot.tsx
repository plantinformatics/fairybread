import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";

import { extractSortAndFilter, createPlotData } from "@/lib/dataProcessing";
import { chartConfig, buildChartLayout } from "@/config/chart-config";

const Plot = dynamic(() => import("react-plotly.js"), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full rounded-xl" /> // unlikely to be used because data load is longer
})


export function PcaPlot(
    {rawData, groupBy, chartSelection, setChartSelection, isDarkMode, palette}:
    {rawData: any, groupBy:any, chartSelection: any, setChartSelection: any, isDarkMode: boolean, palette: any}
) {
    const graphDivRef = useRef<any>(null);
    const isSelectionBoundRef = useRef<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<any[]>([]);

    // Data processing for plot
    useEffect(()=>{
      setLoading(true);
      const sortedEntries = extractSortAndFilter(rawData, groupBy, 15);
      const plotData = createPlotData(sortedEntries, groupBy);
      setData(plotData)
      setLoading(false);
    }, [rawData, groupBy])

    // Handles darkmode and layout
    // Used because dark mode needs to be an explicit theme change for plotly
    const dynamicLayout = useMemo(() => {
      return buildChartLayout(isDarkMode, palette);
    }, [palette, isDarkMode]);

    // Handles output of plot selection (for table)
    const handleSelected = useCallback((eventData: any) => {
        if (eventData?.points?.length > 0) {
          setChartSelection((prev: any) => ({ ...prev, IID: eventData.points.map((point: any) => point.text) }));
        } else {
          setChartSelection((prev: any) => ({ ...prev, IID: [] }));
          console.log('No points selected');
        }
      }, []);
    
    useEffect(() => {
    console.log("Chart Selection changed:", chartSelection);
    }, [chartSelection]);

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
    )
}