'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { columns } from '@/config/table-and-filter-config';
import { ChevronsUpDown, Group } from 'lucide-react';

const groupingColumns = columns.filter(
  (col): col is (typeof columns)[number] & { accessorKey: string } =>
    col.enableGrouping === true && typeof col.accessorKey === 'string'
);

export function PcaGroupByDropdown({
  groupBy,
  setGroupBy,
}: {
  groupBy: string;
  setGroupBy: (value: string) => void | Promise<unknown>;
}) {
  const onGroupByChange = (value: string) => {
    void setGroupBy(value);
  };

  const options = [
    ...groupingColumns.map((col) => ({
      value: col.accessorKey,
      label: String(col.id),
    })),
    { value: 'textFilter', label: 'Text filter' },
  ];

  const groupByLabel =
    options.find((option) => option.value === groupBy)?.label ??
    (groupBy === 'textFilter' ? 'Text filter' : 'Group by');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <Group className="mr-1 h-4 w-4 shrink-0" />
            <span className="truncate">{groupByLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-medium">Group graph by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={groupBy} onValueChange={onGroupByChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
