'use client'

import type { PCAPassportData } from '@/config/table-and-filter-config';
import { parse } from "csv-parse/sync";

/** Every field of pasted CSV, TSV or a plain line-per-term list, in order. There is no header row. */
export function parseInput(text: string): string[] {
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
  
    return { matched, unmatched };
  }