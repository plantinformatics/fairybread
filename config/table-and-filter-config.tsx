import type { CellContext, ColumnDef, HeaderContext, RowData } from "@tanstack/react-table"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import type { FilterFieldConfig } from "@/components/reui/filters"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { doiUrl, genesysAccessionUrl } from "@/lib/accession-links"
import { TEXT_FILTER_GROUP_BY } from "@/lib/dataProcessing"

declare module "@tanstack/react-table" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface TableMeta<TData extends RowData> {
        /** The `accessorKey` the table/plot is currently grouped by (or `TEXT_FILTER_GROUP_BY`). */
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
    Layers,
    Map as MapIcon,
    MapPinned,
    Sprout,
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
    /** Genolink subset titles the accession belongs to, joined with "; " (see `joinListFields`). */
    "subsets.title": string
    /** The accession's other genotype IDs in this dataset, when it was genotyped more than once (see `mergePassportByAccession`). */
    "otherGenotypeIDs"?: string[]
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

/** `min-w-0 break-words` wraps long values (e.g. accession names) inside the fixed-width cell. */
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

/**
 * Genotype ID shown in purple when its accession was genotyped more than once. The tooltip lists
 * the accession's other genotype IDs, which share this row's passport data but have their own PCA point.
 */
function MultiRunGenotypeId({ genotypeID, otherGenotypeIDs }: { genotypeID: string; otherGenotypeIDs: string[] }) {
    return (
        <Tooltip>
            <TooltipTrigger
                delay={150}
                render={
                    <span className="min-w-0 cursor-help break-words text-purple-600 underline decoration-dotted underline-offset-4 dark:text-purple-400">
                        {genotypeID}
                    </span>
                }
            />
            <TooltipContent>
                <p className="font-semibold">Accession genotyped {otherGenotypeIDs.length + 1} times. Other genotype IDs:</p>
                {otherGenotypeIDs.map((id) => <p key={id}>{id}</p>)}
            </TooltipContent>
        </Tooltip>
    )
}

type ColumnMeta = {
    filter?: Omit<FilterFieldConfig, "key" | "label"> & {
        label?: string
        include?: boolean
    }
}

type FilterableColumnDef = ColumnDef<PCAPassportData> & {
    /** Also sent to Genolink as a `select` field, so it must be a real API field name. */
    accessorKey?: keyof PCAPassportData
    meta?: ColumnMeta
}

export const columns: FilterableColumnDef[] = [
    {
        id: "Genotype ID",
        accessorKey: "genotypeID",
        header: renderActiveColumnHeader("genotypeID", "Genotype ID"),
        cell: ({ row, table }) => {
            const color = getColumnDotColor(table, "genotypeID", row.original.genotypeID)
            const { otherGenotypeIDs } = row.original
            return (
                <span className="flex min-w-0 items-center gap-2">
                    {color && <GroupColorDot color={color} />}
                    {otherGenotypeIDs
                        ? <MultiRunGenotypeId genotypeID={row.original.genotypeID} otherGenotypeIDs={otherGenotypeIDs} />
                        : <span className="min-w-0 break-words">{row.original.genotypeID}</span>}
                </span>
            )
        },
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
            const color = getColumnDotColor(table, "accessionNumber", row.original.genotypeID)
            return (
                <span className="flex min-w-0 items-center gap-2">
                    {color && <GroupColorDot color={color} />}
                    <a
                        href={genesysAccessionUrl(row.original.doi)}
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
                href={doiUrl(getValue() as string)}
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
    },
    {
        id: "Subsets",
        header: renderActiveColumnHeader("subsets.title", "Subsets"),
        accessorFn: (row) => row["subsets.title"],
        accessorKey: "subsets.title",
        enableGrouping: true,
        cell: renderActiveColumnCell("subsets.title"),
        meta: {
            filter: {
                type: "text",
                label: "Subsets",
                icon: <Layers className="size-3.5" />,
            },
        },
    },
]

export const passportDataSelectFields = columns
    .map((column) => column.accessorKey)
    .filter((key) => key !== undefined)

export const fields: FilterFieldConfig[] = columns
    .filter((column) => column.accessorKey !== undefined && column.meta?.filter?.include !== false)
    .map((column) => {
        const filter = column.meta?.filter
        const key = column.accessorKey!
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

/** Display name for a group-by value: the column's name, or "Text filter". */
export function groupByLabel(groupBy: string): string {
    if (groupBy === TEXT_FILTER_GROUP_BY) return "Text filter"
    const column = columns.find((col) => col.accessorKey === groupBy)
    return column?.id ?? groupBy
}
