'use client';

import { useState, useTransition } from "react";
import posthog from "posthog-js";
import { toast } from "sonner";

import { refreshDatasetCache } from "@/app/settings/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PCAFileInfo, getSubsetNames } from "@/config/pca-location-config";

const ALL = '__all__';
const CROPS = Array.from(PCAFileInfo.keys());

/** Settings card that expires the server's cached data for a crop/subset so the latest is fetched. */
export function RefreshDataCache() {
  const [crop, setCrop] = useState<string>(ALL);
  const [subset, setSubset] = useState<string>(ALL);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const subsets = crop === ALL ? [] : getSubsetNames(crop);
  const scopeLabel =
    crop === ALL ? 'every crop' : subset === ALL ? `every ${crop} dataset` : `${crop} – ${subset}`;

  const handleCropChange = (value: string | null) => {
    if (!value) return;
    setCrop(value);
    setSubset(ALL);
  };

  const handleConfirm = () => {
    const targetCrop = crop === ALL ? undefined : crop;
    const targetSubset = subset === ALL ? undefined : subset;
    startTransition(async () => {
      try {
        await refreshDatasetCache(targetCrop, targetSubset);
        posthog.capture('data_cache_refreshed', { crop: targetCrop ?? 'all', subset: targetSubset ?? 'all' });
        setOpen(false);
        // The data explorer keeps already-loaded data in memory, so a full page load is needed to see the update
        const params = new URLSearchParams({
          ...(targetCrop && { file: targetCrop }),
          ...(targetSubset && { subset: targetSubset }),
        });
        toast.success(`Cached data cleared for ${scopeLabel}`, {
          description: 'The next load fetches the latest data, so it will be slower than usual.',
          action: {
            label: 'Open data explorer',
            onClick: () => window.location.assign(`/data-explorer${params.size ? `?${params}` : ''}`),
          },
        });
      } catch (error) {
        toast.error('Could not clear cached data', {
          description: error instanceof Error ? error.message : undefined,
        });
      }
    });
  };

  return (
    <div className="mt-6 rounded-xl border p-5">
      <label className="block text-sm font-medium">Refresh data</label>
      <p className="mt-1 text-sm text-muted-foreground">
        Data is cached for up to a day. Refresh it after Genolink passport data or the PCA files
        change so everyone sees the latest version.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Crop</label>
          <Select value={crop} onValueChange={handleCropChange}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue>{(value: string) => (value === ALL ? 'All crops' : value)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All crops</SelectItem>
              {CROPS.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Subset</label>
          <Select value={subset} onValueChange={(value) => value && setSubset(value)} disabled={crop === ALL}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue>{(value: string) => (value === ALL ? 'All subsets' : value)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All subsets</SelectItem>
              {subsets.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <Button className="mt-4" variant="destructive" size="sm" onClick={() => setOpen(true)}>
          Refresh data
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refresh data for {scopeLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears the cached data for everyone using the app, not just you. The next load
              of each affected dataset fetches everything again from Genolink and the PCA file
              store, which can take a minute or more. Only do this when the source data has changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirm} disabled={isPending}>
              {isPending ? 'Refreshing…' : 'Refresh data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
