import type { PcAxes } from '@/context/preferences-context';
import { chartColourPalettes } from '@/config/chart-config';

/** Group-by mode that splits rows into `MATCH_GROUP` / `NOT_MATCH_GROUP` by the table filters. */
export const TEXT_FILTER_GROUP_BY = "textFilter";
/** Stands in for a null passport value (see `replaceNullsWithMissing`), and names the group of such rows. */
export const MISSING_VALUE = "N/A";
export const MATCH_GROUP = "Match";
export const NOT_MATCH_GROUP = "Not Match";
/** Rows outside the largest groups (see `extractSortAndFilter`). */
export const OTHER_GROUP = "Other";

export function extractSortAndFilter(PCAPassportData: any[], groupingValue: string, numberOfEntries: number) {
    const groupedPCAPassport = Object.groupBy(PCAPassportData, (p: any) => p[groupingValue]);
    const missing = groupedPCAPassport[MISSING_VALUE] || [];
    delete groupedPCAPassport[MISSING_VALUE];
    const sorted = Object.entries(groupedPCAPassport).sort((a: any, b: any) => b[1].length - a[1].length);
    const top = sorted.slice(0, numberOfEntries);
    const rest = sorted.slice(numberOfEntries).flatMap(([, arr]: any) => arr);
    return [...top, [OTHER_GROUP, rest], [MISSING_VALUE, missing]];
  }

/**
 * Splits `rawData` into the same ordered groups used to build the plot's
 * traces, so other consumers (e.g. table row colouring) can stay in sync
 * with the plot's legend/colour order.
 */
export function buildGroupedEntries(
  rawData: any[],
  groupingValue: string,
  matchedGenotypeIDs: string[] = [],
  numberOfEntries: number = 15,
): [string, any[]][] {
  if (groupingValue === TEXT_FILTER_GROUP_BY) {
    const matchedSet = new Set(matchedGenotypeIDs);
    const groupedData = Object.groupBy(
      rawData,
      (item: any) => (matchedSet.has(item.genotypeID) ? MATCH_GROUP : NOT_MATCH_GROUP),
    );
    return Object.entries(groupedData) as [string, any[]][];
  }
  return extractSortAndFilter(rawData, groupingValue, numberOfEntries) as [string, any[]][];
}

/**
 * Moves the `MATCH_GROUP` group last so its trace is drawn on top; other groups keep their order.
 * Plotly colours traces by index, so anything colouring by group must use this order too.
 * Z order manipulation is only supported in scatter, not scattergl, so trace order is the only way.
 * See https://github.com/plotly/plotly.js/pull/6918
 */
export function orderGroupsForPlot<T extends [string, unknown]>(groupedEntries: T[]): T[] {
  return [...groupedEntries].sort(([a], [b]) => Number(a === MATCH_GROUP) - Number(b === MATCH_GROUP));
}

/**
 * Maps each row's `genotypeID` to the colour its group is assigned in the
 * PCA plot (same group order + palette, see `createPlotData`). Used to draw
 * colour swatches next to values in the active group-by / filtered column.
 */
export function buildRowColorMap(
  groupedEntries: [string, any[]][],
  palette: string,
): Map<string, string> {
  const colors = chartColourPalettes.get(palette) || [];
  const colorMap = new Map<string, string>();
  if (!colors.length) return colorMap;

  orderGroupsForPlot(groupedEntries).forEach(([, items]: any, index) => {
    const color = colors[index % colors.length];
    for (const item of items) {
      colorMap.set(item.genotypeID, color);
    }
  });

  return colorMap;
}

/** `groupingLabel` is the display name of `groupingValue`, shown in the hover label. */
export function createPlotData(
  groupedData: [string, any[]][],
  groupingValue: string,
  groupingLabel: string,
  pcAxes: PcAxes,
) {
    const { x: pcx, y: pcy, z: pcz } = pcAxes;
    return orderGroupsForPlot(groupedData).map(([key, value]) => {
      return {
        x: value.map((p: any) => p.pca[pcx]),
        y: value.map((p: any) => p.pca[pcy]),
        ...(pcz && { z: value.map((p: any) => p.pca[pcz]) }),
        text: value.map((p: any) => p.pca.IID),
        customdata: value.map((p: any) => [
          p.accessionName,
          groupingValue === TEXT_FILTER_GROUP_BY ? key : p[groupingValue] ?? MISSING_VALUE,
          p.otherGenotypeIDs ? `<b>Also genotyped as:</b> ${p.otherGenotypeIDs.join(", ")}<br>` : "",
        ]),
        name: (key.length < 20 ? key : key.substring(0, 17) + "...") + " (" + value.length + ")",
        opacity: key === MATCH_GROUP ? 0.8 : 0.5,
        mode: "markers",
        type: pcz ? "scatter3d" : "scattergl",
        marker: pcz ? { size: 3 } : { size: 5 },
        hovertemplate:
        "<u><b>%{text}</b></u><br>" +
        "<b>Accession Name:</b> %{customdata[0]}<br>" +
        "%{customdata[2]}" +
        `<b>${pcx}:</b> %{x:.2f}<br>` +
        `<b>${pcy}:</b> %{y:.2f}<br>` +
        (pcz ? `<b>${pcz}:</b> %{z:.2f}<br>` : "") +
        `<b>${groupingLabel}:</b> %{customdata[1]}<br>` +
        "<extra></extra>",
      }
    })
}

/**
 * Joins top-level array values (e.g. Genolink's `subsets.title`, since an accession can belong
 * to several subsets) into one sorted "; "-separated string, so grouping, filtering and CSV
 * export can treat them like any other text field. Empty arrays become null.
 */
export function joinListFields(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([key, val]) => [
      key,
      Array.isArray(val) ? (val.length ? [...val].sort().join('; ') : null) : val,
    ])
  );
}

export function replaceNullsWithMissing(value: any): any {
  if (value === null) return MISSING_VALUE;

  if (Array.isArray(value)) {
    return value.map(replaceNullsWithMissing);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, replaceNullsWithMissing(val)])
    );
  }

  return value;
}