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
import { columns, groupByLabel } from '@/config/table-and-filter-config';
import { TEXT_FILTER_GROUP_BY } from '@/lib/dataProcessing';
import { ChevronsUpDown, Group } from 'lucide-react';
import posthog from 'posthog-js';

const groupingAccessorKeys = columns
  .filter((col) => col.enableGrouping === true)
  .map((col) => col.accessorKey)
  .filter((key) => key !== undefined);

export function PcaGroupByDropdown({
  groupBy,
  setGroupBy,
}: {
  groupBy: string;
  setGroupBy: (value: string) => void | Promise<unknown>;
}) {
  const onGroupByChange = (value: string) => {
    posthog.capture('group_by_changed', { group_by: value, previous_group_by: groupBy });
    void setGroupBy(value);
  };

  const options = [...groupingAccessorKeys, TEXT_FILTER_GROUP_BY].map((value) => ({
    value,
    label: groupByLabel(value),
  }));

  const triggerLabel = options.find((option) => option.value === groupBy)?.label ?? 'Group by';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <Group className="mr-1 h-4 w-4 shrink-0" />
            <span className="truncate">{triggerLabel}</span>
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
