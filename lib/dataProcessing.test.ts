import { describe, expect, test } from "bun:test"
import {
  buildGroupedEntries,
  buildRowColorMap,
  createPlotData,
  replaceNullsWithMissing,
} from "@/lib/dataProcessing"

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

describe("createPlotData", () => {
  const groups = [["AUS", [row("1", "AUS")]]]

  test("builds a 2D scattergl trace when no z axis is set", () => {
    const [trace] = createPlotData(groups, "country", { x: "PC1", y: "PC2", z: null })
    expect(trace).toMatchObject({ type: "scattergl", x: [1], y: [2], text: ["1"] })
    expect(trace).not.toHaveProperty("z")
  })

  test("builds a scatter3d trace when a z axis is set", () => {
    const [trace] = createPlotData(groups, "country", { x: "PC1", y: "PC2", z: "PC3" })
    expect(trace).toMatchObject({ type: "scatter3d", z: [3] })
  })
})
