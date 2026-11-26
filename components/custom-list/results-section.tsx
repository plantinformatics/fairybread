import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { PCAPassportData } from '@/config/table-and-filter-config';
import { doiUrl, genesysAccessionUrl } from '@/lib/accession-links';
import { SectionCard } from '@/components/custom-list/section-card';

export function ResultsSection({
  file,
  matchedRows,
  unmatchedTerms,
}: {
  file: string;
  matchedRows: PCAPassportData[];
  unmatchedTerms: string[];
}) {
  return (
    <div className="space-y-6">
      <MatchedSection file={file} matchedRows={matchedRows} />
      {unmatchedTerms.length > 0 && (
        <UnmatchedSection file={file} unmatchedTerms={unmatchedTerms} />
      )}
    </div>
  );
}

function MatchedSection({ file, matchedRows }: { file: string; matchedRows: PCAPassportData[] }) {
  return (
    <SectionCard
      icon={<CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-500" />}
      title="Matched"
      count={{ value: matchedRows.length, tone: 'success' }}
      headerEnd={
        <span className="text-xs text-muted-foreground">
          in <span className="font-medium text-foreground">{file}</span>
        </span>
      }
    >
      {matchedRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No genotype IDs matched within the {file} dataset.
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
                  <td className="py-2 pr-4 font-medium">{row.genotypeID || '—'}</td>
                  <td className="py-2 pr-4 font-medium">{row.accessionName || '—'}</td>
                  <td className="py-2 pr-4">
                    {row.doi ? (
                      <a
                        href={genesysAccessionUrl(row.doi)}
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
                  <td className="py-2 pr-4">{row['countryOfOrigin.name'] || '—'}</td>
                  <td className="py-2">
                    {row.doi ? (
                      <a
                        href={doiUrl(row.doi)}
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
    </SectionCard>
  );
}

function UnmatchedSection({ file, unmatchedTerms }: { file: string; unmatchedTerms: string[] }) {
  return (
    <SectionCard
      icon={<AlertCircle className="size-4 text-destructive" />}
      title="Unmatched"
      count={{ value: unmatchedTerms.length, tone: 'destructive' }}
      headerEnd={
        <span className="text-xs text-muted-foreground">
          Not found in <span className="font-medium text-foreground">{file}</span>
        </span>
      }
    >
      <p className="mb-3 text-xs text-muted-foreground">
        These terms did not match any genotype ID in the {file}{' '}
        dataset. Check for typos or confirm the IDs exist in this crop.
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
    </SectionCard>
  );
}
