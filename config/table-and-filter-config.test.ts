import { describe, expect, test } from "bun:test"
import { columns, groupByLabel, passportDataSelectFields } from "@/config/table-and-filter-config"
import { TEXT_FILTER_GROUP_BY } from "@/lib/dataProcessing"

describe("columns", () => {
  // TanStack reads a dotted accessorKey as a nested path, but Genolink rows are flat
  // (`row["countryOfOrigin.name"]`), so those columns must read the value with accessorFn.
  // The dotted accessorKey is still needed: it is the field name sent to Genolink as `select`.
  test.each(columns.filter((column) => column.accessorKey?.includes(".")).map((column) => [column.accessorKey, column]))(
    "%s defines accessorFn",
    (_, column) => {
      expect(column).toHaveProperty("accessorFn")
    },
  )

  test("every accessorKey is sent to Genolink as a select field", () => {
    expect(passportDataSelectFields).toEqual(columns.flatMap((column) => column.accessorKey ?? []))
    expect(passportDataSelectFields).toContain("countryOfOrigin.name")
  })
})

describe("groupByLabel", () => {
  test("uses the column's name for a column group-by", () => {
    expect(groupByLabel("subRegion")).toBe("Sub-Region")
    expect(groupByLabel("countryOfOrigin.name")).toBe("Country of Origin")
  })

  test("names the text filter group-by", () => {
    expect(groupByLabel(TEXT_FILTER_GROUP_BY)).toBe("Text filter")
  })

  test("falls back to the raw value for an unknown group-by", () => {
    expect(groupByLabel("unknown")).toBe("unknown")
  })
})
