import { describe, expect, test } from "bun:test"
import {
  buildGroupedEntries,
  buildRowColorMap,
  createPlotData,
  joinListFields,
  MATCH_GROUP,
  NOT_MATCH_GROUP,
  orderGroupsForPlot,
  replaceNullsWithMissing,
  TEXT_FILTER_GROUP_BY,
} from "@/lib/dataProcessing"
import { chartColourPalettes } from "@/config/chart-config"

const row = (genotypeID: string, country: string) => ({
  genotypeID,
  country,
  accessionName: `acc-${genotypeID}`,
  pca: { IID: genotypeID, PC1: 1, PC2: 2, PC3: 3 },
})

describe("replaceNullsWithMissing", () => {
  test("replaces nulls at any depth and keeps other values", () => {
    expect(replaceNullsWithMissing({ a: null, b: { c: [null, 0, ""] } })).toEqual({
      a: "N/A",
      b: { c: ["N/A", 0, ""] },
    })
  })
})

describe("joinListFields", () => {
  test("joins arrays into a sorted string, empty arrays become null, other values untouched", () => {
    expect(
      joinListFields({ "subsets.title": ["CAIGE Disease Core Set Barley", "CAIGE Barley"], empty: [], none: null, name: "x" }),
    ).toEqual({ "subsets.title": "CAIGE Barley; CAIGE Disease Core Set Barley", empty: null, none: null, name: "x" })
  })
})

describe("buildGroupedEntries", () => {
  const data = [
    row("1", "AUS"),
    row("2", "AUS"),
    row("3", "AUS"),
    row("4", "IND"),
    row("5", "IND"),
    row("6", "TUR"),
    row("7", "N/A"),
  ]

  test("keeps the largest groups in size order, then Other and N/A", () => {
    const groups = buildGroupedEntries(data, "country", [], 2)
    expect(groups.map(([key, items]) => [key, items.length])).toEqual([
      ["AUS", 3],
      ["IND", 2],
      ["Other", 1],
      ["N/A", 1],
    ])
  })

  test("textFilter groups rows by whether they were matched", () => {
    const groups = Object.fromEntries(buildGroupedEntries(data, "textFilter", ["1", "6"]))
    expect(groups.Match.map((r) => r.genotypeID)).toEqual(["1", "6"])
    expect(groups["Not Match"]).toHaveLength(5)
  })
})

describe("buildRowColorMap", () => {
  test("assigns one palette colour per group", () => {
    const colors = buildRowColorMap(
      [
        ["AUS", [row("1", "AUS"), row("2", "AUS")]],
        ["IND", [row("3", "IND")]],
      ],
      "Vibrant",
    )
    expect(colors.get("1")).toBe(colors.get("2"))
    expect(colors.get("1")).not.toBe(colors.get("3"))
  })

  test("returns an empty map for an unknown palette", () => {
    expect(buildRowColorMap([["AUS", [row("1", "AUS")]]], "nope").size).toBe(0)
  })
})

describe("orderGroupsForPlot", () => {
  test("moves the Match group last wherever it starts", () => {
    const keys = (entries: [string, unknown][]) => orderGroupsForPlot(entries).map(([key]) => key)
    expect(keys([[MATCH_GROUP, []], [NOT_MATCH_GROUP, []]])).toEqual([NOT_MATCH_GROUP, MATCH_GROUP])
    expect(keys([[NOT_MATCH_GROUP, []], [MATCH_GROUP, []]])).toEqual([NOT_MATCH_GROUP, MATCH_GROUP])
  })

  test("keeps the order of the other groups", () => {
    const entries: [string, unknown][] = [["C", []], [MATCH_GROUP, []], ["A", []], ["B", []]]
    expect(orderGroupsForPlot(entries).map(([key]) => key)).toEqual(["C", "A", "B", MATCH_GROUP])
  })

  test("does not mutate its input", () => {
    const entries: [string, unknown][] = [[MATCH_GROUP, []], [NOT_MATCH_GROUP, []]]
    orderGroupsForPlot(entries)
    expect(entries.map(([key]) => key)).toEqual([MATCH_GROUP, NOT_MATCH_GROUP])
  })
})

describe("createPlotData", () => {
  const axes = { x: "PC1", y: "PC2", z: null } as const
  const groups: [string, ReturnType<typeof row>[]][] = [["AUS", [row("1", "AUS")]]]
  const textFilterGroups = () => buildGroupedEntries([row("1", "AUS"), row("2", "IND")], TEXT_FILTER_GROUP_BY, ["1"])

  test("builds a 2D scattergl trace when no z axis is set", () => {
    const [trace] = createPlotData(groups, "country", "Country", axes)
    expect(trace).toMatchObject({ type: "scattergl", x: [1], y: [2], text: ["1"] })
    expect(trace).not.toHaveProperty("z")
  })

  test("builds a scatter3d trace when a z axis is set", () => {
    const [trace] = createPlotData(groups, "country", "Country", { x: "PC1", y: "PC2", z: "PC3" })
    expect(trace).toMatchObject({ type: "scatter3d", z: [3] })
  })

  test("draws the Match group last so it sits on top", () => {
    const grouped = textFilterGroups()
    expect(grouped[0][0]).toBe(MATCH_GROUP)
    const traces = createPlotData(grouped, TEXT_FILTER_GROUP_BY, "Text filter", axes)
    expect(traces.map((trace) => trace.text)).toEqual([["2"], ["1"]])
  })

  test("labels the group-by value in the hover with its display name", () => {
    const [trace] = createPlotData(groups, "country", "Country of Origin", axes)
    expect(trace.hovertemplate).toContain("<b>Country of Origin:</b> %{customdata[1]}")
    expect(trace.customdata[0][1]).toBe("AUS")
  })

  test("shows the match group as the hover value when grouped by text filter", () => {
    const traces = createPlotData(textFilterGroups(), TEXT_FILTER_GROUP_BY, "Text filter", axes)
    expect(traces.map((trace) => trace.customdata[0][1])).toEqual([NOT_MATCH_GROUP, MATCH_GROUP])
  })
})

describe("buildRowColorMap matches the plot", () => {
  const palette = "Vibrant"
  const colors = chartColourPalettes.get(palette)!

  // Plotly colours trace i with colorway[i], so each row's table colour must be its trace's colour.
  const expectColoursMatchTraces = (groups: [string, ReturnType<typeof row>[]][], groupBy: string) => {
    const colorMap = buildRowColorMap(groups, palette)
    createPlotData(groups, groupBy, groupBy, { x: "PC1", y: "PC2", z: null }).forEach((trace, index) => {
      for (const id of trace.text) expect(colorMap.get(id)).toBe(colors[index % colors.length])
    })
  }

  test("for a column group-by", () => {
    expectColoursMatchTraces(buildGroupedEntries([row("1", "AUS"), row("2", "IND"), row("3", "AUS")], "country"), "country")
  })

  test("for the text filter group-by when the first row is a match", () => {
    expectColoursMatchTraces(buildGroupedEntries([row("1", "AUS"), row("2", "IND")], TEXT_FILTER_GROUP_BY, ["1"]), TEXT_FILTER_GROUP_BY)
  })
})

