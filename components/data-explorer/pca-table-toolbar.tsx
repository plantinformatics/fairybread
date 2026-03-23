'use client';

import { Button } from '@/components/ui/button';
import { DataGridColumnVisibility } from '@/components/reui/data-grid/data-grid-column-visibility';
import { Filters, type Filter, type FilterFieldConfig } from '@/components/reui/filters';
import { FunnelX, Plus, Settings2 } from 'lucide-react';
import type { Table } from '@tanstack/react-table';

import { PcaGroupByDropdown } from '@/components/data-explorer/pca-group-by-dropdown';

import { type PCAPassportData } from '@/config/table-and-filter-config';

export function PcaTableToolbar({
  table,
  filters,
  fields,
  onFiltersChange,
  onClearFilters,
  groupBy,
  setGroupBy,
}: {
  table: Table<PCAPassportData>;
  filters: Filter[];
  fields: FilterFieldConfig[];
  onFiltersChange: (newFilters: Filter[]) => void;
  onClearFilters: () => void;
  groupBy: string;
  setGroupBy: (value: string) => void | Promise<unknown>;
}) {
  return (
    <div className="mb-5 flex items-start gap-2.5">
      <div className="flex-1">
        <Filters
          filters={filters}
          fields={fields}
          onChange={onFiltersChange}
          showSearchInput={true}
          size="sm"
          trigger={
            <Button variant="outline" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Filter
            </Button>
          }
        />
      </div>
      <DataGridColumnVisibility
        table={table}
        trigger={
          <Button variant="outline" size="sm">
            <Settings2 className="mr-1 h-4 w-4" />
            Columns
          </Button>
        }
      />
      <PcaGroupByDropdown 
        groupBy={groupBy} 
        setGroupBy={setGroupBy} />
        {filters.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <FunnelX /> Clear
          </Button>
      )}
    </div>
  );
}
