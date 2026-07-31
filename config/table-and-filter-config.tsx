/**
 * Adding a new field from the Genolink / Genesys API
 * ---------------------------------------------------
 * The `accessorKey` of each column is what gets sent to the Genolink API as a
 * `select` field (see `passportDataSelectFields` at the bottom of this file,
 * consumed by `lib/fetchPCAPassportData.ts`). To add a new column:
 *
 * 1. Find the field name in the Genolink/Genesys accession schema
 *    (https://genolink.plantinformatics.io/ — nested fields use dot notation,
 *    e.g. `countryOfOrigin.name`).
 * 2. Add it to the `PCAPassportData` type below so it is typed end-to-end.
 * 3. Add a new entry to the `columns` array with `accessorKey` set to the
 *    exact API field name. Provide an `id`, `header`, and `meta.filter` config
 *    (label + lucide icon). For nested fields also set `accessorFn` (see the
 *    "Country of Origin" / "Taxonomy" entries as templates).
 */

import type { CellContext, ColumnDef, HeaderContext, RowData } from "@tanstack/react-table"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import type { FilterFieldConfig } from "@/components/reui/filters"

declare module "@tanstack/react-table" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface TableMeta<TData extends RowData> {
        /** The `accessorKey` the table/plot is currently grouped by (or "textFilter"). */
        groupBy?: string
        /** Column `accessorKey`s that currently have a non-empty table filter. */
        activeFilterFields?: string[]
        /**
         * Per-column colour maps (`accessorKey` → `genotypeID` → colour).
         * Built for the active group-by column and any filtered columns.
         */
        columnColorMaps?: Map<string, Map<string, string>>
    }
}

import { 
    BookOpenText,
    Fingerprint,
    Globe,
    Hash,
    Landmark,
    Map as MapIcon,
    MapPinned,
    Sprout,
    Tag,
    UserRound,
} from "lucide-react"

export type PCAPassportData = {
    "accessionName": string
    "accessionNumber": string
    "countryOfOrigin.name": string
    "doi": string
    "donorName": string
    "genotypeID": string
    "pca": {
        "FID": string
        "IID": string
        "PC1": string
        "PC2": string
        "PC3": string
        "PC4": string
        "PC5": string
        "PC6": string
        "PC7": string
        "PC8": string
        "PC9": string
        "PC10": string
    }
    "region": string
    "subRegion": string
    "taxonomy.taxonName": string
    "sampStat": string
}

/** Same-sized colour swatch used in active column cells and headers. */
function GroupColorDot({ color }: { color: string }) {
    return (
        <span
            className="inline-block size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden="true"
        />
    )
}

/** True when this column is the active group-by, or has a non-empty table filter. */
function isColumnHighlighted(
    table: HeaderContext<PCAPassportData, unknown>["table"] | CellContext<PCAPassportData, unknown>["table"],
    accessorKey: string,
): boolean {
    const meta = table.options.meta
    return (
        meta?.groupBy === accessorKey ||
        (meta?.activeFilterFields?.includes(accessorKey) ?? false)
    )
}

function getColumnDotColor(
    table: CellContext<PCAPassportData, unknown>["table"],
    accessorKey: string,
    genotypeID: string,
): string | undefined {
    if (!isColumnHighlighted(table, accessorKey)) return undefined
    return table.options.meta?.columnColorMaps?.get(accessorKey)?.get(genotypeID)
}

/**
 * Header that bolds when this column is the active group-by, or when a table
 * filter is applied on this column.
 */
const renderActiveColumnHeader = (accessorKey: string, title: string) =>
    ({ column, table }: HeaderContext<PCAPassportData, unknown>) => {
        const isActive = isColumnHighlighted(table, accessorKey)

        return (
            <DataGridColumnHeader
                column={column}
                title={title}
                visibility
                className={isActive ? "font-bold text-foreground" : undefined}
            />
        )
    }

/**
 * Cell prefixed with a colour dot when this column is highlighted (active
 * group-by or filtered) — colour matches the group's palette assignment.
 * `min-w-0 break-words` keeps long values (e.g. accession names) wrapping
 * inside the fixed-width cell instead of overflowing.
 */
const renderActiveColumnCell = (accessorKey: string) =>
    ({ row, table, getValue }: CellContext<PCAPassportData, unknown>) => {
        const color = getColumnDotColor(table, accessorKey, row.original.genotypeID)
        return (
            <span className="flex min-w-0 items-center gap-2">
                {color && <GroupColorDot color={color} />}
                <span className="min-w-0 break-words">{getValue() as string}</span>
            </span>
        )
    }

type ColumnMeta = {
    filter?: Omit<FilterFieldConfig, "key" | "label"> & {
        label?: string
        include?: boolean
    }
}

type FilterableColumnDef = ColumnDef<PCAPassportData> & {
    accessorKey?: string
    meta?: ColumnMeta
}

export const columns: FilterableColumnDef[] = [
    {
        id: "Genotype ID",
        accessorKey: "genotypeID",
        header: renderActiveColumnHeader("genotypeID", "Genotype ID"),
        cell: renderActiveColumnCell("genotypeID"),
        meta: {
            filter: {
                type: "text",
                label: "Genotype ID",
                icon: <Fingerprint className="size-3.5" />,
            },
        },
    },
    {
        id: "Accession Number",
        accessorKey: "accessionNumber",
        header: renderActiveColumnHeader("accessionNumber", "Accession Number"),
        cell: ({ row, table }) => {
            // genesys uses the doi as the URL not the accession number
            const color = getColumnDotColor(table, "accessionNumber", row.original.genotypeID)
            return (
                <span className="flex min-w-0 items-center gap-2">
                    {color && <GroupColorDot color={color} />}
                    <a
                        href={"https://www.genesys-pgr.org/" + row.original.doi as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 break-words font-bold underline-offset-4 hover:underline"
                    >
                      {row.original.accessionNumber as string}
                    </a>
                </span>
            )
        },
        meta: {
            filter: {
                type: "text",
                label: "Accession Number",
                icon: <Hash className="size-3.5" />,
            },
        },
    },
    {
        id: "Accession Name",
        accessorKey: "accessionName",
        header: renderActiveColumnHeader("accessionName", "Accession Name"),
        cell: renderActiveColumnCell("accessionName"),
        meta: {
            filter: {
                type: "text",
                label: "Accession Name",
                icon: <BookOpenText className="size-3.5" />,
            },
        },
    },
    {
        id: "Country of Origin",
        header: renderActiveColumnHeader("countryOfOrigin.name", "Country of Origin"),
        accessorFn: (row) => row["countryOfOrigin.name"],
        accessorKey: "countryOfOrigin.name",
        // Uncommon implamentation of having accessor key and accessor function, could lead to unepxected behaviour
        sortingFn: 'text',
        enableGrouping: true,
        cell: renderActiveColumnCell("countryOfOrigin.name"),
        meta: {
            filter: {
                type: "text",
                label: "Country of Origin",
                icon: <Globe className="size-3.5" />,
            },
        },
    },
    {
        id: "Region",
        accessorKey: "region",
        header: renderActiveColumnHeader("region", "Region"),
        enableGrouping: true,
        cell: renderActiveColumnCell("region"),
        meta: {
            filter: {
                type: "text",
                label: "Region",
                icon: <MapPinned className="size-3.5" />,
            },
        },
    },
    {
        id: "Sub-Region",
        accessorKey: "subRegion",
        header: renderActiveColumnHeader("subRegion", "Sub-Region"),
        enableGrouping: true,
        cell: renderActiveColumnCell("subRegion"),
        meta: {
            filter: {
                type: "text",
                label: "Sub-Region",
                icon: <MapIcon className="size-3.5" />,
            },
        },
    },
    {
        id: "DOI",
        accessorKey: "doi",
        header: "DOI",
        cell: ({ getValue }) => (
            <a
                href={"https://doi.org/" +getValue() as string}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline-offset-4 hover:underline"
            >
              {getValue() as string}
            </a>
        ),
        enableSorting: false,
        meta: {
            filter: {
                type: "text",
                label: "DOI",
                include: false,
            },
        },
    },
    {
        id: "Taxonomy",
        header: renderActiveColumnHeader("taxonomy.taxonName", "Taxonomy"),
        accessorFn: (row) => row["taxonomy.taxonName"],
        accessorKey: "taxonomy.taxonName",
        cell: renderActiveColumnCell("taxonomy.taxonName"),
        meta: {
            filter: {
                type: "text",
                label: "Taxonomy",
                icon: <Landmark className="size-3.5" />,
            },
        },
    },
    {
        id: "Donor Name",
        header: renderActiveColumnHeader("donorName", "Donor Name"),
        accessorKey: "donorName",
        enableGrouping: true,
        cell: renderActiveColumnCell("donorName"),
        meta: {
            filter: {
                type: "text",
                label: "Donor Name",
                icon: <UserRound className="size-3.5" />,
            },
        },
    },
    {
        id: "Biological status",
        header: renderActiveColumnHeader("sampStat", "Biological status"),
        accessorKey: "sampStat",
        enableGrouping: true,
        cell: renderActiveColumnCell("sampStat"),
        meta: {
            filter: {
                type: "text",
                label: "Biological status",
                icon: <Sprout className="size-3.5" />,
            },
        },
    }
]

export const passportDataSelectFields = columns
    .map((column) => column.accessorKey)
    .filter((key): key is string => typeof key === "string")

export const fields: FilterFieldConfig[] = columns
    .filter((column) => {
        const filter = column.meta?.filter
        if (filter?.include === false) return false
        return typeof column.accessorKey === "string"
    })
    .map((column) => {
        const filter = column.meta?.filter
        const key = column.accessorKey as string
        return {
            key,
            label: filter?.label ?? String(column.id ?? key),
            type: filter?.type ?? "text",
            icon: filter?.icon,
            placeholder: filter?.placeholder ?? `Filter ${String(column.id ?? key)}...`,
            defaultOperator: filter?.defaultOperator ?? "contains",
            className: filter?.className ?? "w-40",
        } satisfies FilterFieldConfig
    })
    
