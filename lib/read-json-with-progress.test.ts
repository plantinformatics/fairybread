import { describe, expect, test } from "bun:test"
import { BODY_BYTES_HEADER, readJsonWithProgress } from "@/lib/read-json-with-progress"

const chunkedResponse = (json: string, headers: HeadersInit) => {
  const bytes = new TextEncoder().encode(json)
  const mid = Math.floor(bytes.length / 2)
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes.slice(0, mid))
      controller.enqueue(bytes.slice(mid))
      controller.close()
    },
  })
  return new Response(body, { headers })
}

describe("readJsonWithProgress", () => {
  test("parses the body and reports progress per chunk up to 1", async () => {
    const json = JSON.stringify({ data: [1, 2, 3], label: "ünïcode" })
    const size = new TextEncoder().encode(json).byteLength
    const progress: number[] = []

    const result = await readJsonWithProgress(
      chunkedResponse(json, { [BODY_BYTES_HEADER]: String(size) }),
      (f) => progress.push(f)
    )

    expect(result).toEqual(JSON.parse(json))
    expect(progress).toHaveLength(2)
    expect(progress[0]).toBeLessThan(1)
    expect(progress[1]).toBe(1)
  })

  test("parses without progress when the size header is missing", async () => {
    const progress: number[] = []
    const result = await readJsonWithProgress(chunkedResponse('{"ok":true}', {}), (f) =>
      progress.push(f)
    )
    expect(result).toEqual({ ok: true })
    expect(progress).toEqual([])
  })
})
