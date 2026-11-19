import { describe, expect, test } from 'bun:test';
import { ALL_ACCESSIONS_SUBSET, PCAFileInfo, getDatasetInfo } from './pca-location-config';

const FILE_NAME_FORMAT = /^[a-z-]+-\d{6}-[a-z0-9-]+\.(pcs|pve)\.txt$/;

describe('getDatasetInfo', () => {
    test('merged subset lists every source citation, primary first', () => {
        const info = getDatasetInfo('Barley', 'Plus CAIGE accessions');
        expect(info?.citations.map((c) => c.doiUrl)).toEqual([
            'https://doi.org/10.7910/DVN/LXU0WD',
            'https://doi.org/10.7910/DVN/AMFC6F',
            'https://doi.org/10.7910/DVN/NIPYNS',
        ]);
    });

    test('subset without citations inherits them from allAccessions', () => {
        const subset = getDatasetInfo('Wheat', 'Excluding synthetic wheats and mapping populations');
        expect(subset?.citations).toEqual(getDatasetInfo('Wheat', ALL_ACCESSIONS_SUBSET)!.citations);
    });

    test('unknown subset falls back to allAccessions', () => {
        expect(getDatasetInfo('Lupin', 'Nope')).toBe(PCAFileInfo.get('Lupin')!.allAccessions);
    });
});

test('every data file follows <crop>-<release>-<subset>.<pcs|pve>.txt', () => {
    const urls = [...PCAFileInfo.values()].flatMap((crop) =>
        [crop.allAccessions, ...Object.values(crop.subsets ?? {})].flatMap((d) => [d.fileUrl, d.pveFileUrl ?? []].flat()),
    );
    for (const url of urls) expect(url.split('/').pop()).toMatch(FILE_NAME_FORMAT);
});
