import { describe, expect, test } from "bun:test"
import { ALL_ACCESSIONS_SUBSET } from "@/config/pca-location-config"
import {
  CROPS,
  CUSTOM_LIST_FILTER_KEY,
  DEFAULT_CROP,
  DEFAULT_GROUP_BY,
  FILTER_KEYS,
  GROUP_BY_OPTIONS,
  loadFilters,
  loadView,
  serializeFilters,
  serializeView,
} from "@/lib/view-url"

describe("view URL schema", () => {
  test("round-trips a full view", () => {
    const url = serializeView(
      serializeFilters("/data-explorer", {
        "countryOfOrigin.name": ["Korea, Republic of", "India"],
        [CUSTOM_LIST_FILTER_KEY]: ["G1", "G2"],
      }),
      { file: "Barley", subset: "Some subset", groupBy: "region" }
    )
    const search = url.slice(url.indexOf("?"))
    const view = loadView(search)
    const filters = loadFilters(search)

    expect(view.file).toBe("Barley")
    expect(view.subset).toBe("Some subset")
    expect(view.groupBy).toBe("region")
    expect(filters["countryOfOrigin.name"]).toEqual(["Korea, Republic of", "India"])
    expect(filters[CUSTOM_LIST_FILTER_KEY]).toEqual(["G1", "G2"])
    expect(filters.region).toBeNull()
  })

  test("always keeps file in the URL, drops other defaults", () => {
    expect(
      serializeView("/data-explorer", {
        file: DEFAULT_CROP,
        subset: ALL_ACCESSIONS_SUBSET,
        groupBy: DEFAULT_GROUP_BY,
      })
    ).toBe(`/data-explorer?file=${DEFAULT_CROP}`)
  })

  test("falls back to defaults for unknown crops and groupBy values", () => {
    const view = loadView("?file=Banana&groupBy=notAColumn")
    expect(view.file).toBe(DEFAULT_CROP)
    expect(view.groupBy).toBe(DEFAULT_GROUP_BY)
  })

  test("exposes the config-derived options", () => {
    expect(CROPS).toContain(DEFAULT_CROP)
    expect(GROUP_BY_OPTIONS.map((option) => option.value)).toContain(DEFAULT_GROUP_BY)
    expect(FILTER_KEYS).toContain("genotypeID")
    expect(FILTER_KEYS).toContain(CUSTOM_LIST_FILTER_KEY)
  })
})
