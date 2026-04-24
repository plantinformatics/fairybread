'use client'

import type { PCAPassportData } from '@/config/table-and-filter-config';
import { parse } from "csv-parse/sync";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parses pasted text as CSV or a plain newline-separated list and returns a
 * flat array of lookup terms.
 *
 * Inputs are assumed to have NO header row. Each line may contain one term,
 * or multiple comma-separated terms; all fields across all rows are returned
 * in document order. Empty fields and surrounding whitespace are stripped.
 */
export function parseInput(text: string): string[] {
    const rows: string[][] = parse(text, {
        delimiter: ',',
        trim: true,
        skip_empty_lines: true,
        relax_column_count: true,
    });

    return rows.flatMap((x)=> x);
}
  
  export function matchTerms(
    terms: string[],
    data: PCAPassportData[]
  ): { matched: PCAPassportData[]; unmatched: string[] } {
    const pcaByGenotypeID = new Map(data.map((p: any) => [p.genotypeID, p]));
    const matched: PCAPassportData[] = [];
    const unmatched: string[] = [];

    terms.map((genotypeID)=> {
      pcaByGenotypeID.get(genotypeID) ? matched.push(pcaByGenotypeID.get(genotypeID)) : unmatched.push(genotypeID)
    })
    // Maybe add something to make it case insensitve
  
    return { matched, unmatched };
  }