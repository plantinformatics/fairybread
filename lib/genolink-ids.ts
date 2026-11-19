export const GENOLINK_QUERY_URL = 'https://genolink.plantinformatics.io/api/genesys/accession/query';

// Genolink only accepts AGG genotype IDs (`AGG<accession><crop code><n>-...`, e.g. `AGG409530BARL1-B00001-1-02`).
// A single ID in any other format (e.g. a reference variety like `Fathom-B00046-11-92`) makes
// Genolink reject the whole request with "String format is not as expected."
const GENOLINK_GENOTYPE_ID = /^AGG\d+[A-Z]+\d*-/;

/** Splits PCA genotype IDs into those Genolink can look up and those it would reject. */
export function partitionGenolinkIds(ids: string[]): { queryable: string[]; unqueryable: string[] } {
  const queryable: string[] = [];
  const unqueryable: string[] = [];
  for (const id of ids) (GENOLINK_GENOTYPE_ID.test(id) ? queryable : unqueryable).push(id);
  return { queryable, unqueryable };
}
