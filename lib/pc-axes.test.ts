import { describe, expect, test } from "bun:test"
import { DEFAULT_PC_AXES, isPcAxis, toPcAxes } from "@/lib/pc-axes"

describe("isPcAxis", () => {
  test("accepts PC1 to PC10 only", () => {
    expect(isPcAxis("PC1")).toBe(true)
    expect(isPcAxis("PC10")).toBe(true)
    expect(isPcAxis("PC11")).toBe(false)
    expect(isPcAxis("pc1")).toBe(false)
    expect(isPcAxis(1)).toBe(false)
    expect(isPcAxis(null)).toBe(false)
  })
})

describe("toPcAxes", () => {
  test("keeps valid axes, including a 3D z axis", () => {
    expect(toPcAxes({ x: "PC3", y: "PC4", z: "PC5" })).toEqual({ x: "PC3", y: "PC4", z: "PC5" })
    expect(toPcAxes({ x: "PC3", y: "PC4", z: null })).toEqual({ x: "PC3", y: "PC4", z: null })
  })

  test("replaces each invalid or missing field with its default", () => {
    expect(toPcAxes({ x: "PC99", y: "PC4", z: 7 })).toEqual({ x: "PC1", y: "PC4", z: null })
    expect(toPcAxes({})).toEqual(DEFAULT_PC_AXES)
  })

  test("rejects non-objects", () => {
    expect(toPcAxes(null)).toBeUndefined()
    expect(toPcAxes("PC1")).toBeUndefined()
    expect(toPcAxes(3)).toBeUndefined()
  })
})
