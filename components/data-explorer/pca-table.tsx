'use client';

import { useState, useEffect } from 'react';
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
import { PcaTableToolbar } from '@/components/data-explorer/pca-table-toolbar';

export function PcaTable({
  rawData, 
  chartSelection, 
  setChartSelection, 
  tableFiltered, 
  setTableFiltered,
  groupBy,
  setGroupBy,
}:{
  rawData: PCAPassportData[], 
  chartSelection: { IID: string[] };
  setChartSelection: React.Dispatch<React.SetStateAction<{ IID: string[] }>>;
  tableFiltered: { IID: string[] };
  setTableFiltered: React.Dispatch<React.SetStateAction<{ IID: string[] }>>;
  groupBy: string;
  setGroupBy: (value: string) => void | Promise<unknown>;
}) 
{
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map((column) => column.id as string));
  const [sorting, setSorting] = useState<SortingState>([{ id: 'Genotype ID', desc: false }]);
  const [tableData, setTableData] = useState<PCAPassportData[]>([])

  // Chart selection logic
  useEffect(() => {
    const byGenotypeID = new Map(rawData.map((p) => [p.genotypeID, p]));
    const plotSelectedData =
      chartSelection.IID.length > 0
        ? chartSelection.IID.map((id) => byGenotypeID.get(id)).filter(Boolean) as PCAPassportData[]
        : rawData;
    setTableData(plotSelectedData);
  }, [chartSelection, rawData]);

  // logging for selection remove later
  useEffect(() => {
    console.log("Table data has changed:", tableData)
  }, [tableData])

  // Filter logic
  const { filters, filteredData, handleFiltersChange, clearFilters } =
  useTableFilters<PCAPassportData>({
    tableData,
    fields,
    onFiltersChange: () => { // resert page to 0 when a filter is applied
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
  });

  // Used to create the subset for pca-plot
  useEffect(() => {
    const byGenotypeID = { IID: filteredData.map((p:any) => p.genotypeID)}
    setTableFiltered(byGenotypeID)
    // add something here to set the group by to text filter
  }, [filteredData])

  // logging please remove later
  useEffect(() => {
    console.log("TableFiltered has changed", tableFiltered)
  }, [tableFiltered])

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
        groupBy={groupBy}
        setGroupBy={setGroupBy}
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
