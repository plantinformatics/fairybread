/**
 * Response header carrying the uncompressed body size in bytes. Set by the API so
 * clients can show download progress (Content-Length is the compressed size, if present).
 */
export const BODY_BYTES_HEADER = "X-Body-Bytes"

/**
 * Reads a JSON response body, calling `onProgress` with the fraction received (0 to 1).
 * fetch decompresses transparently, so counted bytes line up with BODY_BYTES_HEADER.
 * Falls back to a plain `res.json()` when the header or body stream is missing.
 */
export async function readJsonWithProgress<T>(
  res: Response,
  onProgress: (fraction: number) => void
): Promise<T> {
  const total = Number(res.headers.get(BODY_BYTES_HEADER))
  if (!res.body || !total) return (await res.json()) as T

  const reader = res.body.getReader()
  const chunks: Uint8Array<ArrayBuffer>[] = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.byteLength
    onProgress(Math.min(received / total, 1))
  }
  return JSON.parse(await new Blob(chunks).text()) as T
}
