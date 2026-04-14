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
import { fetchPCAPassportData } from '@/lib/fetchPCAPassportData';
import type { PCAPassportData } from '@/config/table-and-filter-config';

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
  /** The full loaded dataset for the selected crop. Empty array while loading. */
  rawData: PCAPassportData[];
  /** True while the fetch request is in-flight. Use this to show spinners/skeletons. */
  isLoading: boolean;
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
 *  1. Owning the `file` query-param state via nuqs.
 *  2. Fetching (and re-fetching when `file` changes) via `fetchPCAPassportData`.
 *  3. Exposing `{ file, setFile, rawData, isLoading }` to any descendant that
 *     calls `usePcaData()`.
 */
export function PcaDataProvider({ children }: { children: React.ReactNode }) {
  // Keep the selected crop in the URL (?file=Wheat) so it survives page refresh
  // and can be bookmarked. nuqs keeps this in sync with React state for us.
  const [file, setQueryFile] = useQueryState('file', parseAsString.withDefault('Wheat'));

  // Wrap the nuqs setter so callers only need to pass a string — the underlying
  // nuqs setter also accepts null (to clear), but we hide that complexity here.
  const setFile = (f: string) => setQueryFile(f);

  const [rawData, setRawData] = useState<PCAPassportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Re-run whenever `file` changes (including on first mount).
  // The `isCancelled` flag prevents a stale fetch from overwriting state if
  // the user switches crops before the previous request has finished.
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);

      try {
        const data = await fetchPCAPassportData(file);
        if (!isCancelled) {
          setRawData(data);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    // Cleanup: if the component re-renders (e.g. file changes) before the
    // previous fetch resolves, mark the old request as cancelled.
    return () => {
      isCancelled = true;
    };
  }, [file]);

  return (
    <PcaDataContext.Provider value={{ file, setFile, rawData, isLoading }}>
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
 * const { file, setFile, rawData, isLoading } = usePcaData();
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
