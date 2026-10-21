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
import { GROUP_BY_OPTIONS, TEXT_FILTER_GROUP_BY } from '@/lib/view-url';
import { ChevronsUpDown, Group } from 'lucide-react';
import posthog from 'posthog-js';

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

  const groupByLabel =
    GROUP_BY_OPTIONS.find((option) => option.value === groupBy)?.label ??
    (groupBy === TEXT_FILTER_GROUP_BY ? 'Text filter' : 'Group by');

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
            {GROUP_BY_OPTIONS.map((option) => (
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
