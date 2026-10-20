'use client';

/**
 * PCA Data Context
 *
 * This module provides a React context that centralises the shared data-fetching
 * state for the PCA passport dataset. Any page or component that needs the
 * loaded data or loading state can call `usePcaData()` instead of managing its
 * own fetch lifecycle.
 *
 * Key concepts used here:
 *  - React Context  : a way to share values across the component tree without
 *                     passing props manually at every level.
 *  - useContext     : the hook a consumer uses to read from a context.
 *  - nuqs           : library that syncs React state with URL query params so
 *                     the selected file/crop persists on page refresh and is
 *                     shareable via URL.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import posthog from 'posthog-js';
import type { PCAPassportData } from '@/config/table-and-filter-config';
import { ALL_ACCESSIONS_SUBSET } from '@/config/pca-location-config';
import { splitNdjsonLines, type LoadProgress, type PcaDataStreamEvent } from '@/lib/load-progress';

// ---------------------------------------------------------------------------
// Shape of the value stored in the context
// ---------------------------------------------------------------------------

/**
 * Everything a consumer can read from (or write to) the shared PCA data store.
 */
interface PcaDataContextValue {
  /** The currently selected crop/file key (e.g. "Wheat"). Synced to ?file= in the URL. */
  file: string;
  /** Update the selected crop. The URL query param is updated automatically. */
  setFile: (f: string) => void;
  /** The currently selected subset key (e.g. "All Accessions"). Synced to ?subset= in the URL. */
  subset: string;
  /** Update the selected subset. The URL query param is updated automatically. */
  setSubset: (s: string) => void;
  /** The full loaded dataset for the selected crop/subset. Empty array while loading. */
  rawData: PCAPassportData[];
  /** Proportion of variance explained per PC (index 0 = PC1), or null if unavailable. */
  pve: number[] | null;
  /** True while the fetch request is in-flight. Use this to show spinners/skeletons. */
  isLoading: boolean;
  /** Latest server-reported loading step, or null before the first one arrives. */
  loadProgress: LoadProgress | null;
}

// ---------------------------------------------------------------------------
// Create the context
// ---------------------------------------------------------------------------

/**
 * The context object itself. `undefined` as the default value means that if
 * `usePcaData()` is called outside of a `<PcaDataProvider>` it will throw a
 * helpful error (see below) rather than silently returning stale/empty state.
 */
const PcaDataContext = createContext<PcaDataContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

/**
 * Wrap your page tree with this component (e.g. in the root layout) to make
 * PCA data available to all children.
 *
 * It is responsible for:
 *  1. Owning the `file` and `subset` query-param state via nuqs.
 *  2. Fetching (and re-fetching when `file` or `subset` changes) via
 *     `fetchPCAPassportData`.
 *  3. Exposing `{ file, setFile, subset, setSubset, rawData, pve, isLoading, loadProgress }` to
 *     any descendant that calls `usePcaData()`.
 */
export function PcaDataProvider({ children }: { children: React.ReactNode }) {
  // Keep the selected crop in the URL (?file=Wheat) so it survives page refresh
  // and can be bookmarked. nuqs keeps this in sync with React state for us.
  // `clearOnDefault: false` keeps `file` in the URL even when it's the default
  // ("Wheat"), so shared/bookmarked links always show which crop is selected.
  const [file, setQueryFile] = useQueryState(
    'file',
    parseAsString.withDefault('Wheat').withOptions({ clearOnDefault: false }),
  );
  // Keep the selected subset in the URL (?subset=All%20Accessions) alongside `file`.
  const [subset, setQuerySubset] = useQueryState('subset', parseAsString.withDefault(ALL_ACCESSIONS_SUBSET));
  // Dev/perf testing: ?nocache=1 on the page is forwarded to the API so every
  // server cache layer is bypassed and load times can be measured cold.
  const [noCache] = useQueryState('nocache', parseAsString);

  // Wrap the nuqs setters so callers only need to pass a string — the underlying
  // nuqs setter also accepts null (to clear), but we hide that complexity here.
  // Subsets are crop-specific, so switching crop always resets the subset
  // selection back to "All Accessions" — a subset name from one crop is meaningless
  // (or could silently mismatch) for another.
  const setFile = (f: string) => {
    posthog.capture('crop_selected', { crop: f, previous_crop: file });
    setQueryFile(f);
    setQuerySubset(ALL_ACCESSIONS_SUBSET);
  };
  const setSubset = (s: string) => {
    posthog.capture('subset_changed', { subset: s, crop: file, previous_subset: subset });
    setQuerySubset(s);
  };

  const [rawData, setRawData] = useState<PCAPassportData[]>([]);
  const [pve, setPve] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<LoadProgress | null>(null);

  // Re-run whenever `file` or `subset` changes (including on first mount).
  // The AbortController prevents a stale fetch from overwriting state if
  // the user switches crops/subsets before the previous request has finished.
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setIsLoading(true);
      setLoadProgress(null);

      try {
        const params = new URLSearchParams({ file, subset });
        if (noCache) params.set('nocache', noCache);
        const res = await fetch(`/api/pca-passport-data?${params.toString()}`, {
          signal: controller.signal,
          cache: noCache ? 'no-store' : 'default',
        });
        if (!res.ok || !res.body) {
          const body = await res.text();
          throw new Error(`Failed to fetch PCA passport data (${res.status}): ${body}`);
        }

        // The response is NDJSON: progress events, then a single (large) result line.
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let pending: string[] = [];
        let pendingLength = 0;
        let download: { totalBytes: number } | null = null;
        let result: Extract<PcaDataStreamEvent, { type: 'result' }> | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Only re-split when the chunk ends a line, so the multi-MB result
          // line isn't rescanned on every chunk.
          if (!value.includes('\n')) {
            pending.push(value);
            pendingLength += value.length;
          } else {
            const { lines, rest } = splitNdjsonLines(pending.join('') + value);
            pending = [rest];
            pendingLength = rest.length;
            for (const line of lines) {
              const event = JSON.parse(line) as PcaDataStreamEvent;
              if (event.type === 'error') throw new Error(event.error);
              if (event.type === 'result') result = event;
              else {
                if (event.progress.stage === 'downloading') download = { totalBytes: event.progress.totalBytes };
                setLoadProgress(event.progress);
              }
            }
          }
          if (download && !result) {
            setLoadProgress({ stage: 'downloading', receivedBytes: pendingLength, totalBytes: download.totalBytes });
          }
        }

        if (!result) throw new Error('PCA passport data stream ended without a result');
        if (!controller.signal.aborted) {
          setRawData(result.data);
          setPve(result.pve);
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        console.error('Error loading PCA passport data:', error);
        if (!controller.signal.aborted) {
          setRawData([]);
          setPve(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [file, subset, noCache]);

  return (
    <PcaDataContext.Provider value={{ file, setFile, subset, setSubset, rawData, pve, isLoading, loadProgress }}>
      {children}
    </PcaDataContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * Call this hook in any client component to access the shared PCA data.
 *
 * @example
 * const { file, setFile, subset, setSubset, rawData, pve, isLoading, loadProgress } = usePcaData();
 *
 * @throws If called outside of a `<PcaDataProvider>` tree.
 */
export function usePcaData(): PcaDataContextValue {
  const ctx = useContext(PcaDataContext);

  if (ctx === undefined) {
    throw new Error('usePcaData must be used within a <PcaDataProvider>');
  }

  return ctx;
}
