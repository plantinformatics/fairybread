import { createSerializer, parseAsArrayOf, parseAsString } from 'nuqs';
import { ALL_ACCESSIONS_SUBSET } from '@/config/pca-location-config';

export const CUSTOM_LIST_FILTER_KEY = 'customList';

/** Parser for every table filter field: the selected values, `?field=a,b`. */
export const filterValuesParser = parseAsArrayOf(parseAsString);

/** Every URL search param the app reads, keyed by its URL key. */
export const searchParams = {
  // Kept in the URL even at its default so shared links always name the crop.
  file: parseAsString.withDefault('Wheat').withOptions({ clearOnDefault: false }),
  subset: parseAsString.withDefault(ALL_ACCESSIONS_SUBSET),
  groupBy: parseAsString.withDefault('subRegion'),
  // `?nocache=1` is forwarded to the API to bypass every server cache layer.
  nocache: parseAsString,
  [CUSTOM_LIST_FILTER_KEY]: filterValuesParser,
};

/** Writes every value it's given into the URL, defaults included. */
export const serializeSearchParams = createSerializer(searchParams, { clearOnDefault: false });
