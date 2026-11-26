import { describe, expect, it } from 'bun:test';
import { datasetCacheTags, refreshCacheTag } from './cache-tags';

describe('refreshCacheTag', () => {
  const tags = datasetCacheTags('Wheat', 'All Accessions');

  it('targets every crop when no crop is given', () => {
    expect(refreshCacheTag()).toBe(tags[0]);
  });

  it('targets every subset of a crop when no subset is given', () => {
    expect(refreshCacheTag('Wheat')).toBe(tags[1]);
    expect(datasetCacheTags('Barley', 'All Accessions')).not.toContain(refreshCacheTag('Wheat'));
  });

  it('targets a single crop + subset', () => {
    expect(refreshCacheTag('Wheat', 'All Accessions')).toBe(tags[2]);
    expect(datasetCacheTags('Wheat', 'Other')).not.toContain(refreshCacheTag('Wheat', 'All Accessions'));
  });
});
