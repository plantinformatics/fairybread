import { describe, expect, test } from "bun:test"
import type { PCAPassportData } from "@/config/table-and-filter-config"
import { matchTerms, parseInput } from "@/lib/customListParseMatch"

describe("parseInput", () => {
  test("handles newline, comma and tab separated input", () => {
    expect(parseInput("a\nb\n\n c ")).toEqual(["a", "b", "c"])
    expect(parseInput("a, b\nc")).toEqual(["a", "b", "c"])
    expect(parseInput("a\tb\nc")).toEqual(["a", "b", "c"])
  })

  test("drops empty fields", () => {
    expect(parseInput("a,,b,")).toEqual(["a", "b"])
  })
})

describe("matchTerms", () => {
  const data = [{ genotypeID: "G1" }, { genotypeID: "G2" }] as PCAPassportData[]

  test("splits terms into matched rows and unmatched terms by genotypeID", () => {
    const { matched, unmatched } = matchTerms(["G2", "missing", "G1"], data)
    expect(matched.map((r) => r.genotypeID)).toEqual(["G2", "G1"])
    expect(unmatched).toEqual(["missing"])
  })
})
