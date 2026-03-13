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
import { Group } from 'lucide-react';

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

  const groupByLabel =
    groupingColumns.find((col) => col.accessorKey === groupBy)?.id ??
    (groupBy === 'textFilter' ? 'Text filter' : groupBy === 'null' ? 'No grouping' : 'Group by');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <Group className="mr-1 h-4 w-4" />
            {groupByLabel}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-medium">Group graph by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={groupBy} onValueChange={onGroupByChange}>
            {groupingColumns.map((col) => (
              <DropdownMenuRadioItem key={col.id as string} value={col.accessorKey}>
                {String(col.id)}
              </DropdownMenuRadioItem>
            ))}
            <DropdownMenuRadioItem value="textFilter">Text filter</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="null">No grouping</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
