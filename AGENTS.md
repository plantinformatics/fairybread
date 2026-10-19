## General guidelines

- Before making any changes, check to see if the main branch is up to date with a git pull.
- Avoid killing and starting processes. The development enviroment is already set up. If it isn't ask me to start them up. 
- Avoid the use of wrapper functions to avoid the changing of existing function names.
- This is a pre-production application, backwards compatability between verions does not matter.
- Be bold with larger changes if it meaningfully improves efficiency to code readability.
- End every run with three headings: Blocked on me, Changed, Found when you to make code changes.
- Don't follow the ending rule when I am just asking questions.


## Frontend specific

### shadcn

This project uses shadcn for other general purpose UI components.

When my requests require a new UI component check the shadcn skill to see if there are any existing components that can be used and then modified.

## Project map

Next.js 16 App Router, React 19, Tailwind 4, shadcn/reui components, Plotly, TanStack Table, nuqs for URL state.

Data flow:
1. `context/pca-data-context.tsx` reads `?file=` / `?subset=` and calls `GET /api/pca-passport-data`
2. `app/api/pca-passport-data/route.ts` calls `lib/fetchPCAPassportData.ts`
3. That fetches the PCA TSV (URLs in `config/pca-location-config.ts`), pages genotype IDs to the Genolink API, and merges passport rows with PCA rows by genotype ID. Cached for a day via Next fetch cache / `unstable_cache`
4. Merged rows feed the plot (`components/data-explorer/pca-plot.tsx`, traces from `lib/dataProcessing.ts`) and table (`components/data-explorer/pca-table.tsx`, filtering in `lib/filter-engine.ts` + `hooks/use-table-filters.ts`)

Where things live:
- `app/data-explorer`, `app/custom-list`, `app/settings`: real pages. Other `app/*` pages are component demos
- `config/`: crops and datasets, table columns and filters (columns drive the Genolink `select` param), chart palettes
- `context/`: shared client state (data, preferences, custom list, theme)
- `lib/`: pure logic. New logic that can be pure should go here with a colocated `*.test.ts`
- `components/ui`, `components/reui`: vendored component libraries. Avoid editing unless fixing a bug in them
- README covers adding crops, subsets and passport fields

## Before calling a change done

- `bun run check` (typecheck + tests) must pass. CI also runs `bun run build`
- `bun run lint` has pre-existing `no-explicit-any` errors. Don't add new ones
- Keep each feature to one PR so it can be undone with a single `git revert`