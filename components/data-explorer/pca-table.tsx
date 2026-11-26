'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
import { useCustomList } from '@/context/custom-list-context';
import { CUSTOM_LIST_FILTER_KEY } from '@/config/search-params';
import { usePreferences } from '@/context/preferences-context';
import { buildGroupedEntries, buildRowColorMap, TEXT_FILTER_GROUP_BY } from '@/lib/dataProcessing';
import type { FilterFieldConfig } from '@/components/reui/filters';
import { ListChecks } from 'lucide-react';

export function PcaTable({
  rawData,
  isLoading,
  chartSelection, 
  tableFiltered, 
  setTableFiltered,
  groupBy,
  setGroupBy,
}:{
  rawData: PCAPassportData[],
  isLoading: boolean;
  chartSelection: { IID: string[] };
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
  const groupByBeforeTextFilterRef = useRef<string | null>(null);
  const { customList } = useCustomList();
  const { palette } = usePreferences();

  const fieldsWithCustomList = useMemo<FilterFieldConfig[]>(() => {
    const customListField: FilterFieldConfig = {
      key: CUSTOM_LIST_FILTER_KEY,
      label: "Custom List",
      icon: <ListChecks className="size-3.5" />,
      type: "multiselect",
      dataKey: "genotypeID",
      defaultOperator: "is_any_of",
      operators: [
        { value: "is_any_of", label: "is any of" },
        { value: "is_not_any_of", label: "is not any of" },
      ],
      disabled: customList.length === 0,
      options: customList.map((id) => ({ value: id, label: id })),
      defaultValues: customList,
      searchable: true,
      className: "w-56",
    };
    return [...fields, customListField];
  }, [customList]);

  const tableData = useMemo(() => {
    if (chartSelection.IID.length === 0) return rawData;
    const byGenotypeID = new Map(rawData.map((p) => [p.genotypeID, p]));
    return chartSelection.IID
      .map((id) => byGenotypeID.get(id))
      .filter((p): p is PCAPassportData => Boolean(p));
  }, [chartSelection, rawData]);

  const resetToFirstPage = () => setPagination((prev) => ({ ...prev, pageIndex: 0 }));

  const { filters, appliedFilters, filteredData, handleFiltersChange, clearFilters } =
  useTableFilters<PCAPassportData>({
    tableData,
    fields: fieldsWithCustomList,
    onFiltersChange: resetToFirstPage,
  });

  const activeFilterFields = useMemo(() => {
    const fields: string[] = [];
    for (const filter of appliedFilters) {
      const hasValue = (filter.values ?? []).some((value) => String(value).trim() !== "");
      if (!hasValue) continue;
      fields.push(filter.field === CUSTOM_LIST_FILTER_KEY ? "genotypeID" : filter.field);
    }
    return fields;
  }, [appliedFilters]);

  // Filtered columns get value-based colours, not match/no-match, so the table dots stay useful under the text-filter group-by.
  const columnColorMaps = useMemo(() => {
    const maps = new Map<string, Map<string, string>>();
    const fieldsToColor = new Set<string>(activeFilterFields);
    if (groupBy && groupBy !== TEXT_FILTER_GROUP_BY) {
      fieldsToColor.add(groupBy);
    }
    for (const field of fieldsToColor) {
      const groupedEntries = buildGroupedEntries(
        rawData,
        field,
        field === groupBy ? tableFiltered.IID : [],
      );
      maps.set(field, buildRowColorMap(groupedEntries, palette));
    }
    return maps;
  }, [activeFilterFields, groupBy, rawData, tableFiltered, palette]);

  const hasActiveFilter = activeFilterFields.length > 0;

  useEffect(() => {
    if (hasActiveFilter) {
      if (groupBy !== TEXT_FILTER_GROUP_BY) {
        groupByBeforeTextFilterRef.current = groupBy;
        setGroupBy(TEXT_FILTER_GROUP_BY);
      }
      return;
    }

    const groupByBeforeTextFilter = groupByBeforeTextFilterRef.current;
    if (groupByBeforeTextFilter !== null && groupBy === TEXT_FILTER_GROUP_BY) {
      groupByBeforeTextFilterRef.current = null;
      setGroupBy(groupByBeforeTextFilter);
    }
  }, [groupBy, hasActiveFilter, setGroupBy]);

  useEffect(() => {
    setTableFiltered({ IID: filteredData.map((p) => p.genotypeID) });
  }, [filteredData, setTableFiltered]);

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
    meta: {
      groupBy,
      activeFilterFields,
      columnColorMaps,
    },
  });

  return (
    <div className="w-full self-start">
      <PcaTableToolbar
        table={table}
        filters={filters}
        fields={fieldsWithCustomList}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        chartSelection={chartSelection}
      />
      <DataGrid
        table={table}
        recordCount={filteredData?.length || 0}
        isLoading={isLoading}
        loadingMode="spinner"
        loadingMessage="Loading passport data..."
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
