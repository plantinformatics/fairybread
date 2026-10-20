import { unstable_cache } from 'next/cache';
import { ALL_ACCESSIONS_SUBSET, getDatasetInfo } from '@/config/pca-location-config';
import { passportDataSelectFields } from '@/config/table-and-filter-config';
import chalk from 'chalk';
import { parse } from "csv-parse/sync";

import { replaceNullsWithMissing } from '@/lib/dataProcessing'

const GENOLINK_QUERY_URL = 'https://genolink.plantinformatics.io/api/genesys/accession/query';

/** Fetch options for the upstream file fetches. `noCache` bypasses the Next fetch cache entirely. */
function fileFetchOptions(noCache: boolean): RequestInit {
  return noCache ? { cache: 'no-store' } : { next: { revalidate: 86400 } }; // one day in seconds, don't forget to align with cacheTimeoutSeconds
}

async function fetchAndParsePCAFile(PCAFileURL: string, noCache: boolean): Promise<any> {
  const response = await fetch(PCAFileURL, fileFetchOptions(noCache));
  if (!response.ok) {
    const errorText = await response.text();
    console.log(chalk.red(`Error response: ${errorText.substring(0, 200)}`));
  }
  const tsv = await response.text();
  const data = parse(
    tsv,
    {
      columns: true,
      delimiter: '\t',
      skip_empty_lines: true
    }
  )
  return data
}

/**
 * Fetches a one-value-per-line PVE file (proportions for PC1, PC2, …).
 * Returns null on any failure so PCA loading is never blocked by a missing PVE file.
 */
async function fetchAndParsePveFile(pveFileUrl: string, noCache: boolean): Promise<number[] | null> {
  try {
    const response = await fetch(pveFileUrl, fileFetchOptions(noCache));
    if (!response.ok) {
      console.log(chalk.yellow(`⚠ PVE file fetch failed (${response.status}): ${pveFileUrl}`));
      return null;
    }
    const text = await response.text();
    const values = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => Number(line));

    if (values.length === 0 || values.some((v) => !Number.isFinite(v))) {
      console.log(chalk.yellow(`⚠ PVE file contained no valid numbers: ${pveFileUrl}`));
      return null;
    }
    return values;
  } catch (error) {
    console.log(chalk.yellow(`⚠ Failed to load PVE file: ${pveFileUrl}`), error);
    return null;
  }
}

type GenolinkPage = { content?: Record<string, unknown>[]; last?: boolean; totalPages?: number };

/** Fetches one page of passport data from Genolink for the given genotype IDs. */
async function fetchPassportPage(pageNum: number, ids: string[], selectFields: string, pageSize: number): Promise<GenolinkPage> {
  const queryParams = new URLSearchParams({
    select: selectFields,
    l: String(pageSize),
    p: String(pageNum),
  });
  const response = await fetch(`${GENOLINK_QUERY_URL}?${queryParams.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ genotypeIds: ids }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log(chalk.red(`Error fetching page ${pageNum}: HTTP ${response.status}`));
    console.log(chalk.red(`Error response: ${errorText.substring(0, 200)}`));
    throw new Error(`Failed to fetch page ${pageNum}: HTTP ${response.status} - ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetches all passport rows for one chunk of genotype IDs. Genolink re-resolves
 * every ID in the body on each request, so sending only this chunk's IDs (rather
 * than the full list plus a page number) roughly halves request time.
 * Normally one page covers the chunk; if Genolink returns more rows than fit in
 * a page (e.g. an ID maps to several accessions), the remaining pages are fetched too.
 */
export async function fetchPassportChunk(ids: string[], selectFields: string, pageSize: number): Promise<Record<string, unknown>[]> {
  const firstPage = await fetchPassportPage(0, ids, selectFields, pageSize);
  if (firstPage.last !== false || !firstPage.totalPages || firstPage.totalPages <= 1) {
    return firstPage.content || [];
  }

  console.log(chalk.yellow(`⚠ Chunk of ${ids.length} IDs spans ${firstPage.totalPages} pages, fetching the rest`));
  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, i) => fetchPassportPage(i + 1, ids, selectFields, pageSize))
  );
  return [firstPage, ...remainingPages].flatMap((page) => page.content || []);
}

export type PCAPassportFetchResult = {
  data: any[];
  /** Proportion of variance explained per PC (index 0 = PC1), or null if unavailable. */
  pve: number[] | null;
};

export type FetchPCAPassportOptions = {
  /** Skip every cache layer (PCA/PVE file fetch cache and per-chunk unstable_cache). For performance testing. */
  noCache?: boolean;
};

export async function fetchPCAPassportData(
  PCAFile: string,
  subset: string = ALL_ACCESSIONS_SUBSET,
  { noCache = false }: FetchPCAPassportOptions = {},
): Promise<PCAPassportFetchResult> {
  try {
    const debug = chalk.blue;
    const overallStart = performance.now();

    // Fetch PCA data
    console.log(debug('Fetching PCA passport data for:'), PCAFile, subset, noCache ? chalk.magenta('(cache disabled)') : '');
    
    const fileInfo = getDatasetInfo(PCAFile, subset);
    if (!fileInfo) {
      throw new Error('Invalid PCA file');
    }

    const pcaStart = performance.now();
    const [PCAData, pve] = await Promise.all([
      fetchAndParsePCAFile(fileInfo.fileUrl, noCache),
      fileInfo.pveFileUrl ? fetchAndParsePveFile(fileInfo.pveFileUrl, noCache) : Promise.resolve(null),
    ]);
    console.log(debug(`PCA file loaded in ${((performance.now() - pcaStart) / 1000).toFixed(2)}s`));

    // Get genotype IDs
    const genotypeIds = PCAData.map((p: any) => p.IID);
    
    const genotypeIdsPerRequest = 3000; // keep each response less than 2MB to enable nextJS caching
    const cacheTimeoutSeconds = 86400; // Cache timeout: 1 day (86400 seconds) - keep in sync with fileFetchOptions' revalidate above
    const totalSamples = genotypeIds.length;
    const selectFields = passportDataSelectFields.join(',');
    const idChunks: string[][] = [];
    for (let start = 0; start < totalSamples; start += genotypeIdsPerRequest) {
      idChunks.push(genotypeIds.slice(start, start + genotypeIdsPerRequest));
    }

    console.log(debug(`Total samples requested: ${totalSamples}`));
    console.log(debug(`Total chunks to fetch: ${idChunks.length} of up to ${genotypeIdsPerRequest} IDs (in parallel)`));

    // Fetch all chunks concurrently. Each chunk is wrapped in unstable_cache for
    // POST request caching, unless caching is disabled for performance testing.
    // unstable_cache also keys on the arguments, so a changed ID list misses the cache.
    const passportStart = performance.now();
    const chunks = await Promise.all(
      idChunks.map(async (ids, chunkIndex) => {
        const startTime = performance.now();

        const chunkRows = noCache
          ? await fetchPassportChunk(ids, selectFields, genotypeIdsPerRequest)
          : await unstable_cache(
              fetchPassportChunk,
              [`passport-data-${PCAFile}-${subset}-chunk-${chunkIndex}`],
              {
                revalidate: cacheTimeoutSeconds,
                tags: [`passport-data`, `passport-data-${PCAFile}`, `passport-data-${PCAFile}-${subset}`]
              }
            )(ids, selectFields, genotypeIdsPerRequest);

        const requestDuration = ((performance.now() - startTime) / 1000).toFixed(2);
        const chunkContent = chunkRows.map((item) => replaceNullsWithMissing(item));

        // Calculate chunk size in bytes
        const chunkSizeBytes = new Blob([JSON.stringify(chunkRows)]).size;
        const chunkSizeKB = (chunkSizeBytes / 1024).toFixed(2);
        const chunkSizeMB = (chunkSizeBytes / (1024 * 1024)).toFixed(2);

        console.log(chalk.green(`✓ Chunk ${chunkIndex + 1}/${idChunks.length} received: ${chunkContent.length} items for ${ids.length} IDs (${chunkSizeKB} KB / ${chunkSizeMB} MB) in ${requestDuration}s`));
        return chunkContent;
      })
    );
    const allPassportData: any[] = chunks.flat();
    console.log(debug(`Passport data fetched in ${((performance.now() - passportStart) / 1000).toFixed(2)}s`));
    
    console.log(debug(`All chunks fetched successfully. Total items: ${allPassportData.length}`));
    
    const passportDataGenotypeIds = new Set(allPassportData.map((item: any) => item.genotypeID));
    const missingPassportDataIds = genotypeIds.filter((id: string) => !passportDataGenotypeIds.has(id));
    if (missingPassportDataIds.length > 0) {
      console.log(chalk.yellow(`⚠ Samples without passport data: ${missingPassportDataIds.length} out of ${totalSamples}`));
    } else {
      console.log(chalk.green(`✓ All ${totalSamples} samples have passport data`));
    }

    const pcaByIID = new Map(PCAData.map((p: any) => [p.IID, p]));
    const mergedData = allPassportData.flatMap((passport: any) => {
      const pca = pcaByIID.get(passport.genotypeID);
      return pca ? [{ ...passport, pca }] : [];
    });

    // The "successfully fetched" log above only reflects the raw passport API
    // response - it says nothing about whether the join below (which produces
    // what's actually returned to the frontend) succeeded. Surface that here
    // so a broken join (e.g. an ID mismatch) can never look identical to a
    // real success.
    const droppedInMerge = allPassportData.length - mergedData.length;
    if (mergedData.length === 0 && allPassportData.length > 0) {
      console.log(chalk.red(`✗ Merge produced 0 items from ${allPassportData.length} fetched passport records - no passport genotypeID matched a PCA IID. Returning empty data to caller.`));
    } else if (droppedInMerge > 0) {
      console.log(chalk.yellow(`⚠ ${droppedInMerge} of ${allPassportData.length} passport records had no matching PCA record and were dropped from the merge`));
    }
    console.log(debug(`Returning ${mergedData.length} merged items to caller (total ${((performance.now() - overallStart) / 1000).toFixed(2)}s)`));

    if (pve) {
      console.log(debug(`PVE loaded: ${pve.length} components`));
    }

    return { data: mergedData, pve };
  } catch (error) {
    console.error('Error fetching PCA passport data:', error);
    throw error;
  }
}
