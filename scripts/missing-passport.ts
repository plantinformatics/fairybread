// Lists the genotype IDs in a PCA file that won't get passport data from Genolink (and so won't be plotted).
//
//   bun run missing-passport                     # every crop and subset
//   bun run missing-passport Barley              # one crop, all its subsets
//   bun run missing-passport Barley "AGG accessions only"
//
// Writes one TSV per dataset to logs/missing-passport-<crop>-<subset>.tsv with columns:
// genotypeID, inAllAccessions (whether the ID is also in the crop's full dataset), reason.
import { mkdir } from 'node:fs/promises';
import { ALL_ACCESSIONS_SUBSET, PCAFileInfo, getDatasetInfo, getSubsetNames } from '@/config/pca-location-config';
import { GENOLINK_QUERY_URL, accessionOfGenotypeId, partitionGenolinkIds } from '@/lib/genolink-ids';

const PAGE_SIZE = 3000;
const OUT_DIR = 'logs';

async function fetchGenotypeIds(fileUrl: string): Promise<string[]> {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error(`PCA file fetch failed (${response.status}): ${fileUrl}`);
  const [header, ...lines] = (await response.text()).trim().split('\n');
  const iidColumn = header.split('\t').indexOf('IID');
  if (iidColumn === -1) throw new Error(`No IID column in ${fileUrl}`);
  return lines.map((line) => line.split('\t')[iidColumn].trim());
}

/** Accessions Genolink has passport data for. Genolink returns one row per accession, however many of its genotype IDs are sent. */
async function fetchAccessionsWithPassport(ids: string[]): Promise<Set<string>> {
  const pages = await Promise.all(Array.from({ length: Math.ceil(ids.length / PAGE_SIZE) }, async (_, page) => {
    const params = new URLSearchParams({ select: 'accessionNumber', l: String(PAGE_SIZE), p: String(page) });
    const response = await fetch(`${GENOLINK_QUERY_URL}?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ genotypeIds: ids }),
    });
    if (!response.ok) throw new Error(`Genolink page ${page} failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
    const { content = [] } = (await response.json()) as { content?: { genotypeID: string | string[] }[] };
    return content.map((row) => accessionOfGenotypeId(row.genotypeID));
  }));
  return new Set(pages.flat().filter((accession) => accession !== undefined));
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function report(crop: string, subset: string) {
  const fileInfo = getDatasetInfo(crop, subset)!;
  const allAccessionIds = new Set(await fetchGenotypeIds(PCAFileInfo.get(crop)!.allAccessions.fileUrl));
  const ids = subset === ALL_ACCESSIONS_SUBSET ? [...allAccessionIds] : await fetchGenotypeIds(fileInfo.fileUrl);

  const { queryable, unqueryable } = partitionGenolinkIds(ids);
  const accessionsWithPassport = await fetchAccessionsWithPassport(queryable);
  const missing = [
    ...queryable.filter((id) => !accessionsWithPassport.has(accessionOfGenotypeId(id)!)).map((id) => [id, 'no passport record in Genolink']),
    ...unqueryable.map((id) => [id, 'not AGG format (skipped)']),
  ];

  const outFile = `${OUT_DIR}/missing-passport-${slug(crop)}-${slug(subset)}.tsv`;
  const rows = missing.map(([id, reason]) => [id, allAccessionIds.has(id), reason].join('\t'));
  await Bun.write(outFile, ['genotypeID\tinAllAccessions\treason', ...rows].join('\n') + '\n');
  console.log(`${crop} / ${subset}: ${missing.length} of ${ids.length} missing passport data (${unqueryable.length} not AGG format) → ${outFile}`);
}

const [cropArg, subsetArg] = process.argv.slice(2);
if (cropArg && !PCAFileInfo.has(cropArg)) {
  console.error(`Unknown crop "${cropArg}". Options: ${[...PCAFileInfo.keys()].join(', ')}`);
  process.exit(1);
}
if (cropArg && subsetArg && !getSubsetNames(cropArg).includes(subsetArg)) {
  console.error(`Unknown subset "${subsetArg}" for ${cropArg}. Options: ${getSubsetNames(cropArg).join(', ')}`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const crops = cropArg ? [cropArg] : [...PCAFileInfo.keys()];
for (const crop of crops) {
  for (const subset of subsetArg ? [subsetArg] : getSubsetNames(crop)) await report(crop, subset);
}
