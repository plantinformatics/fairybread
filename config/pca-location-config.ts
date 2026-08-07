export type PCADatasetInfo = {
    fileUrl: string;
    doiTitle: string;
    doiUrl: string;
    /** Optional URL to a one-value-per-line PVE file (PC1, PC2, … as proportions). */
    pveFileUrl?: string;
};

// Subsets can omit doiTitle/doiUrl to inherit the citation from the crop's `allAccessions` entry.
// pveFileUrl is not inherited — subset PCAs can differ, so set it explicitly when available.
type PCASubsetInfo = Pick<PCADatasetInfo, 'fileUrl'> & Partial<Pick<PCADatasetInfo, 'doiTitle' | 'doiUrl' | 'pveFileUrl'>>;

export type PCACropConfig = {
    allAccessions: PCADatasetInfo;
    subsets?: Record<string, PCASubsetInfo>;
};

// Key used in the `?subset=` URL param and dropdown to mean "the full, unfiltered dataset".
export const ALL_ACCESSIONS_SUBSET = 'All Accessions';

export const PCAFileInfo = new Map<string, PCACropConfig>([
    ['Barley', {
        allAccessions: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/260430_AGG-Barley.pcs.txt',
            doiTitle: 'AGG Barley - Release 260430',
            doiUrl: 'https://doi.org/10.7910/DVN/LXU0WD',
            pveFileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/PVE/barley-pve.txt'
        },
    }],
    ['Wheat', {
        allAccessions: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/AGG-Wheat-Release-260619_pcs.txt',
            doiTitle: 'AGG Wheat - Release 260619',
            doiUrl: 'https://doi.org/10.7910/DVN/MOBTA8',
            pveFileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/PVE/wheat-full-pve.txt'
        },
        subsets: {
            'Excluding synthetic wheats and mapping populations': {
                fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/AGG-Wheat-Release-260619_pcs_noSyn_noMappingPop.txt',
                pveFileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/PVE/wheat-nosyn-mapping-pve.txt'
            }
        },
    }],
    ['Lentil', {
        allAccessions: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/lentil-pcs.txt',
            doiTitle: 'AGG Lentil - Release 250228',
            doiUrl: 'https://doi.org/10.7910/DVN/T0TDAS',
            pveFileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/PVE/lentil-pve.txt',
        },
    }],
    ['Field Pea', {
        allAccessions: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/fieldpea-pcs.txt',
            doiTitle: 'AGG Field pea - Release 250801',
            doiUrl: 'https://doi.org/10.7910/DVN/A6WGYS',
            pveFileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/PVE/fieldpea-pve.txt'
        },
    }],
    ['Chickpea', {
        allAccessions: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/chickpea-pcs.txt',
            doiTitle: 'AGG Chickpea - Release 250505',
            doiUrl: 'https://doi.org/10.7910/DVN/ECQ4NC',
            pveFileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/PVE/chickpea-pve.txt'
        },
    }],
    ['Lupin', {
        allAccessions: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/lupin-pcs.txt',
            doiTitle: 'AGG Lupin - Release 251113',
            doiUrl: 'https://doi.org/10.7910/DVN/FVTFIL',
            pveFileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/PVE/lupin-pve.txt'
        },
    }]
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
 * Resolves the fileUrl/doiTitle/doiUrl to use for a given crop + subset.
 * Falls back to the crop's `allAccessions` entry if the crop is unknown or doesn't
 * have the requested subset (e.g. after switching crops), and subsets inherit
 * doiTitle/doiUrl from `allAccessions` when not explicitly overridden.
 */
export function getDatasetInfo(crop: string, subset: string): PCADatasetInfo | undefined {
    const cropConfig = PCAFileInfo.get(crop);
    if (!cropConfig) return undefined;
    if (subset === ALL_ACCESSIONS_SUBSET) return cropConfig.allAccessions;

    const subsetInfo = cropConfig.subsets?.[subset];
    if (!subsetInfo) return cropConfig.allAccessions;

    return {
        fileUrl: subsetInfo.fileUrl,
        doiTitle: subsetInfo.doiTitle ?? cropConfig.allAccessions.doiTitle,
        doiUrl: subsetInfo.doiUrl ?? cropConfig.allAccessions.doiUrl,
        ...(subsetInfo.pveFileUrl !== undefined && { pveFileUrl: subsetInfo.pveFileUrl }),
    };
}
