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

// The accession part of an AGG genotype ID: `AGG413162BARL1-B00030-4-40` → `AGG413162BARL`
// (accession AGG 413162 BARL). The digit after the crop code and the batch suffix identify one genotyping run.
const ACCESSION_PREFIX = /^AGG\d+[A-Z]+/;

/**
 * The accession a genotype ID belongs to, or undefined if it isn't an AGG genotype ID.
 * Accepts Genolink's `genotypeID` as returned: an array when the request held several of the
 * accession's genotype IDs (all share one accession, so the first is used).
 */
export function accessionOfGenotypeId(id: string | string[]): string | undefined {
  return (Array.isArray(id) ? id[0] : id)?.match(ACCESSION_PREFIX)?.[0];
}

/**
 * Joins Genolink passport rows to PCA rows by accession.
 *
 * An accession can be genotyped more than once, so several PCA rows can share one accession.
 * Genolink's accession query returns one passport row per accession no matter how many of its
 * genotype IDs are sent, and which ID (or array of IDs) it echoes back depends on the rest of the request. So each
 * passport row is attached to every PCA row from its accession, and `genotypeID` is taken from
 * the PCA row so each genotyping run keeps its own identity. Rows from an accession with more than
 * one run also get `otherGenotypeIDs` (the accession's other runs in this dataset), so the UI can
 * flag them. PCA rows whose accession has no passport data are left out.
 */
export function mergePassportByAccession<P extends { genotypeID: string | string[] }, R extends { IID: string }>(
  passportRows: P[],
  pcaRows: R[],
): (Omit<P, 'genotypeID'> & { genotypeID: string; pca: R; otherGenotypeIDs?: string[] })[] {
  const passportByAccession = new Map<string, P>();
  for (const passport of passportRows) {
    const accession = accessionOfGenotypeId(passport.genotypeID);
    if (accession) passportByAccession.set(accession, passport);
  }
  const genotypeIdsByAccession = new Map<string, string[]>();
  for (const { IID } of pcaRows) {
    const accession = accessionOfGenotypeId(IID);
    if (accession) genotypeIdsByAccession.set(accession, [...(genotypeIdsByAccession.get(accession) ?? []), IID]);
  }
  return pcaRows.flatMap((pca) => {
    const accession = accessionOfGenotypeId(pca.IID);
    const passport = accession ? passportByAccession.get(accession) : undefined;
    if (!accession || !passport) return [];
    const otherGenotypeIDs = genotypeIdsByAccession.get(accession)!.filter((id) => id !== pca.IID);
    return [{ ...passport, genotypeID: pca.IID, pca, ...(otherGenotypeIDs.length > 0 && { otherGenotypeIDs }) }];
  });
}
