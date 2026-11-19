import { expect, test } from "bun:test"
import { partitionGenolinkIds } from "@/lib/genolink-ids"

test("partitionGenolinkIds keeps AGG genotype IDs and splits out everything else", () => {
  expect(partitionGenolinkIds([
    "AGG409530BARL1-B00001-1-02",
    "Fathom-B00046-11-92",
    "AGG1040509BARL2-B00046-6-05",
    "Furat-3-B00046-11-94",
  ])).toEqual({
    queryable: ["AGG409530BARL1-B00001-1-02", "AGG1040509BARL2-B00046-6-05"],
    unqueryable: ["Fathom-B00046-11-92", "Furat-3-B00046-11-94"],
  })
})
