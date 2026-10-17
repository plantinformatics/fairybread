import { describe, expect, test } from "bun:test"
import type { Filter } from "@/components/reui/filters"
import { applyFilters } from "@/lib/filter-engine"

const rows = [
  { id: "a", name: "Alpha", year: 1990, country: "AUS" },
  { id: "b", name: "Beta", year: 2005, country: "N/A" },
  { id: "c", name: "Gamma", year: 2020, country: "" },
]

const filter = (operator: string, values: unknown[], field = "name"): Filter => ({
  id: operator,
  field,
  operator,
  values,
})

const ids = (filters: Filter[]) => applyFilters(rows, filters).map((r) => r.id)

describe("applyFilters", () => {
  test("ignores filters with no values", () => {
    expect(ids([filter("is_any_of", [])])).toEqual(["a", "b", "c"])
  })

  test("string operators are case insensitive", () => {
    expect(ids([filter("contains", ["AMM"])])).toEqual(["c"])
    expect(ids([filter("starts_with", ["be"])])).toEqual(["b"])
  })

  test("numeric range is inclusive", () => {
    expect(ids([filter("between", [1990, 2005], "year")])).toEqual(["a", "b"])
  })

  test("empty only matches blank values, not the N/A placeholder", () => {
    expect(ids([filter("empty", [], "country")])).toEqual(["c"])
  })

  test("multiple filters combine with AND", () => {
    expect(
      ids([filter("greater_than", [1995], "year"), filter("is_not", ["Beta"])])
    ).toEqual(["c"])
  })
})
