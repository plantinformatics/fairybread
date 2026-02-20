# Fairybread Archive

Data visualization tool for PCA analysis of crop genetic data from Genesys.

## Essentials

- **Package Manager**: Bun
- **Dev Command**: `bun run dev` (uses Next.js Turbopack)
- **Build**: `bun run build`
- **Path Aliases**: `@/*` → `./*`, `./src/*`

## Project Stack

- Next.js 16 (App Router)
- TypeScript (strict mode)
- shadcn/ui + Base UI primitives (`@base-ui/react`)
- ReUI for data grid + filters
- TanStack Table
- Plotly.js for PCA charts
- nuqs for URL state management
- Tailwind CSS 4

## Data Grid & Filters

- Data explorer page: `app/data-explorer/page.tsx`
- Grid + filter UI: `components/filters/nuqs.tsx`
- Combined table/filter config: `config/table-and-filter-config.tsx`

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.