'use server';

import { updateTag } from 'next/cache';
import { PCAFileInfo, getSubsetNames } from '@/config/pca-location-config';
import { refreshCacheTag } from '@/lib/cache-tags';

/**
 * Expires the cached PCA/PVE files and Genolink passport data for every crop, one crop, or one
 * crop + subset, so the next load fetches them fresh. `updateTag` (not `revalidateTag`) so the
 * next request waits for new data instead of being served the stale copy once more.
 */
export async function refreshDatasetCache(crop?: string, subset?: string): Promise<void> {
  if (crop && !PCAFileInfo.has(crop)) throw new Error(`Unknown crop: ${crop}`);
  if (crop && subset && !getSubsetNames(crop).includes(subset)) throw new Error(`Unknown subset: ${subset}`);
  updateTag(refreshCacheTag(crop, subset));
}
