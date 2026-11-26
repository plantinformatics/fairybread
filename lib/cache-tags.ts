const DATASET_TAG = 'dataset';

/**
 * Cache tags attached to everything cached for one crop + subset (PCA/PVE files and Genolink
 * passport pages), from broadest to most specific, so a refresh can target every crop, one
 * crop, or one subset.
 */
export function datasetCacheTags(crop: string, subset: string): string[] {
  return [DATASET_TAG, `${DATASET_TAG}-${crop}`, `${DATASET_TAG}-${crop}-${subset}`];
}

/** The tag that expires the chosen scope. Omit `crop` for every crop, `subset` for every subset of the crop. */
export function refreshCacheTag(crop?: string, subset?: string): string {
  const tags = datasetCacheTags(crop ?? '', subset ?? '');
  if (!crop) return tags[0];
  return subset ? tags[2] : tags[1];
}
