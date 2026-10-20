/**
 * Progress reporting for the PCA passport data load.
 *
 * `/api/pca-passport-data` streams newline-delimited JSON (NDJSON): zero or more
 * `progress` events while the server works, then a single `result` or `error`.
 * The client turns each progress event into the text shown on the plot spinner.
 */

import type { PCAPassportData } from '@/config/table-and-filter-config';

export type LoadProgress =
  | { stage: 'pca-file' }
  | { stage: 'passport'; pagesDone: number; totalPages: number; received: number; totalSamples: number }
  | { stage: 'merging'; totalSamples: number }
  | { stage: 'downloading'; receivedBytes: number; totalBytes: number };

export type PcaDataStreamEvent =
  | { type: 'progress'; progress: LoadProgress }
  | { type: 'result'; data: PCAPassportData[]; pve: number[] | null }
  | { type: 'error'; error: string };

export const LOAD_STAGE_COUNT = 4;

export type LoadProgressDescription = {
  step: number;
  title: string;
  detail?: string;
  /** 0–1 completion of the current step, when it can be measured. */
  fraction?: number;
};

const formatCount = (n: number) => n.toLocaleString('en-US');
const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

export function describeLoadProgress(progress: LoadProgress): LoadProgressDescription {
  switch (progress.stage) {
    case 'pca-file':
      return { step: 1, title: 'Fetching PCA file' };
    case 'passport':
      return {
        step: 2,
        title: `Fetching passport data from Genolink (${progress.pagesDone} of ${progress.totalPages} pages received)`,
        detail: `${formatCount(progress.received)} of ${formatCount(progress.totalSamples)} accessions received. Uncached requests can take a few minutes.`,
        fraction: progress.totalPages > 0 ? progress.pagesDone / progress.totalPages : undefined,
      };
    case 'merging':
      return { step: 3, title: `Merging passport and PCA data for ${formatCount(progress.totalSamples)} accessions` };
    case 'downloading':
      return {
        step: 4,
        title: 'Downloading data',
        detail: `${formatMB(progress.receivedBytes)} of ${formatMB(progress.totalBytes)} MB`,
        fraction: progress.totalBytes > 0 ? Math.min(progress.receivedBytes / progress.totalBytes, 1) : undefined,
      };
  }
}

/** Splits buffered NDJSON text into complete lines plus the trailing partial line. */
export function splitNdjsonLines(buffer: string): { lines: string[]; rest: string } {
  const parts = buffer.split('\n');
  const rest = parts.pop() ?? '';
  return { lines: parts.filter((line) => line.trim().length > 0), rest };
}
