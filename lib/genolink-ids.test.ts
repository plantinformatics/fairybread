import { expect, test } from "bun:test"
import { accessionOfGenotypeId, mergePassportByAccession, partitionGenolinkIds } from "@/lib/genolink-ids"

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

test("accessionOfGenotypeId drops the genotyping-run suffix", () => {
  expect(accessionOfGenotypeId("AGG413162BARL1-B00030-4-40")).toBe("AGG413162BARL")
  expect(accessionOfGenotypeId("AGG413162BARL1-B00004-9-80")).toBe("AGG413162BARL")
  expect(accessionOfGenotypeId("AGG420827BARL2-B00046-9-69")).toBe("AGG420827BARL")
  expect(accessionOfGenotypeId("AGG1WHEA1-B00014-1-89")).toBe("AGG1WHEA")
  expect(accessionOfGenotypeId("Fathom-B00046-11-92")).toBeUndefined()
})

test("mergePassportByAccession gives every genotyping run of an accession its passport data and lists its other runs", () => {
  // Genolink returned one row for AGG413162 (echoing only one of its two genotype IDs) and nothing for AGG999999.
  const passport = [
    { genotypeID: "AGG413162BARL1-B00004-9-80", accessionName: "Trixi" },
    { genotypeID: "AGG420827BARL1-B00007-4-80", accessionName: "IG 24419" },
  ]
  const pca = [
    { IID: "AGG413162BARL1-B00004-9-80", PC1: 1 },
    { IID: "AGG413162BARL1-B00030-4-40", PC1: 2 },
    { IID: "AGG420827BARL1-B00007-4-80", PC1: 3 },
    { IID: "AGG999999BARL1-B00001-1-01", PC1: 4 },
    { IID: "Fathom-B00046-11-92", PC1: 5 },
  ]

  expect(mergePassportByAccession(passport, pca)).toEqual([
    { genotypeID: "AGG413162BARL1-B00004-9-80", accessionName: "Trixi", pca: pca[0], otherGenotypeIDs: ["AGG413162BARL1-B00030-4-40"] },
    { genotypeID: "AGG413162BARL1-B00030-4-40", accessionName: "Trixi", pca: pca[1], otherGenotypeIDs: ["AGG413162BARL1-B00004-9-80"] },
    { genotypeID: "AGG420827BARL1-B00007-4-80", accessionName: "IG 24419", pca: pca[2] },
  ])
})
