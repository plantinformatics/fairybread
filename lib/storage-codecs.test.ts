import { describe, expect, test } from "bun:test"
import { booleanCodec, jsonCodec, oneOfCodec, positiveIntegerCodec, stringCodec } from "@/lib/storage-codecs"
import { isStringArray } from "@/lib/type-guards"

describe("stringCodec", () => {
  test("stores strings unchanged, the empty string included", () => {
    expect(stringCodec.parse("a\nb")).toBe("a\nb")
    expect(stringCodec.parse("")).toBe("")
    expect(stringCodec.serialize("a\nb")).toBe("a\nb")
  })
})

describe("oneOfCodec", () => {
  const codec = oneOfCodec(["dark", "light"])

  test("accepts only the listed values", () => {
    expect(codec.parse("dark")).toBe("dark")
    expect(codec.parse("light")).toBe("light")
    expect(codec.parse("Dark")).toBeUndefined()
    expect(codec.parse("")).toBeUndefined()
  })

  test("accepts any iterable, such as a Map's keys", () => {
    const palettes = new Map([["Dark", 1], ["Pastel", 2]])
    expect(oneOfCodec(palettes.keys()).parse("Pastel")).toBe("Pastel")
    expect(oneOfCodec(palettes.keys()).parse("Neon")).toBeUndefined()
  })

  test("serializes the value itself", () => {
    expect(codec.serialize("dark")).toBe("dark")
  })
})

describe("booleanCodec", () => {
  test("round-trips the existing 'true' / 'false' format", () => {
    expect(booleanCodec.serialize(true)).toBe("true")
    expect(booleanCodec.serialize(false)).toBe("false")
    expect(booleanCodec.parse("true")).toBe(true)
    expect(booleanCodec.parse("false")).toBe(false)
  })

  test("rejects anything else", () => {
    expect(booleanCodec.parse("1")).toBeUndefined()
    expect(booleanCodec.parse("TRUE")).toBeUndefined()
    expect(booleanCodec.parse("")).toBeUndefined()
  })
})

describe("positiveIntegerCodec", () => {
  test("parses stored whole numbers", () => {
    expect(positiveIntegerCodec.parse("480")).toBe(480)
  })

  test("rejects zero, negative, empty and non-numeric values", () => {
    expect(positiveIntegerCodec.parse("0")).toBeUndefined()
    expect(positiveIntegerCodec.parse("-5")).toBeUndefined()
    expect(positiveIntegerCodec.parse("")).toBeUndefined()
    expect(positiveIntegerCodec.parse("tall")).toBeUndefined()
    expect(positiveIntegerCodec.parse("Infinity")).toBeUndefined()
  })

  test("rounds to a whole number both ways", () => {
    expect(positiveIntegerCodec.serialize(480.6)).toBe("481")
    expect(positiveIntegerCodec.parse("480.4")).toBe(480)
  })
})

describe("jsonCodec", () => {
  const codec = jsonCodec((json) => (isStringArray(json) ? json : undefined))

  test("round-trips through JSON", () => {
    expect(codec.serialize(["a", "b"])).toBe('["a","b"]')
    expect(codec.parse('["a","b"]')).toEqual(["a", "b"])
  })

  test("returns undefined when the JSON fails validation", () => {
    expect(codec.parse('["a",1]')).toBeUndefined()
    expect(codec.parse('{"a":1}')).toBeUndefined()
  })

  test("throws on malformed JSON, which the persisted store treats as invalid", () => {
    expect(() => codec.parse("{not json")).toThrow()
  })
})
