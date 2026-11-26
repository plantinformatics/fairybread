'use client';

import { ListChecks, X } from 'lucide-react';
import posthog from 'posthog-js';
import { useCustomList } from '@/context/custom-list-context';
import { usePcaData } from '@/context/pca-data-context';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/custom-list/section-card';

export function CustomListAside() {
  const { file } = usePcaData();
  const { customList, setCustomList } = useCustomList();

  return (
    <aside>
      <SectionCard
        icon={<ListChecks className="size-4 text-muted-foreground" />}
        title="Custom list"
        count={{ value: customList.length, tone: 'primary' }}
        className="lg:sticky lg:top-6"
        bodyClassName="max-h-[calc(100vh-8rem)] overflow-y-auto"
        headerEnd={
          customList.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                posthog.capture('custom_list_cleared', { crop: file, list_size: customList.length });
                setCustomList([]);
              }}
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )
        }
      >
        {customList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No genotype IDs yet. Paste a list and click{' '}
            <span className="font-medium text-foreground">Parse</span> to populate.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {customList.map((term, i) => (
              <li
                key={`${term}-${i}`}
                className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 font-mono text-xs text-foreground/80 transition-colors"
              >
                {term}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </aside>
  );
}
