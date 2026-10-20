import { afterEach, describe, expect, mock, test } from 'bun:test';
import { fetchPassportChunk } from './fetchPCAPassportData';

const realFetch = globalThis.fetch;

/** Stubs fetch so each Genolink page number returns the given response body. */
function stubGenolinkPages(pages: Record<number, unknown>) {
  const fetchMock = mock<(url: string | URL | Request, init?: RequestInit) => Promise<Response>>(async (url) => {
    const pageNum = Number(new URL(String(url)).searchParams.get('p'));
    return new Response(JSON.stringify(pages[pageNum]), { status: 200 });
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('fetchPassportChunk', () => {
  test('returns the first page when it covers the whole chunk', async () => {
    const fetchMock = stubGenolinkPages({
      0: { content: [{ genotypeID: 'a' }, { genotypeID: 'b' }], last: true, totalPages: 1 },
    });

    const rows = await fetchPassportChunk(['a', 'b'], 'genotypeID', 3000);

    expect(rows.map((r) => r.genotypeID)).toEqual(['a', 'b']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('fetches the remaining pages when a chunk spans several pages', async () => {
    const fetchMock = stubGenolinkPages({
      0: { content: [{ genotypeID: 'a' }], last: false, totalPages: 3 },
      1: { content: [{ genotypeID: 'b' }], last: false, totalPages: 3 },
      2: { content: [{ genotypeID: 'c' }], last: true, totalPages: 3 },
    });

    const rows = await fetchPassportChunk(['a', 'b', 'c'], 'genotypeID', 1);

    expect(rows.map((r) => r.genotypeID)).toEqual(['a', 'b', 'c']);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test('sends only the chunk IDs in the request body', async () => {
    const fetchMock = stubGenolinkPages({ 0: { content: [], last: true, totalPages: 1 } });

    await fetchPassportChunk(['x', 'y'], 'genotypeID', 3000);

    const init = fetchMock.mock.calls[0][1];
    expect(JSON.parse(String(init?.body))).toEqual({ genotypeIds: ['x', 'y'] });
  });

  test('returns an empty array when Genolink returns no content', async () => {
    stubGenolinkPages({ 0: { last: true, totalPages: 0 } });

    expect(await fetchPassportChunk(['z'], 'genotypeID', 3000)).toEqual([]);
  });
});
