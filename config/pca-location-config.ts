/** A published dataset (Harvard Dataverse) that a PCA file was derived from. */
export type DatasetCitation = {
    title: string;
    doiUrl: string;
};

export type PCADatasetInfo = {
    fileUrl: string;
    /** One entry per source dataset. Merged datasets list every source; the first is the primary one. */
    citations: DatasetCitation[];
    /** Optional URL to a one-value-per-line PVE file (PC1, PC2, … as proportions). */
    pveFileUrl?: string;
};

// Subsets can omit `citations` to inherit them from the crop's `allAccessions` entry.
// pveFileUrl is not inherited — subset PCAs can differ, so set it explicitly when available.
type PCASubsetInfo = Pick<PCADatasetInfo, 'fileUrl'> & Partial<Pick<PCADatasetInfo, 'citations' | 'pveFileUrl'>>;

export type PCACropConfig = {
    allAccessions: PCADatasetInfo;
    subsets?: Record<string, PCASubsetInfo>;
};

// Key used in the `?subset=` URL param and dropdown to mean "the full, unfiltered dataset".
export const ALL_ACCESSIONS_SUBSET = 'All Accessions';

// Data files live in the Vercel Blob store and are named `<crop>-<release>-<subset>.<pcs|pve>.txt`
// (see README "Data file naming").
const BLOB_BASE_URL = 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com';
const blobUrl = (fileName: string) => `${BLOB_BASE_URL}/${fileName}`;

const AGG_BARLEY_260430: DatasetCitation = { title: 'AGG Barley - Release 260430', doiUrl: 'https://doi.org/10.7910/DVN/LXU0WD' };

export const PCAFileInfo = new Map<string, PCACropConfig>([
    ['Barley', {
        allAccessions: {
            fileUrl: blobUrl('barley-260430-all.pcs.txt'),
            citations: [AGG_BARLEY_260430],
            pveFileUrl: blobUrl('barley-260430-all.pve.txt'),
        },
        subsets: {
            'Plus CAIGE accessions': {
                fileUrl: blobUrl('barley-260430-plus-caige-260925.pcs.txt'),
                pveFileUrl: blobUrl('barley-260430-plus-caige-260925.pve.txt'),
                citations: [
                    AGG_BARLEY_260430,
                    { title: 'CAIGE Barley - Wheat Barley 40K array v1.1 - Release 260925', doiUrl: 'https://doi.org/10.7910/DVN/AMFC6F' },
                    { title: 'CAIGE Barley - Wheat Barley 40K array v1.2 - Release 260925', doiUrl: 'https://doi.org/10.7910/DVN/NIPYNS' },
                ],
            },
        },
    }],
    ['Wheat', {
        allAccessions: {
            fileUrl: blobUrl('wheat-260619-all.pcs.txt'),
            citations: [{ title: 'AGG Wheat - Release 260619', doiUrl: 'https://doi.org/10.7910/DVN/MOBTA8' }],
            pveFileUrl: blobUrl('wheat-260619-all.pve.txt'),
        },
        subsets: {
            'Excluding synthetic wheats and mapping populations': {
                fileUrl: blobUrl('wheat-260619-no-synthetics-no-mapping-pops.pcs.txt'),
                pveFileUrl: blobUrl('wheat-260619-no-synthetics-no-mapping-pops.pve.txt'),
            },
        },
    }],
    ['Lentil', {
        allAccessions: {
            fileUrl: blobUrl('lentil-250228-all.pcs.txt'),
            citations: [{ title: 'AGG Lentil - Release 250228', doiUrl: 'https://doi.org/10.7910/DVN/T0TDAS' }],
            pveFileUrl: blobUrl('lentil-250228-all.pve.txt'),
        },
    }],
    ['Field Pea', {
        allAccessions: {
            fileUrl: blobUrl('field-pea-250801-all.pcs.txt'),
            citations: [{ title: 'AGG Field pea - Release 250801', doiUrl: 'https://doi.org/10.7910/DVN/A6WGYS' }],
            pveFileUrl: blobUrl('field-pea-250801-all.pve.txt'),
        },
    }],
    ['Chickpea', {
        allAccessions: {
            fileUrl: blobUrl('chickpea-250505-all.pcs.txt'),
            citations: [{ title: 'AGG Chickpea - Release 250505', doiUrl: 'https://doi.org/10.7910/DVN/ECQ4NC' }],
            pveFileUrl: blobUrl('chickpea-250505-all.pve.txt'),
        },
    }],
    ['Lupin', {
        allAccessions: {
            fileUrl: blobUrl('lupin-251113-all.pcs.txt'),
            citations: [{ title: 'AGG Lupin - Release 251113', doiUrl: 'https://doi.org/10.7910/DVN/FVTFIL' }],
            pveFileUrl: blobUrl('lupin-251113-all.pve.txt'),
        },
    }],
]);

/**
 * All selectable subset names for a crop, always starting with `ALL_ACCESSIONS_SUBSET`
 * followed by any configured subsets (in declaration order).
 */
export function getSubsetNames(crop: string): string[] {
    const cropConfig = PCAFileInfo.get(crop);
    return [ALL_ACCESSIONS_SUBSET, ...Object.keys(cropConfig?.subsets ?? {})];
}

/**
 * Resolves the fileUrl/citations/pveFileUrl to use for a given crop + subset.
 * Falls back to the crop's `allAccessions` entry if the crop is unknown or doesn't
 * have the requested subset (e.g. after switching crops), and subsets inherit
 * citations from `allAccessions` when not explicitly overridden.
 */
export function getDatasetInfo(crop: string, subset: string): PCADatasetInfo | undefined {
    const cropConfig = PCAFileInfo.get(crop);
    if (!cropConfig) return undefined;
    if (subset === ALL_ACCESSIONS_SUBSET) return cropConfig.allAccessions;

    const subsetInfo = cropConfig.subsets?.[subset];
    if (!subsetInfo) return cropConfig.allAccessions;

    return {
        fileUrl: subsetInfo.fileUrl,
        citations: subsetInfo.citations ?? cropConfig.allAccessions.citations,
        ...(subsetInfo.pveFileUrl !== undefined && { pveFileUrl: subsetInfo.pveFileUrl }),
    };
}
