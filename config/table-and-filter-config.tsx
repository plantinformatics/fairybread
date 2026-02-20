"use client"

import React from "react"
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
    Tag,
    UserRound,
} from "lucide-react"

export type PCAPassportData = {
    "accessionName": string
    "accessionNumber": string
    "countryOfOrigin.codeNum": string
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
                <a href={"https://www.genesys-pgr.org/" + row.original.doi as string} target="_blank" rel="noopener noreferrer">
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
            <a href={"https://doi.org/" +getValue() as string} target="_blank" rel="noopener noreferrer">
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
        accessorFn: (row) => (row as any)["taxonomy.taxonName"],
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

    // TODO: add alias column
    // {
    //     id: "Alias",
    //     header: "Alias",
    //     accessorKey: "selected",
    //     cell: ({ getValue }) => (
    //         <Checkbox checked={getValue() as boolean} />
    //     )
    // }
]

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
    
