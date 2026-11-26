'use client';

import { ChevronDown, Layers, Sprout } from "lucide-react"
import DatasetCitations from "@/components/dataset-citations"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ALL_ACCESSIONS_SUBSET, PCAFileInfo, getDatasetInfo, getSubsetNames } from "@/config/pca-location-config";
import { usePcaData } from "@/context/pca-data-context";

export default function BreadCrumbNav() {
  const cropOptions = Array.from(PCAFileInfo.keys());
  const {
    file: selectedCrop,
    setFile: setSelectedCrop,
    subset: selectedSubset,
    setSubset: setSelectedSubset,
  } = usePcaData();
  const subsetOptions = getSubsetNames(selectedCrop ?? "Wheat");
  const selectedFileInfo = getDatasetInfo(selectedCrop ?? "Wheat", selectedSubset ?? ALL_ACCESSIONS_SUBSET)
    ?? getDatasetInfo("Wheat", ALL_ACCESSIONS_SUBSET);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/"
            className="text-foreground font-semibold tracking-tight text-base"
          >
            FairyBread
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center">
              <span className="inline-flex h-8 min-w-30 items-center gap-1.5 rounded-md border bg-background px-2 text-sm shadow-xs hover:bg-muted/60">
                <Sprout className="size-3.5 text-muted-foreground" />
                <span className="flex-1 text-left font-medium text-foreground">
                  {selectedCrop || "Select crop"}
                </span>
                <ChevronDown className="size-3.5 shrink-0" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {cropOptions.map((crop) => (
                <DropdownMenuItem
                  key={crop}
                  onClick={() => {
                    void setSelectedCrop(crop);
                  }}
                >
                  {crop}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DatasetCitations
            citations={selectedFileInfo?.citations ?? []}
            className="max-w-[30vw] text-foreground"
          />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center">
              <span className="inline-flex h-8 min-w-30 items-center gap-1.5 rounded-md border bg-background px-2 text-sm shadow-xs hover:bg-muted/60">
                <Layers className="size-3.5 text-muted-foreground" />
                <span className="flex-1 text-left font-medium text-foreground">
                  {selectedSubset || ALL_ACCESSIONS_SUBSET}
                </span>
                <ChevronDown className="size-3.5 shrink-0" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {subsetOptions.map((subset) => (
                <DropdownMenuItem
                  key={subset}
                  onClick={() => {
                    void setSelectedSubset(subset);
                  }}
                >
                  {subset}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}