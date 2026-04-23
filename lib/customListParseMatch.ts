'use client'

import type { PCAPassportData } from '@/config/table-and-filter-config';
import { parse } from "csv-parse/sync";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detects whether the pasted text is TSV (any line contains a tab) or a plain
 * newline-separated list, then extracts one lookup term per row.
 *
 * TSV inputs are assumed to have NO header row. Only the first column of each
 * row is used; any additional columns are ignored.
 *
 * Returns an array of trimmed, non-empty strings to look up.
 */
export function parseInput(text: string): string[] {
    const isTSV = text.includes('\t');

    const rows: string[][] = parse(text, {
        delimiter: isTSV ? '\t' : ',',
        trim: true
    });

    return rows.flatMap((x)=> x);
}
  
  /**
   * Matches lookup terms against the loaded PCAPassportData for the selected crop.
   *
   * Matching is case-insensitive and checks both `accessionName` and
   * `accessionNumber` fields on each row.
   *
   * Rows are deduplicated by `genotypeID` — if two input terms resolve to the
   * same row, it should only appear once in the matched results.
   *
   * Terms that find no match go into the `unmatched` list so the user can see
   * what didn't work.
   */
  export function matchTerms(
    terms: string[],
    data: PCAPassportData[]
  ): { matched: PCAPassportData[]; unmatched: string[] } {
    const pcaByGenotypeID = new Map(data.map((p: any) => [p.genotypeID, p]));
    console.log(pcaByGenotypeID);
    const matched: PCAPassportData[] = [];
    const unmatched: string[] = [];

    terms.map((genotypeID)=> {
      pcaByGenotypeID.get(genotypeID) ? matched.push(pcaByGenotypeID.get(genotypeID)) : unmatched.push(genotypeID)
    })
  
    // TODO: Use a Set<string> to track genotypeIDs already added, so duplicates
    //       are skipped.
  
    // for (const term of terms) {
    //   // TODO: Lowercase `term` for case-insensitive comparison.
    //   // TODO: Search `data` for a row where accessionName or accessionNumber
    //   //       matches (both lowercased).
    //   // TODO: If found and not already in the set, add to `matched` and record
    //   //       the genotypeID.
    //   // TODO: If not found, push `term` to `unmatched`.
    // }
  
    return { matched, unmatched };
  }