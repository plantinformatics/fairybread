/**
 * View URL schema
 *
 * Single source of truth for every query param that describes a Data Explorer
 * view. Components read/write these params through the parsers exported here
 * (never by declaring their own `useQueryState` parser), and anything that
 * needs to build or read a view URL outside React uses `serializeView` /
 * `loadView`.
 *
 * Params:
 *  - `file`        crop name, one of `CROPS` (always kept in the URL)
 *  - `subset`      subset name for the crop (see `getSubsetNames`)
 *  - `groupBy`     column accessorKey to colour the plot by, or "textFilter"
 *  - `<field key>` one per filter field, comma-separated values
 *                  (e.g. `?countryOfOrigin.name=Australia,India`)
 *  - `customList`  genotype IDs for the "Custom List" filter
 *  - `nocache`     dev only: bypasses every server cache layer
 *
 * The typed params (`viewParsers`) and the per-field filter params
 * (`filterParsers`) are kept as separate maps because filter keys come from
 * config at runtime and can't be typed alongside the fixed params. Serializers
 * keep params already in their base URL, so chain them to build a full view:
 *
 *   serializeView(serializeFilters('/data-explorer', { region: ['Asia'] }), { file: 'Barley' })
 *
 * Imports come from `nuqs/server` so this module works in server code and
 * tests as well as client components.
 */

import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from 'nuqs/server';
import { ALL_ACCESSIONS_SUBSET, PCAFileInfo } from '@/config/pca-location-config';
import { columns, fields } from '@/config/table-and-filter-config';

export const CROPS = [...PCAFileInfo.keys()];
export const DEFAULT_CROP = 'Wheat';

/** groupBy value used when the plot is coloured by the active text filters. */
export const TEXT_FILTER_GROUP_BY = 'textFilter';
export const DEFAULT_GROUP_BY = 'subRegion';

/** Columns with `enableGrouping`, plus the text-filter grouping, in dropdown order. */
export const GROUP_BY_OPTIONS: { value: string; label: string }[] = [
  ...columns
    .filter((col) => col.enableGrouping === true && typeof col.accessorKey === 'string')
    .map((col) => ({ value: col.accessorKey as string, label: String(col.id) })),
  { value: TEXT_FILTER_GROUP_BY, label: 'Text filter' },
];

/** Filter key for the "Custom List" filter (matches rows by genotypeID). */
export const CUSTOM_LIST_FILTER_KEY = 'customList';

/** Every filter param key, in table filter order. */
export const FILTER_KEYS = [
  ...fields.map((field) => field.key).filter((key): key is string => Boolean(key)),
  CUSTOM_LIST_FILTER_KEY,
];

// Filter changes push history entries so browser back/forward steps through them.
const filterValuesParser = parseAsArrayOf(parseAsString).withOptions({ history: 'push' });

export const filterParsers: Record<string, typeof filterValuesParser> = Object.fromEntries(
  FILTER_KEYS.map((key) => [key, filterValuesParser]),
);

export const viewParsers = {
  // `clearOnDefault: false` keeps `file` in the URL even when it's the default,
  // so shared/bookmarked links always show which crop is selected.
  file: parseAsStringLiteral(CROPS).withDefault(DEFAULT_CROP).withOptions({ clearOnDefault: false }),
  // Subsets are crop-specific; `getDatasetInfo` falls back to all accessions
  // when the subset doesn't exist for the selected crop.
  subset: parseAsString.withDefault(ALL_ACCESSIONS_SUBSET),
  groupBy: parseAsStringLiteral(GROUP_BY_OPTIONS.map((option) => option.value)).withDefault(DEFAULT_GROUP_BY),
  nocache: parseAsString,
};

export type ViewState = inferParserType<typeof viewParsers>;
export type FilterState = inferParserType<typeof filterParsers>;

/** Builds a view URL, e.g. `serializeView('/data-explorer', { file: 'Barley', groupBy: 'region' })`. */
export const serializeView = createSerializer(viewParsers);
export const serializeFilters = createSerializer(filterParsers);

/** Parse params from a URL, `URLSearchParams` or Next `searchParams` object. */
export const loadView = createLoader(viewParsers);
export const loadFilters = createLoader(filterParsers);
