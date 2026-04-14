'use client';

import { useState } from 'react';
import type { PCAPassportData } from '@/config/table-and-filter-config';
import { PCAFileInfo } from '@/config/pca-location-config';
import { usePcaData } from '@/context/pca-data-context';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

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
function parseInput(text: string): string[] {
  // TODO: Split `text` into lines, trim each, and filter out empty lines.
  // TODO: Check whether any line contains a tab character ('\t').
  //       If so, it's TSV — return the first field of each row (split on '\t').
  //       Otherwise, return each line as-is (plain list).
  return [];
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
function matchTerms(
  terms: string[],
  data: PCAPassportData[]
): { matched: PCAPassportData[]; unmatched: string[] } {
  const matched: PCAPassportData[] = [];
  const unmatched: string[] = [];

  // TODO: Use a Set<string> to track genotypeIDs already added, so duplicates
  //       are skipped.

  for (const term of terms) {
    // TODO: Lowercase `term` for case-insensitive comparison.
    // TODO: Search `data` for a row where accessionName or accessionNumber
    //       matches (both lowercased).
    // TODO: If found and not already in the set, add to `matched` and record
    //       the genotypeID.
    // TODO: If not found, push `term` to `unmatched`.
  }

  return { matched, unmatched };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CustomListPage() {
  const cropOptions = Array.from(PCAFileInfo.keys());

  // `file`, `rawData`, and `isLoading` all come from the shared context —
  // no local fetch needed here. Changing `file` here will trigger a re-fetch
  // in the provider and update all pages simultaneously.
  const { file, setFile, rawData, isLoading } = usePcaData();

  const [inputText, setInputText] = useState('');
  // matchedRows and unmatchedTerms are the parsed results; they are NOT
  // persisted — they are derived on demand from inputText + rawData.
  const [matchedRows, setMatchedRows] = useState<PCAPassportData[]>([]);
  const [unmatchedTerms, setUnmatchedTerms] = useState<string[]>([]);
  // hasParsed gates the results section — we only show it after the first parse.
  const [hasParsed, setHasParsed] = useState(false);

  // Called when the user clicks "Parse".
  // parsedTerms is transient — derived here and not stored in state.
  const handleParse = () => {
    // TODO: Call parseInput(inputText) to get the list of lookup terms.
    // TODO: Call matchTerms(terms, rawData) to split them into matched/unmatched.
    // TODO: Update matchedRows, unmatchedTerms, and set hasParsed to true.
  };

  const handleReset = () => {
    // TODO: Clear inputText, matchedRows, unmatchedTerms, and hasParsed.
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Custom Accession List</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Paste a list of accession names or numbers to find their records within
        the selected crop dataset. Accepts plain line-separated lists or TSV
        (first column is used, no header expected).
      </p>

      {/* ── Crop selector ──────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-xl border p-5">
        <label className="mb-2 block text-sm font-medium">Crop</label>
        <Select value={file ?? 'Wheat'} onValueChange={(val) => val !== null && setFile(val)}>
          <SelectTrigger className="w-48" size="sm">
            <SelectValue placeholder="Select crop" />
          </SelectTrigger>
          <SelectContent>
            {cropOptions.map((crop) => (
              <SelectItem key={crop} value={crop}>
                {crop}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Input area ─────────────────────────────────────────────────────── */}
      {/*
        The input is blocked while data is loading. This prevents the user from
        pasting and parsing against a partially-loaded or wrong-crop dataset.
      */}
      <div className="mt-4 rounded-xl border p-5">
        <label className="mb-2 block text-sm font-medium">Accession list</label>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading {file} data…
          </div>
        ) : (
          <>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
              rows={8}
              placeholder={
                'Paste accession names or numbers here\u2026\n\nOne per line, or TSV (first column used).\nExample:\n  WAWB0001\n  WAWB0002'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={handleParse}
                disabled={!inputText.trim()}
              >
                Parse
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
                disabled={!inputText && !hasParsed}
              >
                Reset
              </Button>
            </div>
          </>
        )}
      </div>

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {/* Only rendered after the user has clicked Parse at least once */}
      {hasParsed && (
        <div className="mt-6 space-y-6">

          {/* Matched rows */}
          <div className="rounded-xl border p-5">
            <h2 className="mb-3 text-sm font-semibold">
              Matched{' '}
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-normal">
                {matchedRows.length}
              </span>
            </h2>

            {matchedRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No accessions matched within the {file} dataset.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                      <th className="pb-2 pr-4">Accession Name</th>
                      <th className="pb-2 pr-4">Accession Number</th>
                      <th className="pb-2 pr-4">Country</th>
                      <th className="pb-2 pr-4">Region</th>
                      <th className="pb-2">DOI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchedRows.map((row) => (
                      <tr key={row.genotypeID} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">
                          {row.accessionName || '—'}
                        </td>
                        <td className="py-2 pr-4">
                          {/* Genesys uses the DOI as the record URL, not the accession number */}
                          {row.doi ? (
                            <a
                              href={`https://www.genesys-pgr.org/${row.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold underline-offset-4 hover:underline"
                            >
                              {row.accessionNumber || '—'}
                            </a>
                          ) : (
                            row.accessionNumber || '—'
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          {row['countryOfOrigin.name'] || '—'}
                        </td>
                        <td className="py-2 pr-4">{row.region || '—'}</td>
                        <td className="py-2">
                          {row.doi ? (
                            <a
                              href={`https://doi.org/${row.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline-offset-4 hover:underline"
                            >
                              {row.doi}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Unmatched terms — only shown when there is at least one */}
          {unmatchedTerms.length > 0 && (
            <div className="rounded-xl border p-5">
              <h2 className="mb-3 text-sm font-semibold">
                Unmatched{' '}
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-normal">
                  {unmatchedTerms.length}
                </span>
              </h2>
              <p className="mb-3 text-xs text-muted-foreground">
                These terms did not match any accession name or number in the{' '}
                {file} dataset. Check spelling or try the other field (name vs
                number).
              </p>
              <ul className="space-y-1">
                {unmatchedTerms.map((term, i) => (
                  <li
                    key={i}
                    className="rounded bg-muted/50 px-3 py-1 font-mono text-xs text-destructive"
                  >
                    {term}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
