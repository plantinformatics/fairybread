"use client";

import * as React from "react";
import {
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/ui/data-grid-table";

type DemoRow = {
  id: string;
  accession: string;
  region: string;
  status: "Active" | "Dormant";
};

const demoRows: DemoRow[] = [
  { id: "1", accession: "WB-001", region: "South Asia", status: "Active" },
  { id: "2", accession: "WB-002", region: "East Africa", status: "Dormant" },
  { id: "3", accession: "WB-003", region: "Central Europe", status: "Active" },
  { id: "4", accession: "WB-004", region: "North America", status: "Active" },
  { id: "5", accession: "WB-005", region: "Middle East", status: "Dormant" },
  { id: "6", accession: "WB-006", region: "South America", status: "Active" },
];

const columns: ColumnDef<DemoRow>[] = [
  {
    id: "select",
    header: () => <DataGridTableRowSelectAll />,
    cell: ({ row }) => <DataGridTableRowSelect row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "accession",
    header: "Accession",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

export default function CheckboxDemoPage() {
  const [checked, setChecked] = React.useState(true);
  const [indeterminate, setIndeterminate] = React.useState(true);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useReactTable({
    data: demoRows,
    columns,
    state: {
      pagination,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  return (
    <div className="p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Checkbox Demo</h1>
        <p className="text-sm text-muted-foreground">
          Visual check for checked and indeterminate states, plus DataGrid row selection.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">State Preview</h2>
        <div className="flex flex-wrap items-center gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <Checkbox checked={checked} onCheckedChange={(value) => setChecked(Boolean(value))} />
            Checked
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <Checkbox
              checked={indeterminate}
              indeterminate={indeterminate}
              onCheckedChange={(value) => {
                const next = Boolean(value);
                setIndeterminate(next);
              }}
            />
            Indeterminate
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">DataGrid Selection Demo</h2>
        <DataGrid table={table} recordCount={demoRows.length}>
          <div className="space-y-2.5">
            <DataGridContainer>
              <DataGridTable />
            </DataGridContainer>
            <DataGridPagination />
          </div>
        </DataGrid>
      </section>
    </div>
  );
}
