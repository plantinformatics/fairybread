# Fairybread - Web based PCA Viewer

## Introduction to Fairybread

Fairybread is an open source web app for exploring Principal Component Analysis (PCA) data for crop germplasm collections. It combines PCA coordinate files with passport metadata sourced from [Genesys](https://www.genesys-pgr.org/) via the [Genolink API](https://genolink.plantinformatics.io/) so researchers can inspect diversity patterns in both a chart and a table.

Use the online version with pre-loaded datasets at [fairybread.plantinformatics.io](https://fairybread.plantinformatics.io).

## What It Does

- Renders an interactive PCA scatter plot with lasso selection and zoom/pan
- Displays linked passport records in a filterable, sortable, column-configurable table
- Keeps chart and table in sync in both directions (plot selection filters table, table filters affect plot groups)
- Persists key UI state in the URL query string for shareable views (unstable)
- Supports multiple grouping dimensions and chart palettes
- Accepts a user-defined custom accession list to look up and review records within a chosen crop dataset


<img width="2543" height="1222" alt="Screenshot 2026-04-13 at 1 15 10 pm" src="https://github.com/user-attachments/assets/e4078368-4ca3-4e2f-88e9-e4e3024941bc" />

## Quick links

- [Documentation](#introduction-to-fairybread) — full documentation site coming later
- [Changelog / Releases](https://github.com/kennyAgricultureVic/fairybread/releases)
- [Data sources](#data-sources)
- [Installation (for development)](#installation-for-development)

## Data Sources

Fairybread currently supports the crops below. PCA coordinates for each crop are derived from the corresponding public dataset (Harvard Dataverse DOI); passport metadata comes from Genesys via Genolink as described above.

| Crop | Dataset | Public dataset (DOI) |
|------|---------|------------------------|
| Wheat | All Accessions (AGG + CAIGE, merged) | [10.7910/DVN/MOBTA8](https://doi.org/10.7910/DVN/MOBTA8), [10.7910/DVN/SYYSDN](https://doi.org/10.7910/DVN/SYYSDN), [10.7910/DVN/7HVYFQ](https://doi.org/10.7910/DVN/7HVYFQ), [10.7910/DVN/BI1HIU](https://doi.org/10.7910/DVN/BI1HIU) |
| Barley | All Accessions (AGG + CAIGE, merged) | [10.7910/DVN/LXU0WD](https://doi.org/10.7910/DVN/LXU0WD), [10.7910/DVN/AMFC6F](https://doi.org/10.7910/DVN/AMFC6F), [10.7910/DVN/NIPYNS](https://doi.org/10.7910/DVN/NIPYNS) |
| Barley | AGG accessions only | [10.7910/DVN/LXU0WD](https://doi.org/10.7910/DVN/LXU0WD) |
| Chickpea | All Accessions | [10.7910/DVN/ECQ4NC](https://doi.org/10.7910/DVN/ECQ4NC) |
| Field Pea | All Accessions | [10.7910/DVN/A6WGYS](https://doi.org/10.7910/DVN/A6WGYS) |
| Lentil | All Accessions | [10.7910/DVN/T0TDAS](https://doi.org/10.7910/DVN/T0TDAS) |
| Lupin | All Accessions | [10.7910/DVN/FVTFIL](https://doi.org/10.7910/DVN/FVTFIL) |

PCA coordinate files are loaded from hosted TSV/TXT assets and joined with passport records fetched from Genesys via Genolink.


## Installation (For development)

### Prerequisites

- Node.js 20+
- Any one package manager: `bun`, `npm`, `pnpm`, or `yarn`

### Install

```bash
bun install
```

Or:

```bash
npm install
pnpm install
yarn install
```

### Run Dev Server

```bash
bun run dev
```

Or:

```bash
npm run dev
pnpm dev
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/data-explorer`.

### Build + Start

```bash
bun run build
bun run start
```

Or:

```bash
npm run build
npm run start
```

### Lint

```bash
bun run lint
```

### Check which accessions are missing passport data

Some genotype IDs in a PCA file get no passport record from Genolink, so they don't appear in the plot or table. This includes IDs that aren't in AGG format (e.g. reference varieties like `Fathom-B00046-11-92`), which are skipped before querying. To list them:

```bash
bun run missing-passport                                  # every crop and subset
bun run missing-passport Barley                           # one crop, all its subsets
bun run missing-passport Barley "AGG accessions only"   # one dataset
```

Writes one TSV per dataset to `logs/missing-passport-<crop>-<subset>.tsv` (gitignored) with columns `genotypeID`, `inAllAccessions` (whether the ID is also in the crop's full dataset) and `reason`.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Plotly (`react-plotly.js`) for PCA visualization
- TanStack Table for tabular exploration
- `nuqs` for URL-synced state
- Tailwind CSS 4 + shadcn/ui components
- `reUI` components for advanced table, filter, and data-grid UX

## How It Works

1. The app redirects `/` to `/data-explorer`
2. A selected crop file is read from the `file` URL param (default: `Wheat`)
3. PCA coordinates are fetched and parsed
4. Genotype IDs are batched into paged Genolink requests
5. Passport rows are normalized and merged with PCA rows by genotype ID
6. Resulting merged rows drive both the Plotly chart and TanStack table

Server-side fetches use Next.js caching to reduce repeated API calls.

### Custom Accession List (`/custom-list`)

The Custom List page lets a user look up a hand-picked set of accessions within a chosen crop dataset:

1. Select a crop — this loads the same merged PCA + passport dataset used by the Data Explorer
2. Paste accession names or numbers into the text area (plain line-separated list or TSV; first column used, no header expected)
3. Click **Parse** — input is matched case-insensitively against `accessionName` and `accessionNumber`
4. **Matched** records are shown in a summary table; **Unmatched** terms are listed separately so missing or misspelled names are easy to spot
5. The result set is scoped to the selected crop — changing the crop clears the results

## Project Notes

- No local `.env` configuration is required for core usage.

### Data file naming

PCA and PVE files are hosted in the project's Vercel Blob store and must be named:

```
<crop>-<release>-<subset>.<pcs|pve>.txt
```

- `<crop>`: lowercase kebab-case crop name (`wheat`, `field-pea`)
- `<release>`: the source dataset's six-digit release (`YYMMDD`, e.g. `260430`)
- `<subset>`: `all` for the full dataset, otherwise a short kebab-case description of the subset (`no-synthetics-no-mapping-pops`). Merged datasets name every source and its release, e.g. `barley-260430-plus-caige-260925.pcs.txt`
- `pcs` = PCA coordinates, `pve` = proportion of variance explained

Upload with no random suffix (`addRandomSuffix: false`) so the URL matches the file name, then reference it with `blobUrl('<file name>')` in `config/pca-location-config.ts`. A test in `config/pca-location-config.test.ts` enforces the format.

### Adding a new crop

Add an entry to the `PCAFileInfo` map in `config/pca-location-config.ts`:

```ts
['<Crop Name>', {
    allAccessions: {
        fileUrl: blobUrl('<crop>-<release>-all.pcs.txt'),
        citations: [{ title: '<Dataset title shown in the UI>', doiUrl: 'https://doi.org/<DOI>' }],
        pveFileUrl: blobUrl('<crop>-<release>-all.pve.txt'), // optional
    },
}],
```

- The map key (e.g. `'Wheat'`) is what's used in the `?file=` URL param on `/data-explorer`.
- `allAccessions.fileUrl` must point to a tab-separated PCA file with at least an `IID` column plus `PC1`–`PC10` columns (genotype IDs in `IID` are used to fetch passport metadata from Genolink).
- Once added, the crop appears automatically in the crop selector — no other changes required.
- Also update the **Data Sources** table above so the README reflects supported crops.

### Adding a subset

Each crop can have any number of subsets — e.g. a filtered/regional cut of the full PCA file. Add them under the crop's `subsets` map:

```ts
['<Crop Name>', {
    allAccessions: { fileUrl: '...', citations: [...] },
    subsets: {
        '<Subset Name>': {
            fileUrl: blobUrl('<crop>-<release>-<subset>.pcs.txt'),
            // citations is optional — omit to inherit from `allAccessions`.
            // pveFileUrl is NOT inherited — set it if the subset has its own PVE file.
        },
    },
}],
```

- The subset key (e.g. `'<Subset Name>'`) is what's used in the `?subset=` URL param, and is what appears in the subset dropdown next to the crop dropdown in the breadcrumb (`"All Accessions"` is always the first option and needs no config).
- Merged datasets (built from more than one source) list every source in `citations`, primary first. The UI links the first one and shows a `+N` menu with the rest.
- Subsets are scoped per crop — switching crop while on a subset name that doesn't exist for the new crop silently falls back to `"All Accessions"` data (the dropdown just won't show that name as an option for the new crop).

### Adding a new passport field from the Genolink / Genesys API

Edit `config/table-and-filter-config.tsx`: extend the `PCAPassportData` type and add a column entry whose `accessorKey` matches the API field name (dot notation for nested fields, e.g. `countryOfOrigin.name`). The `accessorKey`s are automatically forwarded to Genolink as the `select` param, rendered in the table, and exposed as filters. See the comment at the top of that file for a step-by-step.

## Acknowledgements
FairyBread is funded by the Australian Grains Genebank (AGG) Strategic Partnership, a $30M joint investment between the Victorian State Government and the Grains Research and Development Corporation (GRDC) that aims to unlock the genetic potential of plant genetic resources for the benefit of Australian grain growers.

## License

GPL-3.0 license for further details see [LICENSE](./LICENSE).
