'use client';

import { useState, useEffect } from 'react';
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
import {
  Loader2,
  ListChecks,
  X,
  Sprout,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { parseInput, matchTerms } from '@/lib/customListParseMatch'
import { useCustomList } from '@/context/custom-list-context';
// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CustomListPage() {
  const cropOptions = Array.from(PCAFileInfo.keys());

  const DEBOUNCE_MS = 250;
  const CUSTOM_LIST_TEXT_STORAGE_KEY = "pca-custom-list-text"

  // `file`, `rawData`, and `isLoading` all come from the shared context —
  // no local fetch needed here. Changing `file` here will trigger a re-fetch
  // in the provider and update all pages simultaneously.
  const { file, setFile, rawData, isLoading } = usePcaData();
  const { customList, setCustomList} = useCustomList();

  // matchedRows and unmatchedTerms are the parsed results; they are NOT
  // persisted — they are derived on demand from inputText + rawData.
  const [inputText, setInputText] = useState<string>('')
  const [matchedRows, setMatchedRows] = useState<PCAPassportData[]>([]);
  const [unmatchedTerms, setUnmatchedTerms] = useState<string[]>([]);
  // hasParsed gates the results section — we only show it after the first parse.
  const [hasParsed, setHasParsed] = useState(false);

  useEffect(()=>{
    const savedText = window.localStorage.getItem(CUSTOM_LIST_TEXT_STORAGE_KEY);
    if (savedText) {
      setInputText(savedText);
    }
  }, [])

  // Called when the user clicks "Parse".
  // parsedTerms is transient — derived here and not stored in state.
  const handleParse = () => {
    const terms = parseInput(inputText);
    const {matched, unmatched} = matchTerms(terms, rawData);
    const genotypeIDList = matched.map(p => p.genotypeID);
    setCustomList(genotypeIDList)
    setMatchedRows(matched)
    setUnmatchedTerms(unmatched)
    setHasParsed(true)
    // TODO: Update matchedRows, unmatchedTerms, and set hasParsed to true.
  };

  const handleReset = () => {
    setInputText("")
    setMatchedRows([])
    setUnmatchedTerms([])
    setHasParsed(false)
  };

  return (
    <div className="mr-auto w-full max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Custom Accession List</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Paste a list of accession names or numbers to find their records within
        the selected crop dataset. Accepts plain line-separated lists or TSV
        (first column is used, no header expected).
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_20rem]">
        {/* ── Main flow (left) ─────────────────────────────────────────────── */}
        <div className="space-y-4">
      {/* ── Crop selector ──────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-xl border bg-card">
        <header className="flex items-center justify-between gap-4 border-b bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2">
            <Sprout className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold tracking-tight">Crop</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Dataset:{' '}
            {file && PCAFileInfo.get(file) ? (
              <a
                href={PCAFileInfo.get(file)!.doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {PCAFileInfo.get(file)!.doiTitle}
              </a>
            ) : (
              <span className="font-medium text-foreground">—</span>
            )}
          </span>
        </header>

        <div className="px-5 py-4">
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
      </section>

      {/* ── Input area ─────────────────────────────────────────────────────── */}
      {/*
        The input is blocked while data is loading. This prevents the user from
        pasting and parsing against a partially-loaded or wrong-crop dataset.
      */}
      <section className="overflow-hidden rounded-xl border bg-card">
        <header className="flex items-center justify-between gap-4 border-b bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold tracking-tight">Accession list</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            One per line OR CSV/TSV first column
          </span>
        </header>

        <div className="px-5 py-4">
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
                onChange={(e) => 
                  {setInputText(e.target.value);
                   window.localStorage.setItem(CUSTOM_LIST_TEXT_STORAGE_KEY, e.target.value);
                  }}
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
      </section>

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {/* Only rendered after the user has clicked Parse at least once */}
      {hasParsed && (
        <div className="space-y-6">

          {/* Matched rows */}
          <section className="overflow-hidden rounded-xl border bg-card">
            <header className="flex items-center justify-between gap-4 border-b bg-muted/30 px-5 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-500" />
                <h2 className="text-sm font-semibold tracking-tight">Matched</h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                  {matchedRows.length}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                in <span className="font-medium text-foreground">{file}</span>
              </span>
            </header>

            <div className="px-5 py-4">
              {matchedRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No accessions matched within the {file} dataset.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                        <th className="pb-2 pr-4">Genotype ID</th>
                        <th className="pb-2 pr-4">Accession Name</th>
                        <th className="pb-2 pr-4">Accession Number</th>
                        <th className="pb-2 pr-4">Country</th>
                        <th className="pb-2">DOI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchedRows.map((row) => (
                        <tr key={row.genotypeID} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium">
                            {row.genotypeID || '—'}
                          </td>
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
          </section>

          {/* Unmatched terms — only shown when there is at least one */}
          {unmatchedTerms.length > 0 && (
            <section className="overflow-hidden rounded-xl border bg-card">
              <header className="flex items-center justify-between gap-4 border-b bg-muted/30 px-5 py-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-destructive" />
                  <h2 className="text-sm font-semibold tracking-tight">Unmatched</h2>
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium tabular-nums text-destructive">
                    {unmatchedTerms.length}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Not found in <span className="font-medium text-foreground">{file}</span>
                </span>
              </header>

              <div className="px-5 py-4">
                <p className="mb-3 text-xs text-muted-foreground">
                  These terms did not match any accession name or number. Check
                  spelling or try the other field (name vs number).
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {unmatchedTerms.map((term, i) => (
                    <li
                      key={i}
                      className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/5 px-2.5 py-1 font-mono text-xs text-destructive transition-colors"
                    >
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      )}
        </div>

        {/* ── Arrow divider (md+ only) ───────────────────────────────────── */}
        <div
          aria-hidden
          className="hidden items-center justify-center lg:flex"
        >
          <div className="flex size-20 items-center justify-center rounded-full border bg-background text-muted-foreground">
            <ArrowRight className="size-6" />
          </div>
        </div>

        {/* ── Custom list (right aside) ─────────────────────────────────── */}
        <aside>
          <section className="overflow-hidden rounded-xl border bg-card lg:sticky lg:top-6">
            <header className="flex items-center justify-between gap-4 border-b bg-muted/30 px-5 py-3">
              <div className="flex items-center gap-2">
                <ListChecks className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold tracking-tight">Custom list</h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium tabular-nums text-primary">
                  {customList.length}
                </span>
              </div>
              {customList.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setCustomList([])}
                >
                  <X className="size-3.5" />
                  Clear
                </Button>
              )}
            </header>

            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-5 py-4">
              {customList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No accessions yet. Paste a list and click{' '}
                  <span className="font-medium text-foreground">Parse</span> to populate.
                </p>
              ) : (
                <ul className="flex flex-wrap gap-1.5">
                  {customList.map((term, i) => (
                    <li
                      key={`${term}-${i}`}
                      className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 font-mono text-xs text-foreground/80 transition-colors"
                    >
                      {term}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
