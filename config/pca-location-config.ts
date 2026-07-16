export type PCADatasetInfo = {
    fileUrl: string;
    doiTitle: string;
    doiUrl: string;
};

// Subsets can omit doiTitle/doiUrl to inherit the citation from the crop's `original` entry.
type PCASubsetInfo = Pick<PCADatasetInfo, 'fileUrl'> & Partial<Pick<PCADatasetInfo, 'doiTitle' | 'doiUrl'>>;

export type PCACropConfig = {
    original: PCADatasetInfo;
    subsets?: Record<string, PCASubsetInfo>;
};

// Key used in the `?subset=` URL param and dropdown to mean "the full, unfiltered dataset".
export const ORIGINAL_SUBSET = 'Original';

export const PCAFileInfo = new Map<string, PCACropConfig>([
    ['Barley', {
        original: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/260430_AGG-Barley.pcs.txt',
            doiTitle: 'AGG Barley - Release 260430',
            doiUrl: 'https://doi.org/10.7910/DVN/LXU0WD'
        },
    }],
    ['Wheat', {
        original: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/AGG-Wheat-Release-260619_pcs.txt',
            doiTitle: 'AGG Wheat - Release 260619',
            doiUrl: 'https://doi.org/10.7910/DVN/MOBTA8'
        },
        subsets: {
            'Excluding synthetic wheats and mapping populations': {
                fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/AGG-Wheat-Release-260619_pcs_noSyn_noMappingPop.txt'
            }
        },
    }],
    ['Lentil', {
        original: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/lentil-pcs.txt',
            doiTitle: 'AGG Lentil - Release 250228',
            doiUrl: 'https://doi.org/10.7910/DVN/T0TDAS'
        },
    }],
    ['Field Pea', {
        original: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/fieldpea-pcs.txt',
            doiTitle: 'AGG Field pea - Release 250801',
            doiUrl: 'https://doi.org/10.7910/DVN/A6WGYS'
        },
    }],
    ['Chickpea', {
        original: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/chickpea-pcs.txt',
            doiTitle: 'AGG Chickpea - Release 250505',
            doiUrl: 'https://doi.org/10.7910/DVN/ECQ4NC'
        },
    }],
    ['Lupin', {
        original: {
            fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/lupin-pcs.txt',
            doiTitle: 'AGG Lupin - Release 251113',
            doiUrl: 'https://doi.org/10.7910/DVN/FVTFIL'
        },
    }]
]);

/**
 * All selectable subset names for a crop, always starting with `ORIGINAL_SUBSET`
 * followed by any configured subsets (in declaration order).
 */
export function getSubsetNames(crop: string): string[] {
    const cropConfig = PCAFileInfo.get(crop);
    return [ORIGINAL_SUBSET, ...Object.keys(cropConfig?.subsets ?? {})];
}

/**
 * Resolves the fileUrl/doiTitle/doiUrl to use for a given crop + subset.
 * Falls back to the crop's `original` entry if the crop is unknown or doesn't
 * have the requested subset (e.g. after switching crops), and subsets inherit
 * doiTitle/doiUrl from `original` when not explicitly overridden.
 */
export function getDatasetInfo(crop: string, subset: string): PCADatasetInfo | undefined {
    const cropConfig = PCAFileInfo.get(crop);
    if (!cropConfig) return undefined;
    if (subset === ORIGINAL_SUBSET) return cropConfig.original;

    const subsetInfo = cropConfig.subsets?.[subset];
    if (!subsetInfo) return cropConfig.original;

    return {
        fileUrl: subsetInfo.fileUrl,
        doiTitle: subsetInfo.doiTitle ?? cropConfig.original.doiTitle,
        doiUrl: subsetInfo.doiUrl ?? cropConfig.original.doiUrl,
    };
}
