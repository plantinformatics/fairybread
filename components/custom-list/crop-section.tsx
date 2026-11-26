'use client';

import { Sprout } from 'lucide-react';
import { PCAFileInfo, getDatasetInfo } from '@/config/pca-location-config';
import { usePcaData } from '@/context/pca-data-context';
import DatasetCitations from '@/components/dataset-citations';
import { SectionCard } from '@/components/custom-list/section-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CropSection() {
  const cropOptions = Array.from(PCAFileInfo.keys());
  const { file, setFile, subset } = usePcaData();

  return (
    <SectionCard
      icon={<Sprout className="size-4 text-muted-foreground" />}
      title="Crop"
      headerEnd={
        <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          Dataset:
          <DatasetCitations
            citations={(file && getDatasetInfo(file, subset)?.citations) || []}
            className="font-medium text-foreground underline-offset-4"
          />
        </span>
      }
    >
      <Select value={file ?? 'Wheat'} onValueChange={(val) => val !== null && setFile(val)}>
        <SelectTrigger className="w-48" size="sm">
          <SelectValue placeholder="Select crop" />
        </SelectTrigger>
        <SelectContent>
          {cropOptions.map((crop) => (
            <SelectItem key={crop} value={crop}>
              {crop}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SectionCard>
  );
}
