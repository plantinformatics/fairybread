'use client';

import { useState } from 'react';
import { DataGrid, DataGridContainer } from '@/components/reui/data-grid/data-grid';
import { DataGridPagination } from '@/components/reui/data-grid/data-grid-pagination';
import { DataGridTable } from '@/components/reui/data-grid/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { columns, fields, PCAPassportData } from '@/config/table-and-filter-config';
import { useTableFilters } from '@/hooks/use-table-filters';
import { PcaTableToolbar } from '@/components/pca-table-toolbar';

export function PcaTable(
  {rawData, chartSelection}:
  {rawData: PCAPassportData[], chartSelection:any}
) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map((column) => column.id as string));
  const [sorting, setSorting] = useState<SortingState>([{ id: 'Genotype ID', desc: false }]);

  const { filters, filteredData, handleFiltersChange, clearFilters } =
  useTableFilters<PCAPassportData>({
    rawData,
    fields,
    onFiltersChange: () => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
  });

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: PCAPassportData) => row.genotypeID,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full self-start">
      <PcaTableToolbar
        table={table}
        filters={filters}
        fields={fields}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
      />
      <DataGrid
        table={table}
        recordCount={filteredData?.length || 0}
        tableLayout={{
          columnsMovable: true,
          headerSticky: true,
          columnsVisibility: true,
          columnsPinnable: true
        }}
      >
        <div className="space-y-2.5">
          <DataGridContainer>
            <ScrollArea className="h-[80vh]">
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DataGridContainer>
          <DataGridPagination />
        </div>
      </DataGrid>
    </div>
  );
}
