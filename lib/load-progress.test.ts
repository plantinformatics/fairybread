import { expect, test } from "bun:test"
import { describeLoadProgress, splitNdjsonLines } from "@/lib/load-progress"

test("splitNdjsonLines returns complete lines and keeps the partial tail", () => {
  expect(splitNdjsonLines('{"a":1}\n{"b":2}\n{"c"')).toEqual({ lines: ['{"a":1}', '{"b":2}'], rest: '{"c"' })
  expect(splitNdjsonLines('{"a":1}\n\n')).toEqual({ lines: ['{"a":1}'], rest: '' })
  expect(splitNdjsonLines('partial')).toEqual({ lines: [], rest: 'partial' })
})

test("describeLoadProgress reports Genolink page progress", () => {
  const d = describeLoadProgress({ stage: 'passport', pagesDone: 1, totalPages: 4, received: 3000, totalSamples: 11500 })
  expect(d.step).toBe(2)
  expect(d.title).toContain('1 of 4 pages received')
  expect(d.detail).toContain('3,000 of 11,500')
  expect(d.fraction).toBe(0.25)
})

test("describeLoadProgress clamps download fraction", () => {
  const d = describeLoadProgress({ stage: 'downloading', receivedBytes: 3 * 1024 * 1024, totalBytes: 2 * 1024 * 1024 })
  expect(d.fraction).toBe(1)
  expect(d.detail).toBe('3.0 of 2.0 MB')
})
