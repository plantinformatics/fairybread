'use cache'

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { PCAFileLocation } from '@/config/pca-location-config';
import chalk from 'chalk';
import { parse } from "csv-parse/sync";
import path from 'path';
import fs from 'fs';

import { replaceNullsWithMissing } from '@/lib/dataProcessing'

async function fetchAndParsePCAFile(PCAFileURL: string): Promise<any> {
  const response = await fetch(PCAFileURL, { next: { revalidate: 3600 } });
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

// Cache wrapper ensures same data isn't fetched multiple times in one render
export const fetchPCAPassportData = cache(async (PCAFile: string) => {
  try {
    const debug = chalk.blue;

    // Fetch PCA data
    console.log(debug('Fetching PCA passport data for:'), PCAFile);
    
    const PCAFileURL = PCAFileLocation.get(PCAFile);
    if (!PCAFileURL) {
      throw new Error('Invalid PCA file');
    }

    const PCAData = await fetchAndParsePCAFile(PCAFileURL);

    // Get genotype IDs
    const genotypeIds = PCAData.map((p: any) => p.IID);
    
    const maxPassportDataLength = 3000; // keep the size of each page less than 2MB to enable nextJS caching
    const cacheTimeoutSeconds = 3600; // Cache timeout: 1 hour (3600 seconds)
    const totalSamples = genotypeIds.length;
    const totalPages = Math.ceil(totalSamples / maxPassportDataLength);
    
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
          const response = await fetch(
            `https://genolink.plantinformatics.io/api/genesys/accession/query?select=region,subRegion,countryOfOrigin.name,doi,accessionName,taxonomy.taxonName,donorName&l=${maxPassportDataLength}&p=${pageNum}`,
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
        [`passport-data-${PCAFile}-page-${pageNumber}`],
        {
          revalidate: cacheTimeoutSeconds,
          tags: [`passport-data`, `passport-data-${PCAFile}`]
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
    
    // Identify samples without passport data
    const passportDataGenotypeIds = new Set(allPassportData.map((item: any) => item.genotypeID));
    const missingPassportDataIds = genotypeIds.filter((id: string) => !passportDataGenotypeIds.has(id));

    // Output log file when missing passport data is more than 20
    if (missingPassportDataIds.length > 20) {
      console.log(chalk.yellow(`⚠ Samples without passport data: ${missingPassportDataIds.length} out of ${totalSamples}`));
      const logFolder = path.join(process.cwd(), 'src/app/data/logs')
      const logFilePath = path.join(logFolder, `missing-passport-data-${PCAFile}.txt`);
      console.log(chalk.yellow('Missing IDs exceed 20, logging to file' + logFilePath));
      const logContent = `Missing passport data: ${missingPassportDataIds.length} out of ${totalSamples}\nMissing IDs: \n${missingPassportDataIds.join('\n')}`;
      // check if folder and file exists, if not create them
      if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder, { recursive: true });
        console.log(chalk.yellow('Created log folder: ' + logFolder));
      }
      if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, logContent);
        console.log(chalk.yellow('Created log file: ' + logFilePath));
      }
    } else if (missingPassportDataIds.length > 0 && missingPassportDataIds.length <= 20) {
      // Output to console if missing passport data is less than 20
      console.log(chalk.yellow(`⚠ Samples without passport data: ${missingPassportDataIds.length} out of ${totalSamples}`));
      console.log(chalk.yellow('Missing IDs:'), missingPassportDataIds);
    } else {
      console.log(chalk.green(`✓ All ${totalSamples} samples have passport data`));
    }
    
    // Merge PCA and passport data
    const pcaByIID = new Map(PCAData.map((p: any) => [p.IID, p]));
    const mergedData = allPassportData.flatMap((passport: any) => {
      const pca = pcaByIID.get(passport.genotypeID);
      return pca ? [{ ...passport, pca }] : [];
    });

    return mergedData;
  } catch (error) {
    console.error('Error fetching PCA passport data:', error);
    throw error;
  }
});
