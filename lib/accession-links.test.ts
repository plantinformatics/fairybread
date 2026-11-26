import { describe, expect, test } from "bun:test"
import { doiUrl, genesysAccessionUrl } from "@/lib/accession-links"

describe("accession links", () => {
  test("genesysAccessionUrl links to the accession's Genesys page by DOI", () => {
    expect(genesysAccessionUrl("10.18730/AB12C")).toBe("https://www.genesys-pgr.org/10.18730/AB12C")
  })

  test("doiUrl resolves the DOI", () => {
    expect(doiUrl("10.18730/AB12C")).toBe("https://doi.org/10.18730/AB12C")
  })
})
