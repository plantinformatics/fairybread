import { describe, expect, test } from "bun:test"
import { isStringArray } from "@/lib/type-guards"

describe("isStringArray", () => {
  test("accepts arrays of strings, including empty arrays", () => {
    expect(isStringArray(["a", "b"])).toBe(true)
    expect(isStringArray([])).toBe(true)
  })

  test("rejects non-arrays and arrays with any non-string item", () => {
    expect(isStringArray("a")).toBe(false)
    expect(isStringArray(null)).toBe(false)
    expect(isStringArray({ 0: "a", length: 1 })).toBe(false)
    expect(isStringArray(["a", 1])).toBe(false)
    expect(isStringArray(["a", null])).toBe(false)
  })
})
