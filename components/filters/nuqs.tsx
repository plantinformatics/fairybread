'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Filters, type Filter, type FilterFieldConfig } from '@/components/ui/filters';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { FunnelX } from 'lucide-react';
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs';

import { columns, PCAPassportData } from '@/config/table-config';
import { fields } from '@/config/filter-config'

export default function NuqsDataGridDemo(
  {PCAPassportData}:{PCAPassportData:any}
) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);

  const [filters, setFilters] = useState<Filter[]>([]);
  const urlDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    };
  }, []);

  // Use nuqs for URL state management with batching
  const [queryStates, setQueryStates] = useQueryStates(
    {
      name: parseAsString,
      email: parseAsString,
      company: parseAsArrayOf(parseAsString),
      role: parseAsArrayOf(parseAsString),
      status: parseAsArrayOf(parseAsString),
      availability: parseAsArrayOf(parseAsString),
      location: parseAsString,
      joined: parseAsString,
      balance: parseAsString,
      balanceMin: parseAsString,
      balanceMax: parseAsString,
    },
    {
      history: 'push',
    },
  );

  // Apply filters to data based on current filters state
  const filteredData = useMemo(() => {
    let filtered = [...PCAPassportData];
    console.log("this is filtered " + filtered)
    // const active = filters.filter((f) => (Array.isArray(f.values) ? f.values.length > 0 : !!f.values));
    // active.forEach((filter) => {
    //   const { field, operator, values } = filter;
    //   filtered = filtered.filter((item) => {
    //     const fieldValue = item[field as keyof PCAPassportData];
    //     switch (operator) {
    //       case 'is':
    //         return values.includes(fieldValue);
    //       case 'is_not':
    //         return !values.includes(fieldValue);
    //       case 'contains':
    //         return values.some((value) => String(fieldValue).toLowerCase().includes(String(value).toLowerCase()));
    //       case 'not_contains':
    //         return !values.some((value) => String(fieldValue).toLowerCase().includes(String(value).toLowerCase()));
    //       case 'equals':
    //         return fieldValue === values[0];
    //       case 'not_equals':
    //         return fieldValue !== values[0];
    //       case 'greater_than':
    //         return Number(fieldValue) > Number(values[0]);
    //       case 'less_than':
    //         return Number(fieldValue) < Number(values[0]);
    //       case 'greater_than_or_equal':
    //         return Number(fieldValue) >= Number(values[0]);
    //       case 'less_than_or_equal':
    //         return Number(fieldValue) <= Number(values[0]);
    //       case 'between':
    //         if (values.length >= 2) {
    //           const min = Number(values[0]);
    //           const max = Number(values[1]);
    //           return Number(fieldValue) >= min && Number(fieldValue) <= max;
    //         }
    //         return true;
    //       case 'not_between':
    //         if (values.length >= 2) {
    //           const min = Number(values[0]);
    //           const max = Number(values[1]);
    //           return Number(fieldValue) < min || Number(fieldValue) > max;
    //         }
    //         return true;
    //       case 'before':
    //         return new Date(String(fieldValue)) < new Date(String(values[0]));
    //       case 'after':
    //         return new Date(String(fieldValue)) > new Date(String(values[0]));
    //       default:
    //         return true;
    //     }
    //   });
    // });
    return filtered;
  }, [filters]);

  const handleFiltersChange = useCallback(
    (newFilters: Filter[]) => {
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));

      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
      urlDebounceRef.current = setTimeout(() => {
        const next: Record<string, string | string[] | null> = {};
        Object.keys(queryStates).forEach((k) => {
          next[k] = null;
        });
        newFilters.forEach(({ field, values }) => {
          if (['company', 'role', 'status', 'availability'].includes(field)) {
            const clean = (values || []).filter((v) => v && String(v).trim() !== '') as string[];
            next[field] = clean.length ? clean : null;
          } else {
            const first = values && values.length > 0 ? String(values[0]) : '';
            next[field] = first && first.trim() !== '' ? first : null;
          }
        });
        setQueryStates(next);
      }, 250);
    },
    [queryStates, setQueryStates],
  );

  const clearFilters = useCallback(() => {
    setFilters([]);
    const clearedStates: Record<string, null> = {};
    Object.keys(queryStates).forEach((key) => {
      clearedStates[key] = null;
    });
    setQueryStates(clearedStates);
  }, [queryStates, setQueryStates]);

  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map((column) => column.id as string));

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
      {/* Filters Section */}
      <div className="flex items-start gap-2.5 mb-5">
        <div className="flex-1">
          <Filters filters={filters} fields={fields} onChange={handleFiltersChange} variant="outline" size="sm" />
        </div>
        {filters.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <FunnelX /> Clear
          </Button>
        )}
      </div>

      {/* Data Grid */}
      <DataGrid
        table={table}
        recordCount={filteredData?.length || 0}
        tableLayout={{
          columnsMovable: true,
        }}
      >
        <div className="w-full space-y-2.5">
          <DataGridContainer>
            <ScrollArea>
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
