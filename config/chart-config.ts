export const chartLayout = {
    autosize: true,
    xaxis: {
      title: { text: "Principal Component 1 (PC1)" },
      autorange: true,
      showgrid: true,
      gridcolor: "#e5e7eb",
      zeroline: true,
      zerolinecolor: "#9ca3af",
    },
    yaxis: {
      title: { text: "Principal Component 2 (PC2)" },
      autorange: true,
      showgrid: true,
      gridcolor: "#e5e7eb",
      zeroline: true,
      zerolinecolor: "#9ca3af",
    },
    plot_bgcolor: "white",
    paper_bgcolor: "white",
    font: {
      family: "Inter, system-ui, sans-serif",
    },
    dragmode: "lasso" as const,
    selectdirection: "any" as const,
    colorway: "",
    modebar: {
      // vertical modebar button layout
      orientation: 'v' as const,
      margin: 10,
    },
    legend: {
      x: 1.01,
      y: 1,
      xanchor: "left" as const,
      bgcolor: "rgba(255,255,255,0.8)",
      bordercolor: "#e5e7eb",
      borderwidth: 1,
    },
    height: 500,
    margin: {
      r: 265, // added so controls do not overlap with the legend
      l: 50, 
      t: 0, // remove top space for the title
      b: 50,
      pad: 4
    },
};

// Config for the chart
export const chartConfig = {
    displayModeBar: true,
    scrollZoom: true
};

export const chartColourPalettes = new Map<string, string[]>([
  ["Vibrant", [
    "#E6194B",
    "#3CB44B",
    "#FFE119",
    "#0082C8",
    "#F58231",
    "#911EB4",
    "#46F0F0",
    "#F032E6",
    "#D2F53C",
    "#FABEBE",
    "#008080",
    "#E6BEFF",
    "#AA6E28",
    "#FFFAC8",
    "#800000",
    "#808000",
  ]],
  ["Forest",  [
    "#012D3A", // Dark deep teal-blue
    "#FFA600", // Vibrant orange
    "#005F46", // Dark deep green
    "#DAC500", // Golden yellow (lighter)
    "#005565", // Mid teal
    "#2D9146", // Bright green
    "#033F53", // Deep teal-blue
    "#007085", // Lighter mid teal
    "#006A68", // Green-teal
    "#008D8C", // Lighter green-teal
    "#007F5D", // Deep green
    "#5DB26B", // Lighter bright green
    "#72A025", // Chartreuse/lime
    "#53781C", // Darker chartreuse/lime
    "#B6A800", // Golden yellow
    "#D98E00", // Darker orange
  ]],
  ["Dark",    [
    "#1F77B4",
    "#FF7F0E",
    "#2CA02C",
    "#D62728",
    "#9467BD",
    "#8C564B",
    "#E377C2",
    "#7F7F7F",
    "#BCBD22",
    "#17BECF",
    "#393B79",
    "#637939",
    "#8C6D31",
    "#843C39",
    "#7B4173",
    "#5254A3",
  ]],
  ["Colorblind", [
    "#000000",
    "#0072B2",
    "#56B4E9",
    "#009E73",
    "#F0E442",
    "#E69F00",
    "#D55E00",
    "#CC79A7",
    "#332288",
    "#88CCEE",
    "#117733",
    "#999933",
    "#DDCC77",
    "#CC6677",
    "#882255",
    "#AA4499",
  ]],
  ["Tailwind", [
    "#2563EB", // Darker blue (cool, dark)
    "#FDE047", // Lighter yellow (warm, light)
    "#16A34A", // Darker green (cool, dark)
    "#FDBA74", // Lighter orange (warm, light)
    "#3B82F6", // Blue (cool, dark)
    "#FCA5A5", // Lighter red (warm, light)
    "#EAB308", // Yellow
    "#D97706", // Darker yellow
    "#22C55E", // Green
    "#86EFAC", // Lighter green
    "#EF4444", // Red
    "#DC2626", // Darker red
    "#F97316", // Orange
    "#EA580C", // Darker orange
    "#93C5FD", // Lighter blue
    "#64748B", // Neutral gray
  ]],
  ["Sunset", [
    "#003F5C", // Deep indigo (dark)
    "#FFA600", // Golden orange (bright)
    "#665191", // Violet (dark-mid)
    "#FF7C43", // Orange (bright)
    "#2F4B7C", // Dark blue (dark)
    "#D45087", // Raspberry (bright)
    "#002A3F", // Darker deep indigo
    "#4A6BA0", // Lighter dark blue
    "#8570B2", // Lighter violet
    "#A05195", // Magenta-purple
    "#BF7AB4", // Lighter magenta-purple
    "#B53D70", // Darker raspberry
    "#F95D6A", // Bright red-orange
    "#FA828C", // Lighter bright red-orange
    "#E0642F", // Darker orange
    "#FFBF40", // Lighter golden orange
  ]],
]);


