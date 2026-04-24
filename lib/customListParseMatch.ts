'use client'

import type { PCAPassportData } from '@/config/table-and-filter-config';
import { parse } from "csv-parse/sync";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parses pasted text as CSV, TSV, or a plain newline-separated list and
 * returns a flat array of lookup terms.
 *
 * Inputs are assumed to have NO header row. Each line may contain one term,
 * or multiple comma- or tab-separated terms; all fields across all rows are
 * returned in document order. Empty fields and surrounding whitespace are
 * stripped.
 */
export function parseInput(text: string): string[] {
    // Pick a single delimiter for the whole input: tab if any line contains
    // one, otherwise comma. Plain newline-separated lists work with either.
    const delimiter = text.includes('\t') ? '\t' : ',';

    const rows: string[][] = parse(text, {
        delimiter,
        trim: true,
        skip_empty_lines: true,
        relax_column_count: true,
    });

    return rows.flatMap((row) => row).filter((field) => field.length > 0);
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