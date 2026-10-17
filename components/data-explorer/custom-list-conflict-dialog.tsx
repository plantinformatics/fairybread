'use client';

import { useEffect } from 'react';
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCustomList } from '@/context/custom-list-context';

// Reconciles a `?customList=` filter in the URL with the stored custom list,
// once the plot data has loaded. A URL list with IDs outside the stored list
// prompts the user to replace or keep their stored list.
export function CustomListConflictDialog({ isPlotReady }: { isPlotReady: boolean }) {
  const { customList, setCustomList, isHydrated } = useCustomList();
  // Same key the "Custom List" table filter writes to.
  const [urlCustomList, setUrlCustomList] = useQueryState('customList', parseAsArrayOf(parseAsString));
  const isReady = isHydrated && isPlotReady;
  const incomingList = urlCustomList ?? [];

  // An empty stored list has nothing to conflict with, so adopt the URL list.
  useEffect(() => {
    if (isReady && customList.length === 0 && urlCustomList && urlCustomList.length > 0) {
      setCustomList(urlCustomList);
    }
  }, [isReady, customList, urlCustomList, setCustomList]);

  // A subset is a valid filter over the stored list, so only a URL list with
  // IDs outside the stored list is a conflict. Both actions below make the URL
  // a subset again, which closes the dialog.
  const stored = new Set(customList);
  const hasConflict =
    isReady && customList.length > 0 && incomingList.some((id) => !stored.has(id));

  const replaceWithIncoming = () => setCustomList(incomingList);

  // Point the URL filter at the stored list so the plot matches it.
  const keepStored = () => {
    setUrlCustomList(customList, { history: 'replace' });
  };

  return (
    <AlertDialog open={hasConflict} onOpenChange={(open) => { if (!open) keepStored(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Replace custom list?</AlertDialogTitle>
          <AlertDialogDescription>
            This link contains a different custom list. Replacing will override your existing list.
            Existing list: {customList.length} genotype IDs. Incoming list: {incomingList.length} genotype IDs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep existing</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={replaceWithIncoming}>Replace</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
