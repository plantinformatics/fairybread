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

import { Column, ColumnDef } from "@tanstack/react-table"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import type { FilterFieldConfig } from "@/components/reui/filters"

import { 
    BookOpenText,
    Fingerprint,
    Globe,
    Hash,
    Landmark,
    Map,
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

const addSortingDropdownFn = (column: Column<PCAPassportData>, accessorKey: string) => {
    return (
        <DataGridColumnHeader column={column} title={accessorKey} visibility />
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
        header: ({column}) => addSortingDropdownFn(column,"Genotype ID"),
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
        header: ({column}) => addSortingDropdownFn(column,"Accession Number"),
        cell: ({ row }) => {
            // genesys uses the doi as the URL not the accession number
            return (
                <a
                    href={"https://www.genesys-pgr.org/" + row.original.doi as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline-offset-4 hover:underline"
                >
                  {row.original.accessionNumber as string}
                </a>
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
        header: ({column}) => addSortingDropdownFn(column,"Accession Name"),
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
        header: ({column}) => addSortingDropdownFn(column,"Country of Origin"),
        accessorFn: (row) => row["countryOfOrigin.name"],
        accessorKey: "countryOfOrigin.name",
        // Uncommon implamentation of having accessor key and accessor function, could lead to unepxected behaviour
        sortingFn: 'text',
        enableGrouping: true,
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
        header: ({column}) => addSortingDropdownFn(column,"Region"),
        enableGrouping: true,
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
        header: ({column}) => addSortingDropdownFn(column,"Sub-Region"),
        enableGrouping: true,
        meta: {
            filter: {
                type: "text",
                label: "Sub-Region",
                icon: <Map className="size-3.5" />,
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
        header: ({column}) => addSortingDropdownFn(column,"Taxonomy"),
        accessorFn: (row) => row["taxonomy.taxonName"],
        accessorKey: "taxonomy.taxonName",
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
        header: ({column}) => addSortingDropdownFn(column,"Donor Name"),
        accessorKey: "donorName",
        enableGrouping: true,
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
        header: ({column}) => addSortingDropdownFn(column,"Biological status"),
        accessorKey: "sampStat",
        enableGrouping: true,
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
    
