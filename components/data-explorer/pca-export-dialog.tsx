'use client';

import { useMemo, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Filter, FilterFieldConfig } from '@/components/reui/filters';
import type { PCAPassportData } from '@/config/table-and-filter-config';
import { downloadCSV, toCSV } from '@/lib/csv-export';
import { cn } from '@/lib/utils';

export function PcaExportDialog({
  table,
  filters,
  fields,
  chartSelection,
}: {
  table: Table<PCAPassportData>;
  filters: Filter[];
  fields: FilterFieldConfig[];
  chartSelection: { IID: string[] };
}) {
  const [open, setOpen] = useState(false);

  const visibleColumns = table.getVisibleLeafColumns();
  const toggleableColumns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== 'undefined' && column.getCanHide()
    );
  const rowCount = table.getSortedRowModel().rows.length;

  const fieldsByKey = useMemo(() => {
    const map: Record<string, FilterFieldConfig> = {};
    fields.forEach((field) => {
      if (field.key) map[field.key] = field;
    });
    return map;
  }, [fields]);

  const handleExport = () => {
    const rows = table.getSortedRowModel().rows;
    const header = visibleColumns.map((column) => column.id);
    const body = rows.map((row) =>
      visibleColumns.map((column) => row.getValue(column.id))
    );
    downloadCSV(`pca-export-${Date.now()}.csv`, toCSV(header, body));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Wizard</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <section>
            <h4 className="mb-1.5 font-medium">Columns</h4>
            <div className="flex flex-wrap gap-1.5">
              {toggleableColumns.map((column) => {
                const isVisible = column.getIsVisible();
                return (
                  <button
                    key={column.id}
                    type="button"
                    aria-pressed={isVisible}
                    onClick={() => column.toggleVisibility(!isVisible)}
                    className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-medium capitalize transition-colors',
                      isVisible
                        ? 'bg-success/10 text-success-foreground hover:bg-success/20 dark:bg-success/20 dark:hover:bg-success/30'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    )}
                  >
                    {column.columnDef.meta?.headerTitle || column.id}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h4 className="mb-1.5 font-medium">Filters</h4>
            {filters.length === 0 ? (
              <p className="text-muted-foreground">No filters applied.</p>
            ) : (
              <ul className="space-y-1">
                {filters.map((filter) => (
                  <li key={filter.id} className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {fieldsByKey[filter.field]?.label ?? filter.field}
                    </span>{' '}
                    {filter.operator.replace(/_/g, ' ')}
                    {filter.values?.length
                      ? ` "${filter.values.join(', ')}"`
                      : ''}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h4 className="mb-1.5 font-medium">Plot Selection</h4>
            {chartSelection.IID.length === 0 ? (
              <p className="text-muted-foreground">
                No selection made in plot.
              </p>
            ) : (
              <p className="text-muted-foreground">
                {chartSelection.IID.length} point(s) selected in plot.
              </p>
            )}
          </section>
        </div>

        <p className="text-right text-sm font-medium">
          Total rows to export: {rowCount}
        </p>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button onClick={handleExport}>Export to CSV</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
