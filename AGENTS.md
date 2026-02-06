# Fairybread Archive

Data visualization tool for PCA analysis of crop genetic data from Genesys.

## Essentials

- **Package Manager**: Bun
- **Dev Command**: `bun run dev` (uses Next.js Turbopack)
- **Build**: `bun run build`
- **Path Aliases**: `@/*` → `./src/*`

## Project Stack

- Next.js 16 (App Router)
- TypeScript (strict mode)
- shadcn/ui (radix-vega style)
- Radix UI primitives (radix-ui)
- ReUI for data grid and filter
- TanStack Table
- Plotly.js for PCA charts
- nuqs for URL state management
- Tailwind CSS 4

## Data Grid & Filters

- Data explorer page: `app/data-explorer/page.tsx`
- Grid + filter UI: `components/filters/nuqs.tsx`
- Filter field config: `config/filter-config.tsx`
- Table column config: `config/table-config.tsx`

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.