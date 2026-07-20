'use client';

import { Button } from '@/components/ui/button';
import { DataGridColumnVisibility } from '@/components/reui/data-grid/data-grid-column-visibility';
import { Filters, type Filter, type FilterFieldConfig } from '@/components/reui/filters';
import { FunnelX, Plus, Settings2 } from 'lucide-react';
import type { Table } from '@tanstack/react-table';

import { PcaGroupByDropdown } from '@/components/data-explorer/pca-group-by-dropdown';
import { PcaExportDialog } from '@/components/data-explorer/pca-export-dialog';

import { type PCAPassportData } from '@/config/table-and-filter-config';
import posthog from 'posthog-js';

export function PcaTableToolbar({
  table,
  filters,
  fields,
  onFiltersChange,
  onClearFilters,
  groupBy,
  setGroupBy,
  chartSelection,
}: {
  table: Table<PCAPassportData>;
  filters: Filter[];
  fields: FilterFieldConfig[];
  onFiltersChange: (newFilters: Filter[]) => void;
  onClearFilters: () => void;
  groupBy: string;
  setGroupBy: (value: string) => void | Promise<unknown>;
  chartSelection: { IID: string[] };
}) {
  const handleFiltersChange = (newFilters: Filter[]) => {
    if (newFilters.length > filters.length) {
      const added = newFilters[newFilters.length - 1];
      posthog.capture('filter_added', {
        filter_field: added.field,
        filter_operator: added.operator,
        total_filters: newFilters.length,
      });
    }
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    posthog.capture('filters_cleared', { filter_count: filters.length });
    onClearFilters();
  };

  return (
    <div className="mb-5 flex items-start gap-2.5">
      <div className="flex-1">
        <Filters
          filters={filters}
          fields={fields}
          onChange={handleFiltersChange}
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
      <PcaExportDialog
        table={table}
        filters={filters}
        fields={fields}
        chartSelection={chartSelection}
      />
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
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <FunnelX /> Clear
          </Button>
      )}
    </div>
  );
}
