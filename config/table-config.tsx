"use client"

import React from "react"
import { Column, ColumnDef } from "@tanstack/react-table"
import { DataGridColumnHeader } from "@/components/ui/data-grid-column-header"

import { 
    CheckCircle,
    CheckCircle2,
    DollarSign,
    MoreHorizontal,
    Text,
    XCircle,
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

export const columns: ColumnDef<PCAPassportData>[] = [
    {
        id: "Genotype ID",
        accessorKey: "genotypeID",
        header: ({column}) => addSortingDropdownFn(column,"Genotype ID"),
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
    },
    {
        id: "Accession Name",
        accessorKey: "accessionName",
        header: ({column}) => addSortingDropdownFn(column,"Accession Name"),
    },
    {
        id: "Country of Origin",
        header: ({column}) => addSortingDropdownFn(column,"Country of Origin"),
        accessorFn: (row) => row["countryOfOrigin.name"],
        accessorKey: "countryOfOrigin.name",
        // Uncommon implamentation of having accessor key and accessor function, could lead to unepxected behaviour
        sortingFn: 'text',
        enableGrouping: true
    },
    {
        id: "Region",
        accessorKey: "region",
        header: ({column}) => addSortingDropdownFn(column,"Region"),
        enableGrouping: true
    },
    {
        id: "Sub-Region",
        accessorKey: "subRegion",
        header: ({column}) => addSortingDropdownFn(column,"Sub-Region"),
        enableGrouping: true
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
    },
    {
        id: "Taxonomy",
        header: ({column}) => addSortingDropdownFn(column,"Taxonomy"),
        accessorFn: (row) => (row as any)["taxonomy.taxonName"],
    },
    {
        id: "Donor Name",
        header: ({column}) => addSortingDropdownFn(column,"Donor Name"),
        accessorKey: "donorName",
        enableGrouping: true
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
    
