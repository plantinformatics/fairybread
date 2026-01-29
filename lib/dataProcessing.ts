export function extractSortAndFilter(PCAPassportData: any[], groupingValue: string, numberOfEntries: number) {
    const groupedPCAPassport = Object.groupBy(PCAPassportData, (p: any) => p[groupingValue]);
    // extract null entries
    const missing = groupedPCAPassport["N/A"] || [];
    delete groupedPCAPassport["N/A"];
    console.log("this is the grouped PCAPassport", groupedPCAPassport);
    const sorted = Object.entries(groupedPCAPassport).sort((a: any, b: any) => b[1].length - a[1].length);
    console.log("this is the sorted grouped PCAPassport", sorted);
    // extract only the largest groups and assign the rest to the "Other" group
    const top = sorted.slice(0, numberOfEntries);
    const rest = sorted.slice(numberOfEntries).flatMap(([, arr]: any) => arr);
    // rebuild the array with the "Other" group and the null entries at the end
    return [...top, ["Other", rest], ["N/A", missing]];
  }
  
export function createPlotData(groupedData: any[], groupingValue: string) {
    // This is the only way to ensure that the Selected group is drawn on the top
    // Z order manipulation is only supported in scatter not scattergl type
    // See https://github.com/plotly/plotly.js/pull/6918
    const entries = [...groupedData].sort(
      ([a]: any, [b]: any) => Number(a === "Selected") - Number(b === "Selected")
    )
    return entries.map(([key, value]: any) => {
      return {
        x: value.map((p: any) => p.pca.PC1),
        y: value.map((p: any) => p.pca.PC2),
        text: value.map((p: any) => p.pca.IID),
        customdata: value.map((p: any) => [
          p.accessionName,
          p[groupingValue] ?? "N/A",
        ]),
        name: (key.length < 20 ? key : key.substring(0, 17) + "...") + " (" + value.length + ")",
        opacity: key === "Selected" ? 1 : 0.7,
        mode: "markers",
        type: "scattergl",
        hovertemplate: 
        "<u><b>%{text}</b></u><br>" +
        "<b>Accession Name:</b> %{customdata[0]}<br>" + 
        "<b>PC1:</b> %{x:.2f}<br>" + 
        "<b>PC2:</b> %{y:.2f}<br>" + 
        "<b>" + groupingValue + ":</b> %{customdata[1]}<br>" + // need to refactor this to reference the name, rather than what is used in the API call
        "<extra></extra>",
      }
    })
}

export function replaceNullsWithMissing(value: any): any {
  if (value === null) return 'N/A';

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