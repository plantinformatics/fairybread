import { unstable_cache } from 'next/cache';
import { ALL_ACCESSIONS_SUBSET, getDatasetInfo } from '@/config/pca-location-config';
import { passportDataSelectFields } from '@/config/table-and-filter-config';
import chalk from 'chalk';
import { parse } from "csv-parse/sync";

import { replaceNullsWithMissing } from '@/lib/dataProcessing'

async function fetchAndParsePCAFile(PCAFileURL: string): Promise<any> {
  const response = await fetch(PCAFileURL, { next: { revalidate: 86400 } }); // one day in seconds, don't forget to align with cacheTimeoutSeconds
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
async function fetchAndParsePveFile(pveFileUrl: string): Promise<number[] | null> {
  try {
    const response = await fetch(pveFileUrl, { next: { revalidate: 86400 } });
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

export type PCAPassportFetchResult = {
  data: any[];
  /** Proportion of variance explained per PC (index 0 = PC1), or null if unavailable. */
  pve: number[] | null;
};

export async function fetchPCAPassportData(PCAFile: string, subset: string = ALL_ACCESSIONS_SUBSET): Promise<PCAPassportFetchResult> {
  try {
    const debug = chalk.blue;

    // Fetch PCA data
    console.log(debug('Fetching PCA passport data for:'), PCAFile, subset);
    
    const fileInfo = getDatasetInfo(PCAFile, subset);
    if (!fileInfo) {
      throw new Error('Invalid PCA file');
    }

    const [PCAData, pve] = await Promise.all([
      fetchAndParsePCAFile(fileInfo.fileUrl),
      fileInfo.pveFileUrl ? fetchAndParsePveFile(fileInfo.pveFileUrl) : Promise.resolve(null),
    ]);

    // Get genotype IDs
    const genotypeIds = PCAData.map((p: any) => p.IID);
    
    const maxPassportDataLength = 3000; // keep the size of each page less than 2MB to enable nextJS caching
    const cacheTimeoutSeconds = 86400; // Cache timeout: 1 day (86400 seconds) - keep in sync with fetchAndParsePCAFile's revalidate above
    const totalSamples = genotypeIds.length;
    const totalPages = Math.ceil(totalSamples / maxPassportDataLength);
    const selectFields = passportDataSelectFields.join(',');
    
    console.log(debug(`Total samples requested: ${totalSamples}`));
    console.log(debug(`Total pages to fetch: ${totalPages}`));
    
    // Fetch all pages sequentially
    const allPassportData: any[] = [];
    
    for (let pageNumber = 0; pageNumber <= (totalPages - 1); pageNumber++) {
      console.log(debug(`Fetching page ${pageNumber}/${totalPages}...`));
      
      const startTime = performance.now();
      
      // Wrap fetch in unstable_cache for proper POST request caching
      const fetchPageData = unstable_cache(
        async (pageNum: number, ids: string[]) => {
          const queryParams = new URLSearchParams({
            select: selectFields,
            l: String(maxPassportDataLength),
            p: String(pageNum),
          });
          const response = await fetch(
            `https://genolink.plantinformatics.io/api/genesys/accession/query?${queryParams.toString()}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({genotypeIds: ids}),
            }
          );
          
          if (!response.ok) {
            const errorText = await response.text();
            console.log(chalk.red(`Error fetching page ${pageNum}: HTTP ${response.status}`));
            console.log(chalk.red(`Error response: ${errorText.substring(0, 200)}`));
            throw new Error(`Failed to fetch page ${pageNum}: HTTP ${response.status} - ${response.statusText}`);
          }
          
          return await response.json();
        },
        [`passport-data-${PCAFile}-${subset}-page-${pageNumber}`],
        {
          revalidate: cacheTimeoutSeconds,
          tags: [`passport-data`, `passport-data-${PCAFile}`, `passport-data-${PCAFile}-${subset}`]
        }
      );
      
      const pageData = await fetchPageData(pageNumber, genotypeIds);
      const endTime = performance.now();
      const requestDuration = ((endTime - startTime) / 1000).toFixed(2); // Convert to seconds with 2 decimal places
      
      const rawPageContent = pageData.content || [];
      const pageContent = rawPageContent.map((item: any) =>
        replaceNullsWithMissing(item)
      );
      
      // Calculate page size in bytes
      const pageSizeBytes = new Blob([JSON.stringify(pageData)]).size;
      const pageSizeKB = (pageSizeBytes / 1024).toFixed(2);
      const pageSizeMB = (pageSizeBytes / (1024 * 1024)).toFixed(2);
      
      allPassportData.push(...pageContent);
      
      console.log(chalk.green(`✓ Page ${pageNumber}/${totalPages} received: ${pageContent.length} items (${pageSizeKB} KB / ${pageSizeMB} MB) in ${requestDuration}s`));
      console.log(debug(`Total items collected so far: ${allPassportData.length}`));
    }
    
    console.log(debug(`All pages fetched successfully. Total items: ${allPassportData.length}`));
    
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
    console.log(debug(`Returning ${mergedData.length} merged items to caller`));

    if (pve) {
      console.log(debug(`PVE loaded: ${pve.length} components`));
    }

    return { data: mergedData, pve };
  } catch (error) {
    console.error('Error fetching PCA passport data:', error);
    throw error;
  }
}
