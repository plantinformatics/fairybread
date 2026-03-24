# Fairybread

Fairybread is a Next.js app for exploring Principal Component Analysis (PCA) data for crop germplasm collections. It combines PCA coordinate files with passport metadata sourced from [Genesys](https://www.genesys-pgr.org/) via the [Genolink API](https://genolink.plantinformatics.io/) so researchers can inspect diversity patterns in both a chart and a table.

## What It Does

- Renders an interactive PCA scatter plot with lasso selection and zoom/pan
- Displays linked passport records in a filterable, sortable, column-configurable table
- Keeps chart and table in sync in both directions (plot selection filters table, table filters affect plot groups)
- Persists key UI state in the URL query string for shareable views (unstable)
- Supports multiple grouping dimensions and chart palettes

## Data Sources

Fairybread currently supports:

- Wheat - [10.7910/DVN/CRSI0B](https://doi.org/10.7910/DVN/CRSI0B)
- Barley - [10.7910/DVN/H6SNVM](https://doi.org/10.7910/DVN/H6SNVM)
- Chickpea - [10.7910/DVN/ECQ4NC](https://doi.org/10.7910/DVN/ECQ4NC)
- Field Pea - [10.7910/DVN/A6WGYS](https://doi.org/10.7910/DVN/A6WGYS)
- Lentil - [10.7910/DVN/T0TDAS](https://doi.org/10.7910/DVN/T0TDAS)
- Lupin - [10.7910/DVN/FVTFIL](https://doi.org/10.7910/DVN/FVTFIL)

PCA coordinate files are loaded from hosted TSV/TXT assets and joined with passport records fetched from Genesys via Genolink.

## How It Works

1. The app redirects `/` to `/data-explorer`
2. A selected crop file is read from the `file` URL param (default: `Wheat`)
3. PCA coordinates are fetched and parsed
4. Genotype IDs are batched into paged Genolink requests
5. Passport rows are normalized and merged with PCA rows by genotype ID
6. Resulting merged rows drive both the Plotly chart and TanStack table

Server-side fetches use Next.js caching to reduce repeated API calls.

## URL State

The data explorer stores key state in query params:

- `file` - selected crop dataset
- `groupBy` - chart grouping field (for example `subRegion`)
- `palette` - chart color palette

This allows links to preserve the selected data + view configuration.

## Getting Started

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
# pnpm install
# yarn install
```

### Run Dev Server

```bash
bun run dev
```

Or:

```bash
npm run dev
# pnpm dev
# yarn dev
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

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Plotly (`react-plotly.js`) for PCA visualization
- TanStack Table for tabular exploration
- `nuqs` for URL-synced state
- Tailwind CSS 4 + shadcn/ui components
- `reUI` components for advanced table, filter, and data-grid UX

## Project Notes

- No local `.env` configuration is required for core usage.
- If you add a new crop, update `config/pca-location-config.ts` with its file URL and DOI metadata.

## License

See [LICENSE](./LICENSE).
