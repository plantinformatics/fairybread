import { expect, test } from "bun:test"
import { toCSV } from "@/lib/csv-export"

test("toCSV escapes quotes, commas and newlines and blanks nullish values", () => {
  expect(toCSV(["name", "note"], [["a,b", 'say "hi"'], ["line\nbreak", null]])).toBe(
    'name,note\r\n"a,b","say ""hi"""\r\n"line\nbreak",'
  )
})
