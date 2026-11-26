'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQueryState } from 'nuqs';
import posthog from 'posthog-js';
import type { PCAPassportData } from '@/config/table-and-filter-config';
import { ALL_ACCESSIONS_SUBSET } from '@/config/pca-location-config';
import { searchParams } from '@/config/search-params';
import { splitNdjsonLines, type LoadProgress, type PcaDataStreamEvent } from '@/lib/load-progress';

interface PcaDataContextValue {
  file: string;
  /** Also resets subset to "All Accessions". */
  setFile: (f: string) => void;
  subset: string;
  setSubset: (s: string) => void;
  /** Empty array while loading. */
  rawData: PCAPassportData[];
  /** Proportion of variance explained per PC (index 0 = PC1). */
  pve: number[] | null;
  isLoading: boolean;
  loadProgress: LoadProgress | null;
}

const PcaDataContext = createContext<PcaDataContextValue | undefined>(undefined);

export function PcaDataProvider({ children }: { children: React.ReactNode }) {
  const [file, setQueryFile] = useQueryState('file', searchParams.file);
  const [subset, setQuerySubset] = useQueryState('subset', searchParams.subset);
  const [noCache] = useQueryState('nocache', searchParams.nocache);

  // Subset names are crop-specific, so switching crop resets the subset.
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

  // Abort so a stale fetch can't overwrite state after the user switches crop/subset.
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

export function usePcaData(): PcaDataContextValue {
  const ctx = useContext(PcaDataContext);

  if (ctx === undefined) {
    throw new Error('usePcaData must be used within a <PcaDataProvider>');
  }

  return ctx;
}
